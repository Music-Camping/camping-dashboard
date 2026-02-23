"use client";

import { useMemo } from "react";

import { Music2Icon, UsersIcon } from "lucide-react";
import Image from "next/image";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type {
  ChartDataPoint,
  PlatformMetrics,
  DashboardResponse,
} from "@/lib/types/dashboard";
import type { PeriodFilter } from "@/lib/types/filters";
import type { SpotifyMetrics } from "@/lib/types/spotify";
import { formatCompactNumber } from "@/lib/utils";

import { MetricCardWithBreakdown } from "../metric-card-breakdown";
import { MetricsChart } from "../metrics-chart";
import { AnimatedTopTracks } from "./animated-top-tracks";

interface SpotifyHubProps {
  spotifyData?: SpotifyMetrics;
  dashboardData?: PlatformMetrics;
  fullDashboardData?: DashboardResponse;
  followersChartData?: ChartDataPoint[];
  listenersChartData?: ChartDataPoint[];
  isLoading?: boolean;
  period?: PeriodFilter;
}

export function SpotifyHub({
  spotifyData,
  dashboardData,
  fullDashboardData,
  followersChartData = [],
  listenersChartData = [],
  isLoading = false,
  period = "7d",
}: SpotifyHubProps) {
  // Filter out top 3 tracks from each performer to avoid duplication
  const otherTracks = useMemo(() => {
    if (!spotifyData?.allTracks) return [];

    // Get all track names from top 3 of each performer
    const top3TrackNames = new Set(
      spotifyData.rankingsByPerformer.flatMap((p) =>
        p.rankings.slice(0, 3).map((r) => r.trackName),
      ),
    );

    // Filter out tracks that are in top 3
    return spotifyData.allTracks.filter(
      (track) => !top3TrackNames.has(track.name),
    );
  }, [spotifyData]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Music2Icon className="size-6 text-green-500" />
          <h2 className="text-2xl font-bold">Spotify</h2>
        </div>
        <div className="grid animate-pulse gap-4 md:grid-cols-2">
          <div className="h-64 rounded-lg bg-muted" />
          <div className="h-64 rounded-lg bg-muted" />
        </div>
      </div>
    );
  }

  if (!spotifyData && !dashboardData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Music2Icon className="size-6 text-green-500" />
          <h2 className="text-2xl font-bold">Spotify</h2>
        </div>
        <div className="flex h-64 items-center justify-center text-muted-foreground">
          Dados do Spotify indisponíveis
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Music2Icon className="size-6 text-green-500" />
        <h2 className="text-2xl font-bold">Spotify</h2>
      </div>

      {/* Dashboard Metrics - Followers & Monthly Listeners */}
      {dashboardData && fullDashboardData && (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <MetricCardWithBreakdown
              title="Seguidores Spotify"
              totalValue={dashboardData.followers.latest}
              entries={dashboardData.followers.entries}
              period={period}
              breakdown={Object.entries(fullDashboardData)
                .filter(([key]) => key !== "total")
                .map(([performer, data]) => ({
                  performer,
                  value: data.spotify?.followers?.latest || 0,
                }))}
              icon={<UsersIcon className="size-4 text-green-500" />}
            />
            {dashboardData.monthly_listeners && (
              <MetricCardWithBreakdown
                title="Ouvintes Mensais"
                totalValue={dashboardData.monthly_listeners.latest}
                entries={dashboardData.monthly_listeners.entries}
                period={period}
                breakdown={Object.entries(fullDashboardData)
                  .filter(([key]) => key !== "total")
                  .map(([performer, data]) => ({
                    performer,
                    value: data.spotify?.monthly_listeners?.latest || 0,
                  }))}
                icon={<Music2Icon className="size-4 text-green-500" />}
              />
            )}
          </div>

          {/* Charts */}
          <div className="grid gap-4 md:grid-cols-2">
            {followersChartData.length > 0 && (
              <MetricsChart
                title="Evolução de Seguidores"
                data={followersChartData}
                icon={<Music2Icon className="size-4 text-green-500" />}
              />
            )}
            {listenersChartData.length > 0 &&
              dashboardData.monthly_listeners && (
                <MetricsChart
                  title="Evolução de Ouvintes Mensais"
                  data={listenersChartData}
                  icon={<Music2Icon className="size-4 text-green-500" />}
                />
              )}
          </div>

          <Separator className="my-6" />
        </>
      )}

      {/* Spotify Rankings & Tracks */}
      {spotifyData && (
        <>
          {/* Animated Top Tracks - Shows top 3 per performer with rotation */}
          <AnimatedTopTracks
            rankingsByPerformer={spotifyData.rankingsByPerformer}
          />

          {/* Other Tracks - Scrollable (excluindo as do top 3) */}
          {otherTracks.length > 0 && (
            <div>
              <h3 className="mb-3 text-sm font-medium text-muted-foreground">
                Outras Músicas
              </h3>
              <ScrollArea className="h-64 rounded-lg border">
                <div className="divide-y">
                  {otherTracks.map((track, index) => (
                    <div
                      key={track.id}
                      className="flex items-center gap-3 p-3 hover:bg-muted/50"
                    >
                      <span className="w-6 text-center text-sm text-muted-foreground">
                        {index + 1}
                      </span>
                      <div className="relative size-10 shrink-0 overflow-hidden rounded">
                        {track.thumbnail ? (
                          <Image
                            src={track.thumbnail}
                            alt={track.name}
                            fill
                            className="object-cover"
                            sizes="40px"
                          />
                        ) : (
                          <div className="size-full bg-muted" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {track.name}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {track.performer}
                        </p>
                      </div>
                      <span className="text-sm font-medium">
                        {formatCompactNumber(track.plays)}
                      </span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </>
      )}
    </div>
  );
}
