import type { DashboardResponse, PerformerData } from "@/lib/types/dashboard";
import { RawApiResponseSchema, validateData } from "@/lib/api/schemas";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.API_URL || "http://localhost:3001";
const REVALIDATE_TIME = 10800; // 3 horas em segundos

/**
 * Transforms nested metrics { platform: { metric: MetricData } }
 * into flat PerformerData { platform: { metric: MetricData } }
 *
 * The new API wraps platform data under "metrics", this unwraps it
 * and maps to known platform keys (youtube, instagram, spotify)
 */
function transformMetricsToPerformerData(
  metrics: Record<string, Record<string, unknown>>,
  files?: Record<string, string>,
): PerformerData {
  const result: Record<string, unknown> = {};

  Object.entries(metrics).forEach(([platform, platformMetrics]) => {
    result[platform] = platformMetrics;
  });

  if (files) {
    result.files = files;
  }

  return result as PerformerData;
}

/**
 * Processes raw API response (new nested format) into structured DashboardResponse
 *
 * New API format:
 * { "<Company>": { files, metrics, performers: { "<Performer>": { files, metrics } } } }
 *
 * Transforms into flat DashboardResponse:
 * { company: CompanyData, "Performer1": PerformerData, "Performer2": PerformerData }
 */
function processCompanyAndPerformers(
  rawData: Record<string, unknown>,
): DashboardResponse | null {
  const validated = validateData(
    rawData,
    RawApiResponseSchema,
    "GET /api/dashboard",
  );

  if (!validated) {
    // eslint-disable-next-line no-console
    console.error("[API] Failed to validate new API format");
    return null;
  }

  const companyNames = Object.keys(validated);
  if (companyNames.length === 0) {
    return null;
  }

  const companyName = companyNames[0];
  const companyApiData = validated[companyName];

  const processedData: Record<string, unknown> = {};
  const performerNames: string[] = [];

  // Transform company metrics → "total" equivalent
  const companyPerformerData = transformMetricsToPerformerData(
    companyApiData.metrics,
    companyApiData.files,
  );

  // Flatten each performer
  Object.entries(companyApiData.performers).forEach(
    ([performerName, performerApiData]) => {
      performerNames.push(performerName);
      processedData[performerName] = transformMetricsToPerformerData(
        performerApiData.metrics,
        performerApiData.files,
      );
    },
  );

  // Build company entry with performers list
  processedData.company = {
    ...companyPerformerData,
    performers: performerNames,
  };

  return processedData as DashboardResponse;
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
