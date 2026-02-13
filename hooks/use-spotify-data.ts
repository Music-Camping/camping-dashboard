"use client";

import { useMemo } from "react";

import useSWR from "swr";

import type {
  PerformerRanking,
  SpotifyMetrics,
  SpotifyRanking,
  SpotifyTrackItem,
} from "@/lib/types/spotify";

const fetcher = async (...args: Parameters<typeof fetch>) => {
  const res = await fetch(...args);
  if (res.status === 401) {
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }
  if (!res.ok) {
    throw new Error("API error");
  }
  return res.json();
};

// API structures based on actual responses
interface ApiTrack {
  name: string;
  external_id: string;
  url: string;
  thumbnail: string;
  plays: {
    latest: number;
    entries: Array<{ value: number; datetime: string }>;
  };
}

interface ApiTopTrack {
  name: string;
  external_id: string;
  url: string;
  thumbnail: string;
  performer: string;
  plays: number;
  last_updated: string;
}

interface SpotifyTracksResponse {
  [performer: string]: {
    tracks: ApiTrack[];
  };
}

// Single combined hook - simpler, fewer re-renders
export function useSpotifyData(selectedPerformers: string[]) {
  const { data: tracksData, isLoading: tracksLoading } =
    useSWR<SpotifyTracksResponse>(
      "/api/proxy/api/dashboard/spotify/tracks",
      fetcher,
      {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        dedupingInterval: 60000,
      },
    );

  const { data: topTracks, isLoading: topTracksLoading } = useSWR<
    ApiTopTrack[]
  >("/api/proxy/api/dashboard/spotify/top-tracks", fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 60000,
  });

  // Get all available performers from Spotify data
  const spotifyPerformers = useMemo(() => {
    if (!tracksData) return [];
    return Object.keys(tracksData);
  }, [tracksData]);

  const spotifyData = useMemo((): SpotifyMetrics | undefined => {
    if (!tracksData || !topTracks) return undefined;

    // Use selected performers or all from Spotify
    const performers =
      selectedPerformers.length > 0 ? selectedPerformers : spotifyPerformers;

    // Filter top tracks by performer
    const filteredTopTracks = topTracks.filter((track) =>
      performers.includes(track.performer),
    );

    // Build rankings (top 3 overall)
    const rankings: SpotifyRanking[] = filteredTopTracks
      .slice(0, 3)
      .map((track, index) => ({
        position: index + 1,
        previousPosition: index + 1,
        trackId: track.external_id,
        trackName: track.name,
        artistName: track.performer,
        thumbnail: track.thumbnail,
        streams: track.plays,
        change: "same" as const,
      }));

    // Build rankings by performer (top 3 for each)
    const rankingsByPerformer: PerformerRanking[] = performers.map(
      (performer) => {
        const performerTracks = topTracks
          .filter((t) => t.performer === performer)
          .slice(0, 3)
          .map((track, index) => ({
            position: index + 1,
            previousPosition: index + 1,
            trackId: track.external_id,
            trackName: track.name,
            artistName: track.performer,
            thumbnail: track.thumbnail,
            streams: track.plays,
            change: "same" as const,
          }));

        return {
          performer,
          rankings: performerTracks,
        };
      },
    );

    // Build all tracks list (sorted by plays, excluding top 3 of each performer)
    const top3ByPerformer = new Set<string>();
    rankingsByPerformer.forEach((pr) => {
      pr.rankings.forEach((r) => top3ByPerformer.add(r.trackId));
    });

    const allTracks: SpotifyTrackItem[] = filteredTopTracks
      .filter((track) => !top3ByPerformer.has(track.external_id))
      .map((track) => ({
        id: track.external_id,
        name: track.name,
        performer: track.performer,
        thumbnail: track.thumbnail,
        plays: track.plays,
      }));

    // Build monthly listeners from tracks history
    const entriesMap = new Map<string, number>();
    performers.forEach((performer) => {
      const performerData = tracksData[performer];
      if (!performerData?.tracks) return;

      performerData.tracks.forEach((track) => {
        if (track.plays?.entries) {
          track.plays.entries.forEach((entry) => {
            const dateKey = entry.datetime.split("T")[0];
            const current = entriesMap.get(dateKey) || 0;
            entriesMap.set(dateKey, current + entry.value);
          });
        }
      });
    });

    const entries = Array.from(entriesMap.entries())
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .map(([date, value]) => ({
        datetime: `${date}T00:00:00Z`,
        value,
      }));

    const latest = entries.length > 0 ? entries[entries.length - 1].value : 0;

    return {
      monthlyListeners: { latest, entries },
      rankings,
      rankingsByPerformer,
      allTracks,
      playlists: [],
    };
  }, [tracksData, topTracks, selectedPerformers, spotifyPerformers]);

  return {
    spotifyData,
    spotifyPerformers,
    isLoading: tracksLoading || topTracksLoading,
  };
}
