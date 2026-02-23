"use client";

import { EyeIcon, VideoIcon, YoutubeIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardResponse, PlatformMetrics } from "@/lib/types/dashboard";
import type { PeriodFilter } from "@/lib/types/filters";
import { cn } from "@/lib/utils";

import { MetricCard } from "../metric-card";
import { MetricCardWithBreakdown } from "../metric-card-breakdown";
import { MetricsChart } from "../metrics-chart";

interface YouTubeSectionProps {
  data?: PlatformMetrics;
  fullDashboardData?: DashboardResponse;
  chartData: Array<{ date: string; value: number }>;
  period: PeriodFilter;
  tvMode?: boolean;
}

export function YouTubeSection({
  data,
  fullDashboardData,
  chartData,
  period,
  tvMode,
}: YouTubeSectionProps) {
  if (!data) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <YoutubeIcon className="size-5 text-red-500" />
            YouTube
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
        <YoutubeIcon className="size-6 text-red-500" />
        <h2 className="text-2xl font-bold">YouTube</h2>
      </div>

      {/* Metrics Cards */}
      <div
        className={cn(
          "grid gap-3",
          tvMode ? "grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3",
        )}
      >
        {fullDashboardData ? (
          <>
            <MetricCardWithBreakdown
              title="Inscritos YouTube"
              totalValue={data.followers.latest}
              entries={data.followers.entries}
              period={period}
              breakdown={Object.entries(fullDashboardData)
                .filter(([key]) => key !== "total")
                .map(([performer, performerData]) => ({
                  performer,
                  value: performerData.youtube?.followers?.latest || 0,
                }))}
              icon={<YoutubeIcon className="size-4 text-red-500" />}
            />

            {data.views && (
              <MetricCardWithBreakdown
                title="Views Totais"
                totalValue={data.views.latest}
                entries={data.views.entries}
                period={period}
                breakdown={Object.entries(fullDashboardData)
                  .filter(([key]) => key !== "total")
                  .map(([performer, performerData]) => ({
                    performer,
                    value: performerData.youtube?.views?.latest || 0,
                  }))}
                icon={<EyeIcon className="size-4 text-red-500" />}
              />
            )}

            {!tvMode && data.video_count && (
              <MetricCardWithBreakdown
                title="Vídeos"
                totalValue={data.video_count.latest}
                entries={data.video_count.entries}
                period={period}
                breakdown={Object.entries(fullDashboardData)
                  .filter(([key]) => key !== "total")
                  .map(([performer, performerData]) => ({
                    performer,
                    value: performerData.youtube?.video_count?.latest || 0,
                  }))}
                icon={<VideoIcon className="size-4 text-red-500" />}
              />
            )}
          </>
        ) : (
          <>
            <MetricCard
              title="Inscritos"
              value={data.followers.latest}
              entries={data.followers.entries}
              period={period}
              icon={<YoutubeIcon className="size-4 text-red-500" />}
            />
            {data.views && (
              <MetricCard
                title="Views Totais"
                value={data.views.latest}
                entries={data.views.entries}
                period={period}
                icon={<EyeIcon className="size-4 text-red-500" />}
              />
            )}
            {!tvMode && data.video_count && (
              <MetricCard
                title="Vídeos"
                value={data.video_count.latest}
                entries={data.video_count.entries}
                period={period}
                icon={<VideoIcon className="size-4 text-red-500" />}
              />
            )}
          </>
        )}
      </div>

      {/* Chart */}
      <MetricsChart
        title="Evolução de Inscritos"
        data={chartData}
        icon={<YoutubeIcon className="size-4 text-red-500" />}
      />
    </div>
  );
}
