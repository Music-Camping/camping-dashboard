"use client";

import useSWR from "swr";

import type { MusicTrack } from "@/lib/types/music-catalog";

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

export function useMusicCatalog() {
  const { data, error, isLoading, mutate } = useSWR<MusicTrack[]>(
    "/api/proxy/api/dashboard/songs",
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000,
    },
  );

  return {
    tracks: data || [],
    isLoading,
    isError: error,
    mutate,
  };
}
