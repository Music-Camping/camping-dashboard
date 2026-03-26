import type {
  CompanyInfo,
  DashboardResponse,
  PerformerData,
  MetricData,
} from "@/lib/types/dashboard";
import { cookies } from "next/headers";

/**
 * Track from the spotify/tracks API after processing.
 * Playlist-level structure: { [playlistOrPerformerName]: { tracks: Track[] } }
 */
export interface SpotifyTrackRaw {
  name: string;
  external_id: string;
  url?: string;
  thumbnail?: string;
  plays: MetricData;
}

export type SpotifyTracksResponse = Record<
  string,
  { tracks: SpotifyTrackRaw[] }
>;

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
/**
 * Aggregates a performer's transformed metrics into a running total.
 * Tags each entry with the performer name for downstream filtering.
 */
function aggregatePerformerInto(
  target: Record<string, Record<string, MetricData>>,
  source: Partial<PerformerData>,
  performerName: string,
): void {
  const platformKeys = ["youtube", "instagram", "spotify"] as const;

  platformKeys.forEach((platformKey) => {
    const platformData = source[platformKey];
    if (!platformData) return;

    const platformTarget = target[platformKey] ?? {};
    // eslint-disable-next-line no-param-reassign
    target[platformKey] = platformTarget;

    Object.entries(platformData).forEach(([metricKey, metricData]) => {
      const md = metricData as MetricData;
      if (!md?.entries) return;

      if (!platformTarget[metricKey]) {
        platformTarget[metricKey] = { latest: 0, entries: [] };
      }

      platformTarget[metricKey].latest += md.latest;
      platformTarget[metricKey].entries.push(
        ...md.entries.map((e) => ({ ...e, performer: performerName })),
      );
    });
  });
}

function processCompanyAndPerformers(
  rawData: Record<string, unknown>,
): DashboardResponse | null {
  const processedData: Record<string, unknown> = {};
  const allPerformerNames: string[] = [];
  const companies: CompanyInfo[] = [];

  // Aggregated metrics across all performers (for company-level totals)
  const aggregated: Record<string, Record<string, MetricData>> = {};

  Object.entries(rawData).forEach(([companyName, companyData]) => {
    if (typeof companyData !== "object" || companyData === null) return;

    const company = companyData as Record<string, unknown>;
    const companyPerformerNames: string[] = [];

    // Extract performers from the "performers" key
    const { performers } = company;
    if (typeof performers !== "object" || performers === null) return;

    Object.entries(performers as Record<string, unknown>).forEach(
      ([performerName, performerRaw]) => {
        if (typeof performerRaw !== "object" || performerRaw === null) return;

        const performer = performerRaw as Record<string, unknown>;
        allPerformerNames.push(performerName);
        companyPerformerNames.push(performerName);

        // Transform performer metrics and attach files
        const transformedData: Record<string, unknown> = {};

        if (performer.metrics && typeof performer.metrics === "object") {
          const transformed = transformPerformerMetrics(
            performer.metrics as Record<string, Record<string, MetricData>>,
          );
          Object.assign(transformedData, transformed);

          // Aggregate into company totals
          aggregatePerformerInto(aggregated, transformed, performerName);
        }

        if (performer.files && typeof performer.files === "object") {
          transformedData.files = performer.files;
        }

        processedData[performerName] = transformedData;
      },
    );

    if (companyPerformerNames.length > 0) {
      const companyInfo: CompanyInfo = {
        name: companyName,
        performers: companyPerformerNames,
      };
      if (company.files && typeof company.files === "object") {
        companyInfo.files = company.files as Record<string, string>;
      }
      companies.push(companyInfo);
    }
  });

  // Build company entry: aggregated performer metrics + metadata
  if (allPerformerNames.length > 0) {
    processedData.company = {
      ...aggregated,
      performers: allPerformerNames,
      companies,
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
 * Processes raw spotify tracks API response.
 *
 * API format: { "<Company>": { "<PlaylistOrPerformer>": { "tracks": [...] } } }
 * Output:     { "<PlaylistOrPerformer>": { tracks: SpotifyTrackRaw[] }, ... }
 */
function processSpotifyTracks(
  rawData: Record<string, unknown>,
): SpotifyTracksResponse | null {
  const result: SpotifyTracksResponse = {};

  Object.values(rawData).forEach((companyData) => {
    if (typeof companyData !== "object" || companyData === null) return;

    Object.entries(companyData as Record<string, unknown>).forEach(
      ([name, entityData]) => {
        if (typeof entityData !== "object" || entityData === null) return;

        const entity = entityData as Record<string, unknown>;
        if (!Array.isArray(entity.tracks)) return;

        result[name] = {
          tracks: entity.tracks as SpotifyTrackRaw[],
        };
      },
    );
  });

  return Object.keys(result).length > 0 ? result : null;
}

/**
 * Fetches Spotify tracks data server-side with 3-hour cache
 */
export async function getSpotifyTracksData(): Promise<SpotifyTracksResponse | null> {
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
    return processSpotifyTracks(rawData as Record<string, unknown>);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("[API Error] Failed to fetch Spotify tracks data:", error);
    return null;
  }
}
