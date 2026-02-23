"use client";

import Image from "next/image";

import { ListMusicIcon, Music2Icon, UsersIcon } from "lucide-react";

import { MetricCard } from "@/components/dashboard/metric-card";
import { MetricsChart } from "@/components/dashboard/metrics-chart";
import { ScrollArea } from "@/components/ui/scroll-area";
import { buildChartPoints } from "@/hooks/use-chart-data";
import type { DashboardResponse } from "@/lib/types/dashboard";
import type { PeriodFilter } from "@/lib/types/filters";
import { formatCompactNumber } from "@/lib/utils";

interface PlaylistSectionProps {
  fullDashboardData: DashboardResponse;
  period: PeriodFilter;
}

export function PlaylistSection({
  fullDashboardData,
  period,
}: PlaylistSectionProps) {
  const performersWithPlaylists = Object.entries(fullDashboardData)
    .filter(
      ([key, data]) =>
        key !== "total" &&
        data.spotify_playlists &&
        data.spotify_playlists.length > 0,
    )
    .map(([performer, data]) => ({
      performer,
      playlists: data.spotify_playlists!,
    }));

  if (performersWithPlaylists.length === 0) return null;

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Playlists</h3>
      {performersWithPlaylists.map(({ performer, playlists }) => (
        <div key={performer} className="space-y-4">
          {/* Green performer tag — same pattern as AnimatedTopTracks */}
          <div className="inline-flex items-center gap-2 rounded-full bg-green-500/10 px-4 py-2 text-sm font-medium text-green-600 dark:text-green-400">
            <Music2Icon className="size-4" />
            {performer}
          </div>

          {playlists.map((playlist, idx) => (
            <div key={idx} className="space-y-4">
              {/* Playlist name + thumbnail */}
              <div className="flex items-center gap-3">
                {playlist.thumbnail_url && (
                  <div className="relative size-12 shrink-0 overflow-hidden rounded-lg">
                    <Image
                      src={playlist.thumbnail_url}
                      alt={playlist.name}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  </div>
                )}
                <h4 className="font-semibold">{playlist.name}</h4>
              </div>

              {/* Two MetricCards side by side */}
              <div className="grid gap-3 sm:grid-cols-2">
                <MetricCard
                  title="Seguidores da Playlist"
                  value={playlist.followers.latest}
                  entries={playlist.followers.entries}
                  period={period}
                  icon={<UsersIcon className="size-4 text-green-500" />}
                />
                <MetricCard
                  title="Faixas na Playlist"
                  value={playlist.track_count.latest}
                  entries={playlist.track_count.entries}
                  period={period}
                  icon={<ListMusicIcon className="size-4 text-green-500" />}
                />
              </div>

              {/* Followers evolution chart */}
              <MetricsChart
                title="Evolução de Seguidores"
                data={buildChartPoints(playlist.followers.entries, period)}
                icon={<Music2Icon className="size-4 text-green-500" />}
              />

              {/* Tracks scroll area */}
              {playlist.tracks.length > 0 && (
                <div>
                  <h5 className="mb-3 text-sm font-medium text-muted-foreground">
                    Músicas
                  </h5>
                  <ScrollArea className="h-48 rounded-lg border">
                    <div className="divide-y">
                      {playlist.tracks.map((track, trackIdx) => (
                        <div
                          key={trackIdx}
                          className="flex items-center gap-3 p-3 hover:bg-muted/50"
                        >
                          <span className="w-6 text-center text-sm text-muted-foreground">
                            {trackIdx + 1}
                          </span>
                          {track.thumbnail_url && (
                            <div className="relative size-10 shrink-0 overflow-hidden rounded">
                              <Image
                                src={track.thumbnail_url}
                                alt={track.name}
                                fill
                                className="object-cover"
                                sizes="40px"
                              />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">
                              {track.name}
                            </p>
                          </div>
                          <span className="text-sm font-medium">
                            {formatCompactNumber(
                              parseInt(track.play_count, 10),
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
