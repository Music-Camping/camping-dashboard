"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { MusicIcon } from "lucide-react";
import Image from "next/image";

import type { SpotifyRanking } from "@/lib/types/spotify";
import { formatCompactNumber } from "@/lib/utils";

function SpotifyIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
    </svg>
  );
}

function YouTubeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

interface CityEntry {
  value: number;
  datetime: string;
  extra_data?: {
    city: string;
    country: string;
  };
}

interface PerformerPresentationProps {
  performerName: string;
  rankings: SpotifyRanking[];
  cityData?: { entries: CityEntry[] } | null;
  bannerUrl?: string | null;
  totalStreams?: number;
  youtubeVideos?: number;
  youtubeViews?: number;
  totalFollowers?: number;
  monthlyListeners?: number;
  /** Growth deltas for the selected period */
  streamsDelta?: number;
  videosDelta?: number;
  viewsDelta?: number;
  followersDelta?: number;
  listenersDelta?: number;
  /** Which platforms this performer has data for */
  hasSpotify?: boolean;
  hasYoutube?: boolean;
  hasTiktok?: boolean;
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
  );
}

/** Delta badge — shows growth like "+1.3M" in green or "-500" in red */
function DeltaBadge({ value }: { value?: number }) {
  if (value == null || value === 0) return null;
  const isPositive = value > 0;
  return (
    <span
      className={`text-[clamp(1.5rem,3vw,4rem)] font-black tabular-nums ${isPositive ? "text-green-400" : "text-red-400"}`}
    >
      {isPositive ? "+" : ""}
      {formatCompactNumber(value)}
    </span>
  );
}

/** Single metric card — fills its grid cell via h-full */
function MetricCard({
  label,
  value,
  delta,
  glow,
  icons,
  delay,
}: {
  label: string;
  value: number;
  delta?: number;
  glow: string;
  icons: (React.ReactNode | false | undefined)[];
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, delay }}
      className="group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl bg-white/[0.03] p-[1.5vh] shadow-lg backdrop-blur-md"
    >
      <div
        className={`absolute -top-6 -right-6 size-24 rounded-full ${glow} blur-2xl`}
      />
      <div className="flex items-center justify-between">
        <span className="text-[clamp(1.5rem,1.3vw,2rem)] font-medium text-white/50">
          {label}
        </span>
        <StackedIcons platforms={icons.filter(Boolean) as React.ReactNode[]} />
      </div>
      <div className="mt-auto flex items-end justify-between">
        <p className="text-[clamp(1.5rem,3vw,4rem)] font-black text-white tabular-nums">
          {formatCompactNumber(value)}
        </p>
        <DeltaBadge value={delta} />
      </div>
    </motion.div>
  );
}

/** Stacked platform icons (overlapping, like Muso.AI) */
function StackedIcons({ platforms }: { platforms: React.ReactNode[] }) {
  if (platforms.length === 0) return null;
  return (
    <div className="flex items-center">
      {platforms.map((icon, i) => (
        <div
          key={i}
          className="flex size-6 items-center justify-center rounded-full border border-white/10 bg-black/60 p-1"
          style={{ marginLeft: i === 0 ? 0 : -6, zIndex: platforms.length - i }}
        >
          {icon}
        </div>
      ))}
    </div>
  );
}

/** Shared banner background layers for both halves */
function BannerBackground({
  bannerUrl,
  performerName,
}: {
  bannerUrl?: string | null;
  performerName: string;
}) {
  if (bannerUrl) {
    return (
      <>
        <Image
          src={bannerUrl}
          alt={performerName}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />
      </>
    );
  }
  return (
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(16,185,129,0.15)_0%,_transparent_50%),_radial-gradient(ellipse_at_bottom_left,_rgba(59,130,246,0.1)_0%,_transparent_50%),_linear-gradient(to_bottom,_#0a0a0a,_#111111)]" />
  );
}

export function PerformerPresentation({
  performerName,
  rankings,
  cityData,
  bannerUrl,
  totalStreams,
  youtubeVideos,
  youtubeViews,
  totalFollowers,
  monthlyListeners,
  streamsDelta,
  videosDelta,
  viewsDelta,
  followersDelta,
  listenersDelta,
  hasSpotify,
  hasYoutube,
  hasTiktok,
}: PerformerPresentationProps) {
  const cities = useMemo(() => {
    const entries = cityData?.entries;
    if (!entries || entries.length === 0) return [];
    // Find the latest timestamp and only use those entries
    const latestTs = entries.reduce((max, e) => {
      const t = new Date(e.datetime).getTime();
      return t > max ? t : max;
    }, 0);
    return entries
      .filter((e) => new Date(e.datetime).getTime() === latestTs)
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [cityData]);
  const songs = rankings.slice(0, 10);

  return (
    <>
      {/* LEFT HALF: 2x3 metric cards grid */}
      <div className="relative h-full overflow-hidden rounded-2xl">
        {/* Noise texture */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
            backgroundRepeat: "repeat",
          }}
        />
        <BannerBackground bannerUrl={bannerUrl} performerName={performerName} />
        {/* 2x3 metric cards grid — exact D-04 order */}
        <div className="relative z-10 grid h-full grid-cols-2 grid-rows-3 gap-[1vh] overflow-hidden p-[1.5vh]">
          {/* Card 1: Streams */}
          {totalStreams != null && (
            <MetricCard
              label="Spotify Streams"
              value={totalStreams}
              delta={streamsDelta}
              glow="bg-green-500/[0.06]"
              icons={[
                hasSpotify && (
                  <SpotifyIcon className="size-full text-green-400" />
                ),
                hasYoutube && (
                  <YouTubeIcon className="size-full text-red-400" />
                ),
                hasTiktok && <TikTokIcon className="size-full text-white/70" />,
              ]}
              delay={0}
            />
          )}

          {/* Card 2: Ouvintes Mensais */}
          {monthlyListeners != null && (
            <MetricCard
              label="Ouvintes Mensais"
              value={monthlyListeners}
              delta={listenersDelta}
              glow="bg-emerald-500/[0.06]"
              icons={[
                hasSpotify && (
                  <SpotifyIcon className="size-full text-green-400" />
                ),
              ]}
              delay={0.06}
            />
          )}

          {/* Card 3: Videos */}
          {youtubeVideos != null && (
            <MetricCard
              label="Vídeos"
              value={youtubeVideos}
              delta={videosDelta}
              glow="bg-red-500/[0.06]"
              icons={[
                hasTiktok && <TikTokIcon className="size-full text-white/70" />,
                hasYoutube && (
                  <YouTubeIcon className="size-full text-red-400" />
                ),
              ]}
              delay={0.12}
            />
          )}

          {/* Card 4: Views */}
          {youtubeViews != null && (
            <MetricCard
              label="Views"
              value={youtubeViews}
              delta={viewsDelta}
              glow="bg-sky-500/[0.06]"
              icons={[
                hasTiktok && <TikTokIcon className="size-full text-white/70" />,
                hasYoutube && (
                  <YouTubeIcon className="size-full text-red-400" />
                ),
              ]}
              delay={0.18}
            />
          )}

          {/* Card 5: Seguidores */}
          {totalFollowers != null && (
            <MetricCard
              label="Seguidores"
              value={totalFollowers}
              delta={followersDelta}
              glow="bg-pink-500/[0.06]"
              icons={[
                hasSpotify && (
                  <SpotifyIcon className="size-full text-green-400" />
                ),
                hasYoutube && (
                  <YouTubeIcon className="size-full text-red-400" />
                ),
              ]}
              delay={0.24}
            />
          )}

          {/* Card 6: Top Cidades */}
          {cities.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35, delay: 0.3 }}
              className="group relative flex h-full flex-col overflow-hidden rounded-2xl bg-white/[0.03] p-[1.5vh] shadow-lg backdrop-blur-md"
            >
              <div className="absolute -top-6 -right-6 size-24 rounded-full bg-amber-500/[0.06] blur-2xl" />
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[clamp(1.5rem,1.3vw,2rem)] font-medium text-white/50">
                  Top Cidades
                </span>
                <StackedIcons
                  platforms={
                    [
                      hasSpotify && (
                        <SpotifyIcon className="size-full text-green-400" />
                      ),
                    ].filter(Boolean) as React.ReactNode[]
                  }
                />
              </div>
              <div className="flex flex-1 flex-col justify-center gap-[0.5vh]">
                {cities.map((city, i) => (
                  <div
                    key={`${city.extra_data?.city}-${city.extra_data?.country}`}
                    className="flex items-center justify-between"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="w-4 shrink-0 text-center text-[clamp(0.75rem,0.9vw,1rem)] font-bold text-white/30">
                        {i + 1}
                      </span>
                      <span className="truncate text-[clamp(0.75rem,0.9vw,1rem)] font-medium text-white/80">
                        {city.extra_data?.city ?? "—"}
                      </span>
                    </div>
                    <span className="ml-2 shrink-0 text-[clamp(0.75rem,0.9vw,1rem)] font-bold text-amber-400 tabular-nums">
                      {formatCompactNumber(city.value)}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* RIGHT HALF: Top 10 tracks */}
      <div className="relative h-full overflow-hidden rounded-2xl">
        {/* Noise texture */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
            backgroundRepeat: "repeat",
          }}
        />
        <BannerBackground bannerUrl={bannerUrl} performerName={performerName} />
        <div className="relative z-10 flex h-full flex-col overflow-hidden p-[1.5vh]">
          {songs.length > 0 ? (
            <div className="flex h-full flex-col gap-[0.5vh] overflow-hidden rounded-2xl bg-white/[0.03] p-[1.5vh] backdrop-blur-md">
              {songs.map((track, idx) => (
                <motion.div
                  key={track.trackId}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.04 }}
                  className="flex min-h-0 flex-1 items-center gap-3 rounded-lg bg-white/[0.02] px-[1vh] py-[0.5vh] transition-colors duration-200 hover:bg-white/[0.06]"
                >
                  {/* Thumbnail */}
                  <div className="relative size-9 shrink-0 overflow-hidden rounded-md">
                    {track.thumbnail ? (
                      <Image
                        src={track.thumbnail}
                        alt={track.trackName}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center bg-white/10">
                        <MusicIcon className="size-3 text-white/40" />
                      </div>
                    )}
                  </div>

                  {/* Track info */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[clamp(0.875rem,1vw,1.125rem)] font-medium text-white/90">
                      {track.trackName}
                    </p>
                    <p className="truncate text-[clamp(0.75rem,0.9vw,1rem)] font-medium text-white/45">
                      {track.artistName}
                    </p>
                  </div>

                  {/* Stream count */}
                  <div className="shrink-0 text-right">
                    <p className="text-[clamp(0.875rem,1vw,1.125rem)] font-medium text-white/70 tabular-nums">
                      {formatCompactNumber(track.streams)}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex h-full items-center justify-center rounded-2xl bg-white/[0.03] backdrop-blur-md">
              <p className="text-[clamp(0.875rem,1vw,1.125rem)] font-medium text-white/40">
                Dados indisponíveis
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
