"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { TrophyIcon, Music2Icon } from "lucide-react";

import { Card } from "@/components/ui/card";
import { formatCompactNumber } from "@/lib/utils";
import type { SpotifyRanking } from "@/lib/types/spotify";

interface PerformerRanking {
  performer: string;
  rankings: SpotifyRanking[];
}

interface AnimatedTopTracksProps {
  rankingsByPerformer: PerformerRanking[];
}

export function AnimatedTopTracks({
  rankingsByPerformer,
}: AnimatedTopTracksProps) {
  const [currentPerformerIndex, setCurrentPerformerIndex] = useState(0);

  // Filtrar apenas performers que têm pelo menos 1 track
  const validPerformers = rankingsByPerformer.filter(
    (p) => p.rankings.length > 0,
  );

  // Auto-rotate entre performers a cada 8 segundos
  useEffect(() => {
    if (validPerformers.length <= 1) {
      return undefined;
    }

    const interval = setInterval(() => {
      setCurrentPerformerIndex((prev) => (prev + 1) % validPerformers.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [validPerformers.length]);

  if (validPerformers.length === 0) {
    return null;
  }

  const currentPerformer = validPerformers[currentPerformerIndex];
  const top3 = currentPerformer.rankings.slice(0, 3);

  return (
    <div className="space-y-4">
      {/* Header com nome do performer e indicadores */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrophyIcon className="size-5 text-yellow-500" />
          <h3 className="text-lg font-semibold">Top 3 Tracks</h3>
        </div>

        {/* Dots indicator */}
        {validPerformers.length > 1 && (
          <div className="flex gap-2">
            {validPerformers.map((performerData, idx) => (
              <button
                key={performerData.performer}
                type="button"
                onClick={() => setCurrentPerformerIndex(idx)}
                className={`h-2 rounded-full transition-all ${
                  idx === currentPerformerIndex
                    ? "w-8 bg-green-500"
                    : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                }`}
                aria-label={`Go to ${performerData.performer}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Performer name tag */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPerformer.performer}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.3 }}
          className="inline-flex items-center gap-2 rounded-full bg-green-500/10 px-4 py-2 text-sm font-medium text-green-600 dark:text-green-400"
        >
          <Music2Icon className="size-4" />
          {currentPerformer.performer}
        </motion.div>
      </AnimatePresence>

      {/* Top 3 Layout */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPerformer.performer}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 gap-4 lg:grid-cols-[2fr_1fr]"
        >
          {/* #1 - Large card with background image */}
          {top3[0] && (
            <Card className="group relative overflow-hidden border-2 border-yellow-500/30 transition-all hover:border-yellow-500/60 hover:shadow-xl">
              {/* Background image with overlay */}
              <div className="absolute inset-0">
                {top3[0].thumbnail ? (
                  <Image
                    src={top3[0].thumbnail}
                    alt={top3[0].trackName}
                    fill
                    className="object-cover opacity-20 transition-all group-hover:scale-105 group-hover:opacity-30"
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-green-500/20 to-yellow-500/20" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40" />
              </div>

              {/* Content */}
              <div className="relative flex h-full min-h-[280px] flex-col justify-between p-6">
                {/* Position badge */}
                <div className="flex items-center gap-2">
                  <div className="flex size-12 items-center justify-center rounded-full bg-yellow-500 text-xl font-bold text-white shadow-lg">
                    1
                  </div>
                  <div className="rounded-full bg-yellow-500/20 px-3 py-1 text-xs font-medium text-yellow-600 dark:text-yellow-400">
                    #1 Mais Tocada
                  </div>
                </div>

                {/* Track info */}
                <div className="space-y-2">
                  <h4 className="line-clamp-2 text-2xl leading-tight font-bold">
                    {top3[0].trackName}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {top3[0].artistName}
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Music2Icon className="size-4 text-green-500" />
                      <span className="text-2xl font-bold text-green-500">
                        {formatCompactNumber(top3[0].streams)}
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground">plays</span>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* #2 and #3 - Smaller cards */}
          <div className="flex flex-col gap-4">
            {top3[1] && (
              <Card className="group relative overflow-hidden border-2 border-gray-400/30 transition-all hover:border-gray-400/60 hover:shadow-lg">
                <div className="absolute inset-0">
                  {top3[1].thumbnail ? (
                    <Image
                      src={top3[1].thumbnail}
                      alt={top3[1].trackName}
                      fill
                      className="object-cover opacity-10 transition-all group-hover:scale-105 group-hover:opacity-20"
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-gray-500/10 to-gray-600/10" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40" />
                </div>

                <div className="relative flex min-h-[130px] flex-col justify-between p-4">
                  <div className="flex items-center gap-2">
                    <div className="flex size-9 items-center justify-center rounded-full bg-gray-400 text-lg font-bold text-white">
                      2
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h5 className="line-clamp-2 leading-tight font-semibold">
                      {top3[1].trackName}
                    </h5>
                    <div className="flex items-center gap-1">
                      <Music2Icon className="size-3 text-green-500" />
                      <span className="text-sm font-medium text-green-500">
                        {formatCompactNumber(top3[1].streams)}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {top3[2] && (
              <Card className="group relative overflow-hidden border-2 border-orange-600/30 transition-all hover:border-orange-600/60 hover:shadow-lg">
                <div className="absolute inset-0">
                  {top3[2].thumbnail ? (
                    <Image
                      src={top3[2].thumbnail}
                      alt={top3[2].trackName}
                      fill
                      className="object-cover opacity-10 transition-all group-hover:scale-105 group-hover:opacity-20"
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-orange-500/10 to-orange-600/10" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40" />
                </div>

                <div className="relative flex min-h-[130px] flex-col justify-between p-4">
                  <div className="flex items-center gap-2">
                    <div className="flex size-9 items-center justify-center rounded-full bg-orange-600 text-lg font-bold text-white">
                      3
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h5 className="line-clamp-2 leading-tight font-semibold">
                      {top3[2].trackName}
                    </h5>
                    <div className="flex items-center gap-1">
                      <Music2Icon className="size-3 text-green-500" />
                      <span className="text-sm font-medium text-green-500">
                        {formatCompactNumber(top3[2].streams)}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
