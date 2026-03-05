"use client";

import { ImageIcon, InstagramIcon, UsersIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardResponse, PlatformMetrics } from "@/lib/types/dashboard";
import type { PeriodFilter } from "@/lib/types/filters";
import { cn } from "@/lib/utils";

import { MetricCard } from "../metric-card";
import { MetricCardWithBreakdown } from "../metric-card-breakdown";
import { MetricsChart } from "../metrics-chart";

interface InstagramSectionProps {
  data?: PlatformMetrics;
  fullDashboardData?: DashboardResponse;
  chartData: Array<{ date: string; value: number }>;
  period: PeriodFilter;
  tvMode?: boolean;
}

export function InstagramSection({
  data,
  fullDashboardData,
  chartData,
  period,
  tvMode,
}: InstagramSectionProps) {
  if (!data) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <InstagramIcon className="size-5 text-pink-500" />
            Instagram
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Sem dados disponíveis</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <InstagramIcon className="size-6 text-pink-500" />
        <h2 className="text-2xl font-bold">Instagram</h2>
      </div>

      {/* Metrics Cards */}
      <div
        className={cn("grid gap-3", tvMode ? "grid-cols-2" : "sm:grid-cols-2")}
      >
        {fullDashboardData ? (
          <>
            <MetricCardWithBreakdown
              title="Seguidores Instagram"
              totalValue={data.followers.latest}
              entries={data.followers.entries}
              period={period}
              breakdown={Object.entries(fullDashboardData)
                .filter(([key]) => key !== "total")
                .map(([performer, performerData]) => ({
                  performer,
                  value: performerData.instagram?.followers?.latest || 0,
                }))}
              icon={<UsersIcon className="size-4 text-pink-500" />}
            />

            {data.post_count && (
              <MetricCardWithBreakdown
                title="Posts"
                totalValue={data.post_count.latest}
                entries={data.post_count.entries}
                period={period}
                breakdown={Object.entries(fullDashboardData)
                  .filter(([key]) => key !== "total")
                  .map(([performer, performerData]) => ({
                    performer,
                    value: performerData.instagram?.post_count?.latest || 0,
                  }))}
                icon={<ImageIcon className="size-4 text-pink-500" />}
              />
            )}
          </>
        ) : (
          <>
            <MetricCard
              title="Seguidores"
              value={data.followers.latest}
              entries={data.followers.entries}
              period={period}
              icon={<UsersIcon className="size-4 text-pink-500" />}
            />
            {data.post_count && (
              <MetricCard
                title="Posts"
                value={data.post_count.latest}
                entries={data.post_count.entries}
                period={period}
                icon={<ImageIcon className="size-4 text-pink-500" />}
              />
            )}
          </>
        )}
      </div>

      {/* Chart */}
      <MetricsChart
        title="Evolução de Seguidores"
        data={chartData}
        icon={<InstagramIcon className="size-4 text-pink-500" />}
      />
    </div>
  );
}
