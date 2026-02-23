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
    case "7d":
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case "30d":
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    default:
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }
}

function getBucketKey(datetime: string, period: PeriodFilter): string {
  if (period === "today") {
    return datetime; // full datetime = one point per recording moment
  }
  return datetime.split("T")[0]; // date only for 7d/30d
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

    // Filter by selected performers if any are selected
    // If none selected, use all entries (treat as "all selected")
    const filteredEntries =
      selectedPerformers.length === 0
        ? entries
        : entries.filter(
            (e) => e.performer && selectedPerformers.includes(e.performer),
          );

    // Compute threshold — for 'today', anchor on the latest recorded timestamp
    // (data-relative), not on wall-clock time
    let threshold: Date;
    if (period === "today") {
      const latestDatetime = filteredEntries.reduce(
        (max, e) => (e.datetime > max ? e.datetime : max),
        filteredEntries[0]?.datetime ?? "",
      );
      threshold = new Date(
        new Date(latestDatetime).getTime() - 24 * 60 * 60 * 1000,
      );
    } else {
      threshold = getDateThreshold(period);
    }

    // Filter by period
    const periodFiltered = filteredEntries.filter((e) => {
      const entryDate = new Date(e.datetime);
      return entryDate >= threshold;
    });

    // Step 1: last value per (bucket, performer) — keep only the latest entry
    // per performer within each time bucket to avoid summing cumulative snapshots
    const bucketPerformer = new Map<
      string,
      Map<string, { value: number; datetime: string }>
    >();
    periodFiltered.forEach((entry) => {
      const bucketKey = getBucketKey(entry.datetime, period);
      const performer = entry.performer ?? "__single__";
      if (!bucketPerformer.has(bucketKey))
        bucketPerformer.set(bucketKey, new Map());
      const pm = bucketPerformer.get(bucketKey)!;
      const existing = pm.get(performer);
      if (!existing || entry.datetime > existing.datetime) {
        pm.set(performer, { value: entry.value, datetime: entry.datetime });
      }
    });

    // Step 2: sum the last-values across performers per bucket
    const byBucket = new Map<string, number>();
    bucketPerformer.forEach((performerMap, bucketKey) => {
      let total = 0;
      performerMap.forEach(({ value }) => {
        total += value;
      });
      byBucket.set(bucketKey, total);
    });

    // Step 3: sort ascending and build ChartDataPoint[]
    const sortedBuckets = Array.from(byBucket.entries()).sort(([a], [b]) =>
      a.localeCompare(b),
    );

    const points: ChartDataPoint[] = sortedBuckets.map(
      ([date, value], index, arr) => ({
        date,
        value,
        previousValue: index > 0 ? arr[index - 1][1] : undefined,
      }),
    );

    // For 'today': show only the last 9 points
    return period === "today" ? points.slice(-9) : points;
  }, [data, platform, metric, selectedPerformers, period]);
}
