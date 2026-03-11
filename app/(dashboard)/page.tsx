import { Suspense } from "react";

import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getDashboardData,
  getSpotifyTracksData,
  type SpotifyTrackRaw,
} from "@/lib/api/dashboard-server";
import type { SpotifyMetrics } from "@/lib/types/spotify";

// ✅ Revalidar a cada 3 horas (10800 segundos)
export const revalidate = 10800;

export default async function DashboardPage() {
  // ✅ Fetch no servidor com cache de 3h
  const [data, spotifyTracksRaw] = await Promise.all([
    getDashboardData(),
    getSpotifyTracksData(),
  ]);

  // Transform Spotify tracks to SpotifyMetrics format
  const spotifyData: SpotifyMetrics | undefined = spotifyTracksRaw
    ? {
        monthlyListeners: { latest: 0, entries: [] },
        rankings: [],
        rankingsByPerformer: Object.entries(spotifyTracksRaw).map(
          ([performer, { tracks }]) => ({
            performer,
            rankings: [...tracks]
              .sort((a, b) => b.plays.latest - a.plays.latest)
              .map((track: SpotifyTrackRaw, idx: number) => ({
                position: idx + 1,
                previousPosition: idx + 1,
                trackId: track.external_id,
                trackName: track.name,
                artistName: performer,
                thumbnail: track.thumbnail ?? "",
                streams: track.plays.latest,
                change: "same" as const,
              })),
          }),
        ),
        allTracks: Object.entries(spotifyTracksRaw).flatMap(
          ([performer, { tracks }]) =>
            tracks.map((track: SpotifyTrackRaw) => ({
              id: track.external_id,
              name: track.name,
              performer,
              thumbnail: track.thumbnail ?? "",
              plays: track.plays.latest,
            })),
        ),
      }
    : undefined;

  return (
    <Suspense
      fallback={
        <div className="flex flex-col gap-4 p-4">
          <Skeleton className="h-80" />
          <div className="grid grid-cols-5 gap-3">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
          <Skeleton className="h-64" />
          <Skeleton className="h-96" />
        </div>
      }
    >
      <DashboardClient initialData={data} spotifyData={spotifyData} />
    </Suspense>
  );
}
