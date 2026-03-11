import type { DashboardResponse } from "@/lib/types/dashboard";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.API_URL || "http://localhost:3001";
const REVALIDATE_TIME = 10800; // 3 horas em segundos

/**
 * Processes raw API response into structured DashboardResponse
 *
 * API format:
 * { "total": { platform: metrics }, "<Company>": { "<Performer>": { platform: metrics } } }
 *
 * Transforms into flat DashboardResponse:
 * { company: CompanyData, "Performer1": PerformerData, ... }
 */
function processCompanyAndPerformers(
  rawData: Record<string, unknown>,
): DashboardResponse | null {
  const processedData: Record<string, unknown> = {};
  const performerNames: string[] = [];

  Object.entries(rawData).forEach(([key, data]) => {
    // Keep "total" as company-level aggregate
    if (key === "total") {
      processedData.total = data;
      return;
    }

    // Skip if not an object
    if (typeof data !== "object" || data === null) return;

    // Each non-total key is a company — flatten its performers
    Object.entries(data as Record<string, unknown>).forEach(
      ([performerName, performerData]) => {
        if (typeof performerData === "object" && performerData !== null) {
          performerNames.push(performerName);
          processedData[performerName] = performerData;
        }
      },
    );
  });

  // Build company entry with performers list + total metrics
  if (performerNames.length > 0) {
    processedData.company = {
      ...((processedData.total as Record<string, unknown>) ?? {}),
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
