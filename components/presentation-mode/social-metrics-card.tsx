"use client";

import { ReactNode } from "react";
import { MetricsChart } from "@/components/dashboard/metrics-chart";
import { formatCompactNumber } from "@/lib/utils";
import type { ChartDataPoint } from "@/lib/types/dashboard";

interface SocialMetricsCardProps {
  platform: "youtube" | "instagram";
  icon: ReactNode;
  name?: string;
  followers: number;
  secondaryMetric?: {
    label: string;
    value: number;
  };
  chartData: ChartDataPoint[];
}

export function SocialMetricsCard({
  platform,
  icon,
  name,
  followers,
  secondaryMetric,
  chartData,
}: SocialMetricsCardProps) {
  const platformNames = {
    youtube: "YouTube",
    instagram: "Instagram",
  };

  const labels = {
    youtube: { followers: "Inscritos", secondary: "Views Totais" },
    instagram: { followers: "Seguidores", secondary: "Posts" },
  };

  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-card p-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        {icon}
        <div>
          <span className="text-xl font-bold">{platformNames[platform]}</span>
          {name && <p className="text-sm text-muted-foreground">{name}</p>}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg bg-muted/50 p-4">
          <p className="text-sm text-muted-foreground">
            {labels[platform].followers}
          </p>
          <p className="text-2xl font-bold tabular-nums">
            {formatCompactNumber(followers)}
          </p>
        </div>

        {secondaryMetric && (
          <div className="rounded-lg bg-muted/50 p-4">
            <p className="text-sm text-muted-foreground">
              {secondaryMetric.label}
            </p>
            <p className="text-2xl font-bold tabular-nums">
              {formatCompactNumber(secondaryMetric.value)}
            </p>
          </div>
        )}
      </div>

      {/* Chart */}
      <MetricsChart
        title={platformNames[platform]}
        data={chartData}
        icon={icon}
      />
    </div>
  );
}
