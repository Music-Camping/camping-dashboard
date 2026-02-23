import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import type { MetricEntry } from "@/lib/types/dashboard";
import type { PeriodFilter } from "@/lib/types/filters";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "decimal",
  }).format(num);
}

export function formatCompactNumber(num: number): string {
  if (num >= 1_000_000_000) {
    return `${(num / 1_000_000_000).toFixed(1)}B`;
  }
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1)}M`;
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(0)}K`;
  }
  return num.toString();
}

export function calculateGrowth(
  entries: MetricEntry[],
  period: PeriodFilter = "7d",
): {
  absolute: number;
  percent: number;
} {
  if (entries.length === 0) return { absolute: 0, percent: 0 };

  // Build daily aggregates: for each calendar day, keep the last entry per
  // performer and then sum performers — correct for cumulative snapshot data
  const dailyPerformer = new Map<
    string,
    Map<string, { value: number; datetime: string }>
  >();
  entries.forEach((entry) => {
    const dateKey = entry.datetime.split("T")[0];
    const performer = entry.performer ?? "__single__";
    if (!dailyPerformer.has(dateKey)) dailyPerformer.set(dateKey, new Map());
    const pm = dailyPerformer.get(dateKey)!;
    const existing = pm.get(performer);
    if (!existing || entry.datetime > existing.datetime) {
      pm.set(performer, { value: entry.value, datetime: entry.datetime });
    }
  });

  const dailyAggregates = new Map<string, number>();
  dailyPerformer.forEach((performerMap, dateKey) => {
    let total = 0;
    performerMap.forEach(({ value }) => {
      total += value;
    });
    dailyAggregates.set(dateKey, total);
  });

  if (dailyAggregates.size < 2) return { absolute: 0, percent: 0 };

  const sortedDates = [...dailyAggregates.keys()].sort();
  const latestValue =
    dailyAggregates.get(sortedDates[sortedDates.length - 1]) ?? 0;

  const now = new Date();
  let referenceDate: string | undefined;

  if (period === "today") {
    // Oldest date within the last 24 hours
    const thresh24h = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];
    referenceDate = sortedDates.find((d) => d >= thresh24h);
  } else {
    const daysBack = period === "7d" ? 7 : 30;
    const threshStr = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];
    // Last date that is at or before the period start threshold
    referenceDate =
      [...sortedDates].reverse().find((d) => d <= threshStr) ?? sortedDates[0]; // Fallback: oldest available date
  }

  const latestDate = sortedDates[sortedDates.length - 1];
  if (!referenceDate || referenceDate === latestDate)
    return { absolute: 0, percent: 0 };

  const referenceValue = dailyAggregates.get(referenceDate) ?? 0;
  const absolute = latestValue - referenceValue;
  const percent = referenceValue === 0 ? 0 : (absolute / referenceValue) * 100;

  return { absolute, percent };
}
