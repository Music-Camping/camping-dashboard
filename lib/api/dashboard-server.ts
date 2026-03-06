import type { DashboardResponse } from "@/lib/types/dashboard";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.API_URL || "http://localhost:3001";
const REVALIDATE_TIME = 10800; // 3 horas em segundos

/**
 * Processes raw API response into structured DashboardResponse
 * Assumes first non-total key is the company, extracts performers
 *
 * @param rawData - Raw API response
 * @returns Processed data with flattened performers + company structure
 */
function processCompanyAndPerformers(
  rawData: Record<string, unknown>,
): DashboardResponse | null {
  const processedData: Record<string, unknown> = {};
  let companyData: Record<string, unknown> | null = null;
  const performerNames: string[] = [];

  Object.entries(rawData).forEach(([key, data]) => {
    // Keep "total" as-is
    if (key === "total") {
      processedData.total = data;
      return;
    }

    // Skip "company" key if present (we'll add it back later)
    if (key === "company") {
      return;
    }

    // First non-total, non-company object is assumed to be company
    if (companyData === null && typeof data === "object" && data !== null) {
      companyData = data as Record<string, unknown>;
      const companyKeys = Object.keys(data as Record<string, unknown>);
      performerNames.push(...companyKeys);

      // Flatten performers from company structure
      Object.entries(data as Record<string, unknown>).forEach(
        ([performerName, performerData]) => {
          processedData[performerName] = performerData;
        },
      );
    }
  });

  // Add company with performers list if found
  if (companyData && performerNames.length > 0) {
    processedData.company = {
      ...(companyData as Record<string, unknown>),
      performers: performerNames,
    } as unknown;
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
