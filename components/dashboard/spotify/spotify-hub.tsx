"use client";

import { useEffect, useMemo, useState } from "react";

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
import { PlaylistSection } from "./playlist-section";

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
  const [currentPerformerIndex, setCurrentPerformerIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const hasPlaylistData = fullDashboardData
    ? Object.entries(fullDashboardData).some(
        ([k, d]) => k !== "total" && (d.spotify_playlists?.length ?? 0) > 0,
      )
    : false;

  // Get valid performers (with at least 1 ranking)
  const validPerformers = useMemo(() => {
    if (!spotifyData) return [];
    return spotifyData.rankingsByPerformer.filter((p) => p.rankings.length > 0);
  }, [spotifyData]);

  // Auto-rotate between performers every 8 seconds (unless paused)
  useEffect(() => {
    if (validPerformers.length <= 1) {
      return undefined;
    }

    const interval = setInterval(() => {
      if (!isPaused) {
        setCurrentPerformerIndex((prev) => (prev + 1) % validPerformers.length);
      }
    }, 8000);

    return () => clearInterval(interval);
  }, [validPerformers.length, isPaused]);

  // Reset index if out of bounds
  useEffect(() => {
    if (currentPerformerIndex >= validPerformers.length) {
      setCurrentPerformerIndex(0);
    }
  }, [validPerformers.length, currentPerformerIndex]);

  // Filter out top 3 tracks from current performer only
  const otherTracks = useMemo(() => {
    if (!spotifyData?.allTracks || validPerformers.length === 0) return [];

    const currentPerformer = validPerformers[currentPerformerIndex];
    if (!currentPerformer) return [];

    // Get track names from top 3 of current performer
    const top3TrackNames = new Set(
      currentPerformer.rankings.slice(0, 3).map((r) => r.trackName),
    );

    // Filter to current performer's tracks, excluding top 3
    return spotifyData.allTracks.filter(
      (track) =>
        track.performer === currentPerformer.performer &&
        !top3TrackNames.has(track.name),
    );
  }, [spotifyData, currentPerformerIndex, validPerformers]);

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

  if (!spotifyData && !dashboardData && !hasPlaylistData) {
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
          {/* Animated Top Tracks - Shows top tracks per performer with rotation */}
          <AnimatedTopTracks
            rankingsByPerformer={spotifyData.rankingsByPerformer}
            currentPerformerIndex={currentPerformerIndex}
            isPaused={isPaused}
            onIndexChange={setCurrentPerformerIndex}
            onTogglePause={() => setIsPaused((prev) => !prev)}
          />

          {/* Other Tracks - Scrollable (excluding top 3 from current performer) */}
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

      {/* Playlist Section — only if at least one performer has spotify_playlists */}
      {hasPlaylistData && fullDashboardData && (
        <>
          <Separator className="my-6" />
          <PlaylistSection
            fullDashboardData={fullDashboardData}
            period={period}
          />
        </>
      )}
    </div>
  );
}
