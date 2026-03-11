import type {
  DashboardResponse,
  PerformerData,
  MetricData,
} from "@/lib/types/dashboard";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.API_URL || "http://localhost:3001";
const REVALIDATE_TIME = 10800; // 3 horas em segundos

/**
 * Maps raw API metric names to frontend PlatformMetrics keys.
 *
 * API uses platform-prefixed names (e.g. "youtube_subscribers"),
 * frontend uses generic names (e.g. "followers").
 */
const METRIC_NAME_MAP: Record<string, Record<string, string>> = {
  youtube: {
    youtube_subscribers: "followers",
    youtube_total_views: "views",
    youtube_video_count: "video_count",
  },
  instagram: {
    instagram_followers: "followers",
    instagram_posts_count: "post_count",
  },
  spotify_artist: {
    spotify_monthly_listeners: "monthly_listeners",
    spotify_top_city_listeners: "top_city_listeners",
    spotify_followers: "followers",
  },
  spotify_playlist: {
    spotify_playlist_total_tracks: "track_count",
    spotify_playlist_followers: "followers",
  },
};

/**
 * Maps raw API platform keys to frontend PerformerData keys.
 */
const PLATFORM_KEY_MAP: Record<string, string> = {
  youtube: "youtube",
  instagram: "instagram",
  spotify_artist: "spotify",
};

/**
 * Transforms raw API metrics into frontend PlatformMetrics shape.
 *
 * Input:  { "youtube_subscribers": MetricData, "youtube_video_count": MetricData }
 * Output: { "followers": MetricData, "video_count": MetricData }
 */
function transformMetrics(
  platformKey: string,
  rawMetrics: Record<string, MetricData>,
): Record<string, MetricData> {
  const mapping = METRIC_NAME_MAP[platformKey];
  if (!mapping) return rawMetrics;

  const transformed: Record<string, MetricData> = {};
  Object.entries(rawMetrics).forEach(([metricName, metricData]) => {
    const mappedName = mapping[metricName] ?? metricName;
    transformed[mappedName] = metricData;
  });
  return transformed;
}

/**
 * Transforms a raw performer's metrics object into PerformerData shape.
 *
 * Input (raw API):
 *   { spotify_artist: { spotify_followers: MetricData }, youtube: { youtube_subscribers: MetricData } }
 *
 * Output (frontend):
 *   { spotify: { followers: MetricData }, youtube: { followers: MetricData } }
 */
function transformPerformerMetrics(
  rawMetrics: Record<string, Record<string, MetricData>>,
): Partial<PerformerData> {
  const result: Record<string, unknown> = {};

  Object.entries(rawMetrics).forEach(([platformKey, metrics]) => {
    const frontendKey = PLATFORM_KEY_MAP[platformKey] ?? platformKey;
    result[frontendKey] = transformMetrics(platformKey, metrics);
  });

  return result as Partial<PerformerData>;
}

/**
 * Processes raw API response into structured DashboardResponse
 *
 * API format (nested):
 * {
 *   "<Company>": {
 *     "files": {}, "metrics": {},
 *     "performers": {
 *       "<Performer>": {
 *         "files": {}, "metrics": { "<platform>": { "<metric>": MetricData } }
 *       }
 *     }
 *   }
 * }
 *
 * Transforms into flat DashboardResponse:
 * { company: CompanyData, "Performer1": PerformerData, ... }
 */
function processCompanyAndPerformers(
  rawData: Record<string, unknown>,
): DashboardResponse | null {
  const processedData: Record<string, unknown> = {};
  const performerNames: string[] = [];
  let companyMetrics: Partial<PerformerData> = {};

  Object.entries(rawData).forEach(([, companyData]) => {
    if (typeof companyData !== "object" || companyData === null) return;

    const company = companyData as Record<string, unknown>;

    // Transform company-level metrics if present
    if (
      company.metrics &&
      typeof company.metrics === "object" &&
      Object.keys(company.metrics as object).length > 0
    ) {
      companyMetrics = transformPerformerMetrics(
        company.metrics as Record<string, Record<string, MetricData>>,
      );
    }

    // Extract performers from the "performers" key
    const { performers } = company;
    if (typeof performers !== "object" || performers === null) return;

    Object.entries(performers as Record<string, unknown>).forEach(
      ([performerName, performerRaw]) => {
        if (typeof performerRaw !== "object" || performerRaw === null) return;

        const performer = performerRaw as Record<string, unknown>;
        performerNames.push(performerName);

        // Transform performer metrics and attach files
        const performerData: Record<string, unknown> = {};

        if (performer.metrics && typeof performer.metrics === "object") {
          Object.assign(
            performerData,
            transformPerformerMetrics(
              performer.metrics as Record<string, Record<string, MetricData>>,
            ),
          );
        }

        if (performer.files && typeof performer.files === "object") {
          performerData.files = performer.files;
        }

        processedData[performerName] = performerData;
      },
    );
  });

  // Build company entry: aggregated company metrics + performers list
  if (performerNames.length > 0) {
    processedData.company = {
      ...companyMetrics,
      performers: performerNames,
    };
  }

  return (processedData as DashboardResponse) || null;
}

/**
 * Fetches dashboard data server-side with 3-hour cache
 */
export async function getDashboardData(): Promise<DashboardResponse | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;

    if (!token) {
      return null;
    }

    const res = await fetch(`${BACKEND_URL}/api/dashboard`, {
      next: { revalidate: REVALIDATE_TIME },
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      // eslint-disable-next-line no-console
      console.error(`[API Error] GET /api/dashboard returned ${res.status}`);
      return null;
    }

    const rawData = await res.json();
    return processCompanyAndPerformers(rawData as Record<string, unknown>);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("[API Error] Failed to fetch dashboard data:", error);
    return null;
  }
}

/**
 * Fetches Spotify data server-side with 3-hour cache
 */
export async function getSpotifyData() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;

    if (!token) {
      return null;
    }

    const res = await fetch(`${BACKEND_URL}/api/spotify`, {
      next: { revalidate: REVALIDATE_TIME },
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      return null;
    }

    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Fetches championships data server-side with 3-hour cache
 */
export async function getChampionshipsData() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;

    if (!token) {
      return [];
    }

    const res = await fetch(`${BACKEND_URL}/api/championships`, {
      next: { revalidate: REVALIDATE_TIME },
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      return [];
    }

    return await res.json();
  } catch {
    return [];
  }
}

/**
 * Fetches music catalog data server-side with 3-hour cache
 */
export async function getMusicCatalogData() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;

    if (!token) {
      return [];
    }

    const res = await fetch(`${BACKEND_URL}/api/dashboard/songs`, {
      next: { revalidate: REVALIDATE_TIME },
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      return [];
    }

    return await res.json();
  } catch {
    return [];
  }
}

/**
 * Fetches Spotify tracks data server-side with 3-hour cache
 */
export async function getSpotifyTracksData(): Promise<DashboardResponse | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;

    if (!token) {
      return null;
    }

    const res = await fetch(`${BACKEND_URL}/api/dashboard/spotify/tracks`, {
      next: { revalidate: REVALIDATE_TIME },
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      // eslint-disable-next-line no-console
      console.error(
        `[API Error] GET /api/dashboard/spotify/tracks returned ${res.status}`,
      );
      return null;
    }

    const rawData = await res.json();
    return processCompanyAndPerformers(rawData as Record<string, unknown>);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("[API Error] Failed to fetch Spotify tracks data:", error);
    return null;
  }
}
