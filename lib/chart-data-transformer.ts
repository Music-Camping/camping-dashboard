import type {
  DashboardResponse,
  MultiPerformerChartDataPoint,
} from "@/lib/types/dashboard";
import type { PeriodFilter } from "@/lib/types/filters";

/**
 * Convert UTC datetime to Brasília timezone (UTC-3)
 */
function getDateKeyInBrasilia(datetimeStr: string): string {
  const date = new Date(datetimeStr);
  // Brasília is UTC-3
  const brasiliDate = new Date(date.getTime() - 3 * 60 * 60 * 1000);
  const year = brasiliDate.getUTCFullYear();
  const month = String(brasiliDate.getUTCMonth() + 1).padStart(2, "0");
  const day = String(brasiliDate.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Calculate date threshold based on period
 * Consistent with use-chart-data.ts but adjusted for multi-performer data
 * For 7d: 6 days ago = 7 days total (including today)
 * For 30d: 29 days ago = 30 days total (including today)
 */
function getPeriodThreshold(period: PeriodFilter): Date {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  switch (period) {
    case "today":
      return new Date(now.getTime() - 24 * 60 * 60 * 1000);
    case "7d":
      return new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);
    case "30d":
    default:
      return new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000);
  }
}

/**
 * Common logic for extracting multi-performer data
 * Consolidates entries and groups by date keeping only the latest entry per performer per day
 */
function consolidateMultiPerformerData(
  allEntries: Array<{ performer: string; entries: MetricEntry[] }>,
): MultiPerformerChartDataPoint[] {
  if (allEntries.length === 0) return [];

  const groupedByDate = new Map<
    string,
    Map<string, { value: number; datetime: string }>
  >();
  const latestDatetimePerDate = new Map<string, string>();

  allEntries.forEach(({ performer, entries }) => {
    entries.forEach((entry: MetricEntry) => {
      const dateKey = getDateKeyInBrasilia(entry.datetime);

      if (!groupedByDate.has(dateKey)) {
        groupedByDate.set(dateKey, new Map());
      }

      const datePerformers = groupedByDate.get(dateKey)!;

      datePerformers.set(performer, {
        value: entry.value,
        datetime: entry.datetime,
      });

      const currentLatest = latestDatetimePerDate.get(dateKey);
      if (!currentLatest || entry.datetime > currentLatest) {
        latestDatetimePerDate.set(dateKey, entry.datetime);
      }
    });
  });

  return Array.from(groupedByDate.entries())
    .map(([date, performersMap]) => {
      const performers: Record<string, number> = {};
      performersMap.forEach((data, performer) => {
        performers[performer] = data.value;
      });
      const latestDatetime = latestDatetimePerDate.get(date);
      const timestamp = latestDatetime ? new Date(latestDatetime).getTime() : 0;
      return {
        date,
        datetime: latestDatetime,
        timestamp,
        performers,
      };
    })
    .sort((a, b) => a.date.localeCompare(b.date));
}

interface MetricEntry {
  value: number;
  datetime: string;
}

/**
 * Extract multi-performer chart data from individual performer metrics
 * Takes only the LAST entry of each day (in Brasília timezone)
 * Filters by period to match the period filter
 * Works for any metric (followers, monthly_listeners, views, post_count, etc)
 */
export function extractMultiPerformerData(
  fullDashboardData: DashboardResponse | undefined,
  metricPath: string, // e.g. "spotify.followers" or "youtube.views"
  period?: PeriodFilter,
): MultiPerformerChartDataPoint[] {
  if (!fullDashboardData) return [];

  const threshold = period ? getPeriodThreshold(period) : null;
  const allEntries: Array<{ performer: string; entries: MetricEntry[] }> = [];

  Object.entries(fullDashboardData).forEach(([performer, data]) => {
    if (performer === "total") return;

    const pathParts = metricPath.split(".");
    let metric: any = data;

    pathParts.forEach((part) => {
      metric = metric?.[part];
    });

    if (
      metric?.entries &&
      Array.isArray(metric.entries) &&
      metric.entries.length > 0
    ) {
      let entries = metric.entries as MetricEntry[];
      if (threshold) {
        entries = entries.filter((e) => new Date(e.datetime) >= threshold);
      }
      if (entries.length > 0) {
        allEntries.push({ performer, entries });
      }
    }
  });

  return consolidateMultiPerformerData(allEntries);
}

/**
 * Get all unique performer names from multi-performer data
 */
export function getPerformersFromData(
  data: MultiPerformerChartDataPoint[],
): string[] {
  const performerSet = new Set<string>();

  data.forEach((point) => {
    Object.keys(point.performers).forEach((performer) => {
      performerSet.add(performer);
    });
  });

  return Array.from(performerSet).sort();
}

/**
 * Extract multi-performer playlist followers data
 * Consolidates followers from all playlists per performer
 */
export function extractMultiPerformerPlaylistData(
  fullDashboardData: DashboardResponse | undefined,
  period?: PeriodFilter,
): MultiPerformerChartDataPoint[] {
  if (!fullDashboardData) return [];

  const threshold = period ? getPeriodThreshold(period) : null;
  const allEntries: Array<{ performer: string; entries: MetricEntry[] }> = [];

  Object.entries(fullDashboardData).forEach(([performer, data]) => {
    if (performer === "total") return;

    if (data.spotify_playlists && Array.isArray(data.spotify_playlists)) {
      const consolidatedEntries: MetricEntry[] = [];

      data.spotify_playlists.forEach((playlist) => {
        if (
          playlist.followers?.entries &&
          Array.isArray(playlist.followers.entries)
        ) {
          consolidatedEntries.push(
            ...(playlist.followers.entries as MetricEntry[]),
          );
        }
      });

      if (consolidatedEntries.length > 0) {
        let entries = consolidatedEntries;
        if (threshold) {
          entries = entries.filter((e) => new Date(e.datetime) >= threshold);
        }
        if (entries.length > 0) {
          allEntries.push({ performer, entries });
        }
      }
    }
  });

  return consolidateMultiPerformerData(allEntries);
}
