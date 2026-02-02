import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import type { MetricEntry } from "@/lib/types/dashboard";

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

export function calculateGrowth(entries: MetricEntry[]): {
  absolute: number;
  percent: number;
} {
  if (entries.length < 2) {
    return { absolute: 0, percent: 0 };
  }

  // Group entries by date and sum values for each date
  const byDate = new Map<string, number>();
  entries.forEach((entry) => {
    const dateKey = entry.datetime.split("T")[0];
    byDate.set(dateKey, (byDate.get(dateKey) || 0) + entry.value);
  });

  // Need at least 2 different dates to calculate growth
  if (byDate.size < 2) {
    return { absolute: 0, percent: 0 };
  }

  // Sort dates descending to get latest first
  const sortedDates = Array.from(byDate.entries()).sort(([a], [b]) =>
    b.localeCompare(a),
  );

  const latestTotal = sortedDates[0][1];
  const previousTotal = sortedDates[1][1];
  const absolute = latestTotal - previousTotal;
  const percent = previousTotal === 0 ? 0 : (absolute / previousTotal) * 100;

  return { absolute, percent };
}
