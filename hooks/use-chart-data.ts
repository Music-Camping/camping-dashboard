"use client";

import { useMemo } from "react";

import type {
  ChartDataPoint,
  DashboardResponse,
  MetricData,
  PlatformMetrics,
} from "@/lib/types/dashboard";
import type { PeriodFilter } from "@/lib/types/filters";

type Platform = "youtube" | "instagram" | "spotify";
type Metric = keyof PlatformMetrics;

function getDateThreshold(period: PeriodFilter): Date {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  switch (period) {
    case "today":
      return now;
    case "7d":
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case "30d":
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    default:
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }
}

export function useChartData(
  data: DashboardResponse | undefined,
  platform: Platform,
  metric: Metric,
  selectedPerformers: string[],
  period: PeriodFilter = "30d",
): ChartDataPoint[] {
  return useMemo(() => {
    if (!data) return [];

    const totalData = data.total;
    if (!totalData) return [];

    const platformData = totalData[platform];
    if (!platformData) return [];

    const metricData = platformData[metric] as MetricData | undefined;
    if (!metricData?.entries) return [];

    const { entries } = metricData;
    const threshold = getDateThreshold(period);

    // Filter by selected performers if any are selected
    // If none selected, use all entries (treat as "all selected")
    const filteredEntries =
      selectedPerformers.length === 0
        ? entries
        : entries.filter(
            (e) => e.performer && selectedPerformers.includes(e.performer),
          );

    // Filter by period
    const periodFiltered = filteredEntries.filter((e) => {
      const entryDate = new Date(e.datetime);
      return entryDate >= threshold;
    });

    // Group by date and sum values
    const byDate = new Map<string, number>();
    periodFiltered.forEach((entry) => {
      const dateKey = entry.datetime.split("T")[0];
      byDate.set(dateKey, (byDate.get(dateKey) || 0) + entry.value);
    });

    // Convert to array and sort by date ascending
    const sortedDates = Array.from(byDate.entries()).sort(([a], [b]) =>
      a.localeCompare(b),
    );

    // Build ChartDataPoint array with previousValue
    const points: ChartDataPoint[] = sortedDates.map(
      ([date, value], index, arr) => ({
        date,
        value,
        previousValue: index > 0 ? arr[index - 1][1] : undefined,
      }),
    );

    return points;
  }, [data, platform, metric, selectedPerformers, period]);
}
