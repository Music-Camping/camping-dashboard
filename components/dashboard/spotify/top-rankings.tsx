"use client";

import { useMemo, useRef } from "react";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  MinusIcon,
  SparklesIcon,
} from "lucide-react";
import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { SpotifyRanking } from "@/lib/types/spotify";
import { cn, formatCompactNumber } from "@/lib/utils";

interface TopRankingsProps {
  rankings: SpotifyRanking[];
}

const POSITION_COLORS = [
  "from-yellow-400/20 to-yellow-600/5", // 1st - Gold
  "from-gray-300/20 to-gray-400/5", // 2nd - Silver
  "from-amber-600/20 to-amber-700/5", // 3rd - Bronze
];

const POSITION_BADGES = ["bg-yellow-500", "bg-gray-400", "bg-amber-600"];

export function TopRankings({ rankings }: TopRankingsProps) {
  const shouldReduceMotion = useReducedMotion();
  const top3 = rankings.slice(0, 3);

  // Only re-animate when actual track IDs change, not on every render
  const trackKey = top3.map((r) => r.trackId).join("-") || "empty";
  const prevKeyRef = useRef(trackKey);
  const shouldAnimate = prevKeyRef.current !== trackKey;
  if (shouldAnimate) {
    prevKeyRef.current = trackKey;
  }

  const containerVariants = useMemo(
    () => ({
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: shouldReduceMotion
          ? { duration: 0 }
          : {
              when: "beforeChildren",
              staggerChildren: 0.12,
              delayChildren: 0.1,
            },
      },
    }),
    [shouldReduceMotion],
  );

  const cardVariants = useMemo(
    () => ({
      hidden: { opacity: 0, y: 40, scale: 0.95 },
      visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: shouldReduceMotion
          ? { duration: 0 }
          : { type: "spring" as const, stiffness: 120, damping: 14 },
      },
    }),
    [shouldReduceMotion],
  );

  const getChangeBadge = (rank: SpotifyRanking) => {
    const diff = rank.previousPosition - rank.position;
    if (rank.change === "new") {
      return (
        <Badge
          variant="secondary"
          className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
        >
          <SparklesIcon className="mr-1 size-3" />
          Novo
        </Badge>
      );
    }
    if (diff > 0) {
      return (
        <Badge
          variant="secondary"
          className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
        >
          <ArrowUpIcon className="mr-1 size-3" />+{diff}
        </Badge>
      );
    }
    if (diff < 0) {
      return (
        <Badge
          variant="secondary"
          className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
        >
          <ArrowDownIcon className="mr-1 size-3" />
          {diff}
        </Badge>
      );
    }
    return (
      <Badge variant="secondary">
        <MinusIcon className="mr-1 size-3" />
        Igual
      </Badge>
    );
  };

  if (top3.length === 0) {
    return (
      <Card className="flex h-full items-center justify-center">
        <CardContent>
          <p className="text-muted-foreground">
            Dados de ranking indisponíveis
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={trackKey}
        variants={containerVariants}
        initial={shouldAnimate ? "hidden" : false}
        animate="visible"
        className="flex flex-col gap-3"
      >
        {top3.map((rank, index) => (
          <motion.div key={rank.trackId} variants={cardVariants}>
            <Card
              className={cn(
                "relative overflow-hidden bg-gradient-to-r",
                POSITION_COLORS[index] || POSITION_COLORS[2],
              )}
            >
              <CardContent className="flex items-center gap-4 p-4">
                {/* Position badge */}
                <div
                  className={cn(
                    "flex size-10 shrink-0 items-center justify-center rounded-full text-lg font-bold text-white",
                    POSITION_BADGES[index] || POSITION_BADGES[2],
                  )}
                >
                  {index + 1}
                </div>

                {/* Track thumbnail */}
                <div className="relative size-14 shrink-0 overflow-hidden rounded-lg">
                  {rank.thumbnail ? (
                    <Image
                      src={rank.thumbnail}
                      alt={rank.trackName}
                      fill
                      className="object-cover"
                      sizes="56px"
                    />
                  ) : (
                    <div className="size-full bg-muted" />
                  )}
                </div>

                {/* Track info */}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{rank.trackName}</p>
                  <p className="truncate text-sm text-muted-foreground">
                    {rank.artistName}
                  </p>
                </div>

                {/* Streams and change */}
                <div className="flex flex-col items-end gap-1">
                  <p className="text-lg font-semibold">
                    {formatCompactNumber(rank.streams)}
                  </p>
                  {getChangeBadge(rank)}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </AnimatePresence>
  );
}
