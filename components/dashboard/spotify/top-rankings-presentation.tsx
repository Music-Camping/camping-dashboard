"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";

import type { SpotifyRanking } from "@/lib/types/spotify";
import { cn, formatCompactNumber } from "@/lib/utils";

interface TopRankingsPresentationProps {
  rankings: SpotifyRanking[];
}

export function TopRankingsPresentation({
  rankings,
}: TopRankingsPresentationProps) {
  const shouldReduceMotion = useReducedMotion();
  const top3 = rankings.slice(0, 3);

  if (top3.length === 0) {
    return (
      <div className="flex h-full items-center justify-center rounded-xl border bg-card p-4">
        <p className="text-muted-foreground">Dados indisponíveis</p>
      </div>
    );
  }

  // First track (1st place) - large with background
  const firstTrack = top3[0];
  const otherTracks = top3.slice(1);

  return (
    <div className="flex flex-col gap-3">
      {/* Top 1 - Large with background image */}
      <AnimatePresence mode="wait">
        <motion.div
          key={firstTrack.trackId}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.3 }}
          className="relative h-48 overflow-hidden rounded-xl border"
        >
          {/* Background Image */}
          {firstTrack.thumbnail && (
            <Image
              src={firstTrack.thumbnail}
              alt={firstTrack.trackName}
              fill
              className="object-cover"
              priority
            />
          )}

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-black/0" />

          {/* Content */}
          <div className="absolute inset-0 flex flex-col justify-end p-4">
            <div className="flex items-end gap-3">
              {/* Position badge */}
              <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-yellow-500 text-lg font-bold text-white">
                1
              </div>

              {/* Track info */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">
                  {firstTrack.trackName}
                </p>
                <p className="truncate text-xs text-white/70">
                  {firstTrack.artistName}
                </p>
                <p className="mt-1 text-lg font-bold text-white">
                  {formatCompactNumber(firstTrack.streams)}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Top 2 and 3 - Side by side */}
      {otherTracks.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          <AnimatePresence mode="wait">
            {otherTracks.map((track, idx) => (
              <motion.div
                key={track.trackId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{
                  duration: shouldReduceMotion ? 0 : 0.3,
                  delay: idx * 0.05,
                }}
                className="relative h-28 overflow-hidden rounded-lg border bg-card"
              >
                {/* Background Image */}
                {track.thumbnail && (
                  <Image
                    src={track.thumbnail}
                    alt={track.trackName}
                    fill
                    className="object-cover"
                  />
                )}

                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/0" />

                {/* Content */}
                <div className="absolute inset-0 flex flex-col justify-end p-2">
                  <div className="flex items-end gap-2">
                    {/* Position badge */}
                    <div
                      className={cn(
                        "flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white",
                        idx === 0 ? "bg-gray-400" : "bg-amber-600",
                      )}
                    >
                      {idx + 2}
                    </div>

                    {/* Track info */}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-white">
                        {track.trackName}
                      </p>
                      <p className="truncate text-xs text-white/70">
                        {track.artistName}
                      </p>
                      <p className="text-xs font-semibold text-white">
                        {formatCompactNumber(track.streams)}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
