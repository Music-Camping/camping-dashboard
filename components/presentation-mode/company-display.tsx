"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MusicIcon } from "lucide-react";
import Image from "next/image";

import type { DashboardResponse, MetricData } from "@/lib/types/dashboard";
import type { SpotifyMetrics } from "@/lib/types/spotify";
import type { PeriodFilter } from "@/lib/types/filters";
import { formatCompactNumber } from "@/lib/utils";

interface CityEntry {
  value: number;
  datetime: string;
  extra_data?: { city: string; country: string };
}

interface CompanyDisplayProps {
  performers: string[];
  rotationInterval: number;
  initialData?: DashboardResponse | null;
  spotifyData?: SpotifyMetrics;
  period: PeriodFilter;
}

/* ── Platform SVG Icons ── */

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

/* ── Helpers ── */

function StackedIcons({ platforms }: { platforms: React.ReactNode[] }) {
  if (platforms.length === 0) return null;
  return (
    <div className="flex items-center">
      {platforms.map((icon, i) => (
        <div
          key={i}
          className="flex size-6 items-center justify-center rounded-full border border-white/10 bg-black/60 p-1"
          style={{
            marginLeft: i === 0 ? 0 : -6,
            zIndex: platforms.length - i,
          }}
        >
          {icon}
        </div>
      ))}
    </div>
  );
}

function DeltaBadge({ value }: { value?: number }) {
  if (value == null || value === 0) return null;
  const isPositive = value > 0;
  return (
    <span
      className={`text-xl font-black tabular-nums ${isPositive ? "text-green-400" : "text-red-400"}`}
    >
      {isPositive ? "+" : ""}
      {formatCompactNumber(value)}
    </span>
  );
}

function getMetricDelta(
  metric: MetricData | undefined,
  periodFilter: PeriodFilter,
): number | undefined {
  if (!metric?.entries || metric.entries.length === 0) return undefined;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  let thresholdMs: number;
  switch (periodFilter) {
    case "today":
      thresholdMs = now.getTime() - 24 * 60 * 60 * 1000;
      break;
    case "7d":
      thresholdMs = now.getTime() - 6 * 24 * 60 * 60 * 1000;
      break;
    case "30d":
    default:
      thresholdMs = now.getTime() - 29 * 24 * 60 * 60 * 1000;
      break;
  }
  const sorted = [...metric.entries].sort(
    (a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime(),
  );
  const inPeriod = sorted.filter(
    (e) => new Date(e.datetime).getTime() >= thresholdMs,
  );
  if (inPeriod.length === 0) return undefined;
  return metric.latest - inPeriod[0].value;
}

/* ── Metric Card ── */

function MetricCard({
  label,
  value,
  delta,
  glowColor,
  icons,
  delay,
}: {
  label: string;
  value?: number;
  delta?: number;
  glowColor: string;
  icons: React.ReactNode[];
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, delay }}
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white/[0.03] p-4 shadow-lg backdrop-blur-md"
    >
      <div
        className={`absolute -top-6 -right-6 size-24 rounded-full ${glowColor} blur-2xl`}
      />
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-white/50">{label}</span>
        <StackedIcons platforms={icons.filter(Boolean) as React.ReactNode[]} />
      </div>
      <div className="mt-auto flex items-end justify-between">
        <p className="text-2xl font-black text-white tabular-nums">
          {value != null ? formatCompactNumber(value) : "—"}
        </p>
        <DeltaBadge value={delta} />
      </div>
    </motion.div>
  );
}

/* ── Artist Card ── */

function ArtistCard({
  name,
  bannerUrl,
  profileUrl,
  spotifyFollowers,
  youtubeSubscribers,
  monthlyListeners,
  delay,
}: {
  name: string;
  bannerUrl?: string | null;
  profileUrl?: string | null;
  spotifyFollowers?: number;
  youtubeSubscribers?: number;
  monthlyListeners?: number;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, delay }}
      className="relative flex-1 overflow-hidden rounded-2xl bg-white/[0.03] shadow-lg backdrop-blur-md"
    >
      {/* Banner BG */}
      {bannerUrl ? (
        <>
          <Image src={bannerUrl} alt={name} fill className="object-cover" />
          <div className="absolute inset-0 bg-black/50" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        </>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] to-transparent" />
      )}

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col justify-end p-5">
        {/* Profile + Name */}
        <div className="mb-3 flex items-center gap-3">
          <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-white/10">
            {profileUrl ? (
              <Image
                src={profileUrl}
                alt={name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex size-full items-center justify-center text-xl font-black text-white/50">
                {name.charAt(0)}
              </div>
            )}
          </div>
          <h3 className="text-2xl font-black tracking-tight text-white">
            {name}
          </h3>
        </div>

        {/* Quick stats */}
        <div className="flex items-center gap-4 text-sm text-white/60">
          {spotifyFollowers != null && (
            <div className="flex items-center gap-1.5">
              <SpotifyIcon className="size-3.5 text-green-400" />
              <span>{formatCompactNumber(spotifyFollowers)}</span>
            </div>
          )}
          {youtubeSubscribers != null && (
            <div className="flex items-center gap-1.5">
              <YouTubeIcon className="size-3.5 text-red-400" />
              <span>{formatCompactNumber(youtubeSubscribers)}</span>
            </div>
          )}
          {monthlyListeners != null && (
            <div className="flex items-center gap-1.5">
              <MusicIcon className="size-3.5 text-green-400/70" />
              <span>{formatCompactNumber(monthlyListeners)} ouvintes</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ── Main Component ── */

export function CompanyDisplay({
  performers,
  rotationInterval,
  initialData,
  spotifyData,
  period,
}: CompanyDisplayProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const performersPerPage = 3;

  const pages = useMemo(() => {
    const result: string[][] = [];
    for (let i = 0; i < performers.length; i += performersPerPage) {
      result.push(performers.slice(i, i + performersPerPage));
    }
    return result;
  }, [performers]);

  const totalPages = pages.length;

  // Auto-rotate artist pages
  useEffect(() => {
    if (totalPages <= 1) return undefined;
    const timePerPage = (rotationInterval * 1000) / totalPages;
    const interval = setInterval(() => {
      setCurrentPage((prev) => (prev + 1) % totalPages);
    }, timePerPage);
    return () => clearInterval(interval);
  }, [rotationInterval, totalPages]);

  const currentPerformers = pages[currentPage] ?? [];

  // Aggregate metrics across all performers
  const aggregated = useMemo(() => {
    let totalStreams = 0;
    let totalVideos = 0;
    let totalViews = 0;
    let totalFollowers = 0;
    let totalListeners = 0;
    let hasStreams = false;
    let hasVideos = false;
    let hasViews = false;
    let hasFollowers = false;
    let hasListeners = false;
    let hasSpotify = false;
    let hasYoutube = false;

    // Spotify track streams from rankings
    if (spotifyData?.rankingsByPerformer) {
      performers.forEach((name) => {
        const perf = spotifyData.rankingsByPerformer.find(
          (p) => p.performer === name,
        );
        if (perf?.rankings && perf.rankings.length > 0) {
          totalStreams += perf.rankings.reduce((sum, r) => sum + r.streams, 0);
          hasStreams = true;
          hasSpotify = true;
        }
      });
    }

    performers.forEach((name) => {
      const data = initialData?.[name];
      if (!data) return;

      if (data.spotify) {
        hasSpotify = true;
        if (data.spotify.followers?.latest) {
          totalFollowers += data.spotify.followers.latest;
          hasFollowers = true;
        }
        if (data.spotify.monthly_listeners?.latest) {
          totalListeners += data.spotify.monthly_listeners.latest;
          hasListeners = true;
        }
      }
      if (data.youtube) {
        hasYoutube = true;
        if (data.youtube.followers?.latest) {
          totalFollowers += data.youtube.followers.latest;
          hasFollowers = true;
        }
        if (data.youtube.views?.latest) {
          totalViews += data.youtube.views.latest;
          totalStreams += data.youtube.views.latest;
          hasViews = true;
          hasStreams = true;
        }
        if (data.youtube.video_count?.latest) {
          totalVideos += data.youtube.video_count.latest;
          hasVideos = true;
        }
      }
      if (data.instagram?.followers?.latest) {
        totalFollowers += data.instagram.followers.latest;
        hasFollowers = true;
      }
    });

    return {
      streams: hasStreams ? totalStreams : undefined,
      videos: hasVideos ? totalVideos : undefined,
      views: hasViews ? totalViews : undefined,
      followers: hasFollowers ? totalFollowers : undefined,
      listeners: hasListeners ? totalListeners : undefined,
      hasSpotify,
      hasYoutube,
    };
  }, [performers, initialData, spotifyData]);

  // Aggregate top cities across all performers (sum by city name)
  const topCities = useMemo(() => {
    const cityMap = new Map<
      string,
      { value: number; city: string; country: string }
    >();

    performers.forEach((name) => {
      const data = initialData?.[name];
      if (!data) return;
      const spotify = data.spotify as Record<string, unknown> | undefined;
      const cityMetric = spotify?.top_city_listeners as
        | { entries: CityEntry[] }
        | undefined;
      if (!cityMetric?.entries || cityMetric.entries.length === 0) return;

      // Find the latest timestamp for this performer
      const latestTs = cityMetric.entries.reduce((max, e) => {
        const t = new Date(e.datetime).getTime();
        return t > max ? t : max;
      }, 0);

      // Only use entries from the latest timestamp
      cityMetric.entries
        .filter((e) => new Date(e.datetime).getTime() === latestTs)
        .forEach((entry) => {
          const cityName = entry.extra_data?.city;
          if (!cityName) return;
          const key = `${cityName}-${entry.extra_data?.country}`;
          const existing = cityMap.get(key);
          if (existing) {
            existing.value += entry.value;
          } else {
            cityMap.set(key, {
              value: entry.value,
              city: cityName,
              country: entry.extra_data?.country ?? "",
            });
          }
        });
    });

    return [...cityMap.values()].sort((a, b) => b.value - a.value).slice(0, 5);
  }, [performers, initialData]);

  // Aggregate deltas
  const deltas = useMemo(() => {
    let streamsDelta = 0;
    let videosDelta = 0;
    let viewsDelta = 0;
    let followersDelta = 0;
    let listenersDelta = 0;

    performers.forEach((name) => {
      const data = initialData?.[name];
      if (!data) return;
      viewsDelta += getMetricDelta(data.youtube?.views, period) ?? 0;
      streamsDelta += getMetricDelta(data.youtube?.views, period) ?? 0;
      videosDelta += getMetricDelta(data.youtube?.video_count, period) ?? 0;
      followersDelta += getMetricDelta(data.spotify?.followers, period) ?? 0;
      followersDelta += getMetricDelta(data.youtube?.followers, period) ?? 0;
      followersDelta += getMetricDelta(data.instagram?.followers, period) ?? 0;
      listenersDelta +=
        getMetricDelta(data.spotify?.monthly_listeners, period) ?? 0;
    });

    return {
      streams: streamsDelta || undefined,
      videos: videosDelta || undefined,
      views: viewsDelta || undefined,
      followers: followersDelta || undefined,
      listeners: listenersDelta || undefined,
    };
  }, [performers, initialData, period]);

  const spotifyIcon = aggregated.hasSpotify && (
    <SpotifyIcon className="size-full text-green-400" />
  );
  const youtubeIcon = aggregated.hasYoutube && (
    <YouTubeIcon className="size-full text-red-400" />
  );

  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl">
      {/* Dark atmospheric background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(16,185,129,0.12)_0%,_transparent_50%),_radial-gradient(ellipse_at_bottom_left,_rgba(59,130,246,0.08)_0%,_transparent_50%),_linear-gradient(to_bottom,_#0a0a0a,_#111111)]" />
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          backgroundRepeat: "repeat",
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col px-5 py-4">
        <div className="grid flex-1 grid-cols-[2fr_3fr] gap-6 overflow-hidden">
          {/* ── Left: Metric Cards (only shown if data exists) ── */}
          <div className="grid grid-cols-2 grid-rows-3 gap-3.5">
            {aggregated.streams != null && (
              <MetricCard
                label="Streams"
                value={aggregated.streams}
                delta={deltas.streams}
                glowColor="bg-green-500/[0.06]"
                icons={[spotifyIcon, youtubeIcon]}
                delay={0}
              />
            )}
            {aggregated.videos != null && (
              <MetricCard
                label="Vídeos"
                value={aggregated.videos}
                delta={deltas.videos}
                glowColor="bg-red-500/[0.06]"
                icons={[youtubeIcon]}
                delay={0.06}
              />
            )}
            {aggregated.views != null && (
              <MetricCard
                label="Views"
                value={aggregated.views}
                delta={deltas.views}
                glowColor="bg-sky-500/[0.06]"
                icons={[youtubeIcon]}
                delay={0.12}
              />
            )}
            {aggregated.followers != null && (
              <MetricCard
                label="Seguidores"
                value={aggregated.followers}
                delta={deltas.followers}
                glowColor="bg-pink-500/[0.06]"
                icons={[spotifyIcon, youtubeIcon]}
                delay={0.18}
              />
            )}
            {aggregated.listeners != null && (
              <MetricCard
                label="Ouvintes Mensais"
                value={aggregated.listeners}
                delta={deltas.listeners}
                glowColor="bg-emerald-500/[0.06]"
                icons={[spotifyIcon]}
                delay={0.24}
              />
            )}
            {topCities.length > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.35, delay: 0.3 }}
                className="group relative flex flex-col overflow-hidden rounded-2xl bg-white/[0.03] p-4 shadow-lg backdrop-blur-md"
              >
                <div className="absolute -top-6 -right-6 size-24 rounded-full bg-amber-500/[0.06] blur-2xl" />
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-white/50">
                    Top Cidades
                  </span>
                  <StackedIcons
                    platforms={
                      [
                        aggregated.hasSpotify && (
                          <SpotifyIcon className="size-full text-green-400" />
                        ),
                      ].filter(Boolean) as React.ReactNode[]
                    }
                  />
                </div>
                <div className="flex flex-1 flex-col justify-center gap-1.5">
                  {topCities.map((city, i) => (
                    <div
                      key={`${city.city}-${city.country}`}
                      className="flex items-center justify-between"
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="w-4 shrink-0 text-center text-xs font-bold text-white/30">
                          {i + 1}
                        </span>
                        <span className="truncate text-sm font-medium text-white/80">
                          {city.city}
                        </span>
                      </div>
                      <span className="ml-2 shrink-0 text-sm font-bold text-amber-400 tabular-nums">
                        {formatCompactNumber(city.value)}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* ── Right: Artist Cards (3 at a time, rotating) ── */}
          <div className="relative flex flex-col gap-3.5 overflow-hidden">
            {/* Page indicator overlay */}
            {totalPages > 1 && (
              <div className="absolute top-2 right-2 z-20 rounded-md bg-black/40 px-2 py-0.5 text-xs font-medium text-white/60 backdrop-blur-sm">
                {currentPage + 1}/{totalPages}
              </div>
            )}

            <AnimatePresence mode="wait">
              <motion.div
                key={currentPage}
                className="flex flex-1 flex-col gap-3.5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {currentPerformers.map((performer, idx) => {
                  const data = initialData?.[performer];
                  return (
                    <ArtistCard
                      key={performer}
                      name={performer}
                      bannerUrl={data?.files?.banner ?? null}
                      profileUrl={data?.files?.profile ?? null}
                      spotifyFollowers={data?.spotify?.followers.latest}
                      youtubeSubscribers={data?.youtube?.followers.latest}
                      monthlyListeners={
                        data?.spotify?.monthly_listeners?.latest
                      }
                      delay={idx * 0.08}
                    />
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
