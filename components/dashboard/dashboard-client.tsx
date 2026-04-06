"use client";

import { useCallback, useEffect, useMemo } from "react";

import { AnimatePresence, motion } from "framer-motion";

import { PresentationControls } from "@/components/dashboard/presentation-controls";
import { CompanyDisplay } from "@/components/presentation-mode/company-display";
import { PerformerPresentation } from "@/components/presentation-mode/performer-presentation";
import { InstagramSection } from "@/components/dashboard/social-platforms/instagram-section";
import { YouTubeSection } from "@/components/dashboard/social-platforms/youtube-section";
import { SpotifyHub } from "@/components/dashboard/spotify/spotify-hub";
import { Separator } from "@/components/ui/separator";
import { usePresentationContext } from "@/contexts/presentation-context";
import { useFilters } from "@/hooks/use-filters";
import { usePresentationMode } from "@/hooks/use-presentation-mode";
import type {
  DashboardResponse,
  MetricData,
  PlatformMetrics,
} from "@/lib/types/dashboard";
import type { SpotifyMetrics } from "@/lib/types/spotify";
import type { PeriodFilter } from "@/lib/types/filters";
import { PERIOD_OPTIONS } from "@/lib/types/filters";
import { cn } from "@/lib/utils";

/**
 * Calculates the growth (delta) of a metric within a period.
 * Compares the current latest value against the earliest entry in the period.
 * Falls back to the oldest available entry if no entries exist in the period.
 */
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

  // Sort all entries by datetime
  const sorted = [...metric.entries].sort(
    (a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime(),
  );

  // Only use entries within the period — no fallback to avoid wrong deltas
  const inPeriod = sorted.filter(
    (e) => new Date(e.datetime).getTime() >= thresholdMs,
  );
  if (inPeriod.length === 0) return undefined;

  return metric.latest - inPeriod[0].value;
}

interface DashboardClientProps {
  initialData: DashboardResponse | null;
  spotifyData?: SpotifyMetrics;
}

export function DashboardClient({
  initialData,
  spotifyData,
}: DashboardClientProps) {
  const { setIsPresentationMode } = usePresentationContext();
  const { filters, setAvailablePerformers, setSelectedPerformers, setPeriod } =
    useFilters();
  const { selectedPerformers, period } = filters;
  // Memoize available performers from data (excluding company and total)
  const allPerformers = useMemo(() => {
    if (!initialData) return [];
    return Object.keys(initialData).filter(
      (key) => key !== "total" && key !== "company",
    );
  }, [initialData]);

  // Extract companies info
  const companies = useMemo(() => {
    return initialData?.company?.companies ?? [];
  }, [initialData]);

  // Update available performers when data changes
  useEffect(() => {
    if (allPerformers.length > 0) {
      setAvailablePerformers(allPerformers);
    }
  }, [allPerformers, setAvailablePerformers]);

  // Presentation Mode
  const presentation = usePresentationMode(allPerformers, companies);

  // Sync presentation mode with context
  useEffect(() => {
    setIsPresentationMode(presentation.isActive);
  }, [presentation.isActive, setIsPresentationMode]);

  // Listen for presentation start event from header
  useEffect(() => {
    const handleStartPresentation = () => {
      presentation.startPresentation();
    };

    window.addEventListener("start-presentation", handleStartPresentation);
    return () =>
      window.removeEventListener("start-presentation", handleStartPresentation);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [presentation.startPresentation]);

  // Update selected performers when presentation mode changes performer
  useEffect(() => {
    if (presentation.isActive && presentation.currentPerformer) {
      setSelectedPerformers([presentation.currentPerformer]);
    }
  }, [
    presentation.isActive,
    presentation.currentPerformer,
    setSelectedPerformers,
  ]);

  // Calculate aggregated metrics based on selected performers
  const getAggregatedPlatformData = useCallback(
    (
      platform: "youtube" | "instagram" | "spotify",
    ): PlatformMetrics | undefined => {
      if (!initialData) return undefined;

      // If no performers selected, use total
      if (selectedPerformers.length === 0) {
        return initialData.company?.[platform];
      }

      // Otherwise, aggregate selected performers
      const result: PlatformMetrics = {
        followers: { latest: 0, entries: [] },
      };

      selectedPerformers.forEach((performer) => {
        const performerData = initialData[performer];
        if (performerData?.[platform]) {
          const platformData = performerData[platform]!;

          // Aggregate followers
          result.followers.latest += platformData.followers.latest;
          result.followers.entries.push(...platformData.followers.entries);

          // Aggregate platform-specific metrics
          if (platform === "youtube") {
            if (!result.views) result.views = { latest: 0, entries: [] };
            if (!result.video_count)
              result.video_count = { latest: 0, entries: [] };

            if (platformData.views) {
              result.views.latest += platformData.views.latest;
              result.views.entries.push(...platformData.views.entries);
            }
            if (platformData.video_count) {
              result.video_count.latest += platformData.video_count.latest;
              result.video_count.entries.push(
                ...platformData.video_count.entries,
              );
            }
          } else if (platform === "instagram") {
            if (!result.post_count)
              result.post_count = { latest: 0, entries: [] };

            if (platformData.post_count) {
              result.post_count.latest += platformData.post_count.latest;
              result.post_count.entries.push(
                ...platformData.post_count.entries,
              );
            }
          } else if (platform === "spotify") {
            if (!result.monthly_listeners)
              result.monthly_listeners = { latest: 0, entries: [] };

            if (platformData.monthly_listeners) {
              result.monthly_listeners.latest +=
                platformData.monthly_listeners.latest;
              result.monthly_listeners.entries.push(
                ...platformData.monthly_listeners.entries,
              );
            }
          }
        }
      });

      return result;
    },
    [initialData, selectedPerformers],
  );

  // Memoize platform data
  const youtubeData = useMemo(
    () => getAggregatedPlatformData("youtube"),
    [getAggregatedPlatformData],
  );
  const instagramData = useMemo(
    () => getAggregatedPlatformData("instagram"),
    [getAggregatedPlatformData],
  );
  const spotifyDataFromDashboard = useMemo(
    () => getAggregatedPlatformData("spotify"),
    [getAggregatedPlatformData],
  );

  // ─── TV-specific data ──────────────────────────────────────────────────────
  // Computed directly from currentPerformer (synchronous), bypassing the
  // selectedPerformers state that updates asynchronously via useEffect.
  // This eliminates the "piscada" (flicker) caused by the data lag.

  // Top tracks for current performer (up to 5 for the songs list)
  const currentPerformerTracks = useMemo(() => {
    if (!spotifyData?.rankingsByPerformer) return [];
    const performer = presentation.currentPerformer;
    if (performer) {
      return (
        spotifyData.rankingsByPerformer
          .find((p) => p.performer === performer)
          ?.rankings.slice(0, 10) ?? []
      );
    }
    return spotifyData.rankingsByPerformer[0]?.rankings.slice(0, 10) ?? [];
  }, [spotifyData, presentation.currentPerformer]);

  // Total streams (Spotify track streams only)
  const tvTotalStreams = useMemo(() => {
    let total = 0;
    let hasData = false;

    // Spotify streams
    if (spotifyData?.rankingsByPerformer) {
      const performer = presentation.currentPerformer;
      const rankings = performer
        ? spotifyData.rankingsByPerformer.find((p) => p.performer === performer)
            ?.rankings
        : spotifyData.rankingsByPerformer[0]?.rankings;
      if (rankings && rankings.length > 0) {
        total += rankings.reduce((sum, r) => sum + r.streams, 0);
        hasData = true;
      }
    }

    return hasData ? total : undefined;
  }, [spotifyData, presentation.currentPerformer]);

  // Performer-specific platform data (sync, no flicker)
  const tvPerformerData = useMemo(() => {
    if (!presentation.currentPerformer || !initialData) return null;
    return initialData[presentation.currentPerformer] ?? null;
  }, [presentation.currentPerformer, initialData]);

  // City data from spotify.top_city_listeners
  const tvCityData = useMemo(() => {
    const spotify = tvPerformerData?.spotify as
      | Record<string, unknown>
      | undefined;
    return (
      (spotify?.top_city_listeners as
        | {
            entries: Array<{
              value: number;
              datetime: string;
              extra_data?: { city: string; country: string };
            }>;
          }
        | undefined) ?? null
    );
  }, [tvPerformerData]);

  // Performer image URLs from files
  const tvBannerUrl = useMemo(() => {
    return tvPerformerData?.files?.banner ?? null;
  }, [tvPerformerData]);

  const tvProfileUrl = useMemo(() => {
    return tvPerformerData?.files?.profile ?? null;
  }, [tvPerformerData]);

  // Total followers (Spotify + YouTube + Instagram)
  const tvTotalFollowers = useMemo(() => {
    if (!tvPerformerData) return undefined;
    let total = 0;
    let hasData = false;
    if (tvPerformerData.spotify?.followers.latest) {
      total += tvPerformerData.spotify.followers.latest;
      hasData = true;
    }
    if (tvPerformerData.youtube?.followers.latest) {
      total += tvPerformerData.youtube.followers.latest;
      hasData = true;
    }
    if (tvPerformerData.instagram?.followers.latest) {
      total += tvPerformerData.instagram.followers.latest;
      hasData = true;
    }
    return hasData ? total : undefined;
  }, [tvPerformerData]);

  // Metric deltas (growth within selected period)
  const tvVideosDelta = useMemo(
    () => getMetricDelta(tvPerformerData?.youtube?.video_count, period),
    [tvPerformerData, period],
  );
  const tvViewsDelta = useMemo(
    () => getMetricDelta(tvPerformerData?.youtube?.views, period),
    [tvPerformerData, period],
  );
  const tvFollowersDelta = useMemo(() => {
    const sp = getMetricDelta(tvPerformerData?.spotify?.followers, period) ?? 0;
    const yt = getMetricDelta(tvPerformerData?.youtube?.followers, period) ?? 0;
    const ig =
      getMetricDelta(tvPerformerData?.instagram?.followers, period) ?? 0;
    const total = sp + yt + ig;
    return total !== 0 ? total : undefined;
  }, [tvPerformerData, period]);
  const tvListenersDelta = useMemo(
    () => getMetricDelta(tvPerformerData?.spotify?.monthly_listeners, period),
    [tvPerformerData, period],
  );

  if (!initialData) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">
          Não foi possível carregar os dados do dashboard
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col gap-8 p-4",
        presentation.isActive &&
          "presentation-mode h-screen overflow-hidden p-6",
      )}
    >
      {/* Presentation Controls - Hidden, only shows when active */}

      {presentation.isActive ? (
        /* TV Layout — sem scroll, tudo visível em tela cheia */
        <div className="grid h-full grid-rows-[auto_1fr] gap-3 overflow-hidden">
          {/* ROW 1: Header compacto — performer + filtro de período + indicador */}
          <div className="flex items-center gap-4 rounded-xl border bg-card/80 px-5 py-2.5 shadow-sm backdrop-blur">
            <AnimatePresence mode="wait">
              <motion.div
                key={
                  presentation.showingCompany
                    ? `company-${presentation.currentCompany?.name}`
                    : (presentation.currentPerformer ?? "all")
                }
                className="flex items-center gap-3"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.25 }}
              >
                {/* Profile image (square) or fallback initial */}
                {(() => {
                  const profileSrc = presentation.showingCompany
                    ? presentation.currentCompany?.files?.logo
                    : tvProfileUrl;
                  const label = presentation.showingCompany
                    ? (presentation.currentCompany?.name ?? "C")
                    : (presentation.currentPerformer ?? "●");
                  return profileSrc ? (
                    <div className="relative size-20 shrink-0 overflow-hidden rounded-xl">
                      <img
                        src={profileSrc}
                        alt={label}
                        className="size-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex size-20 items-center justify-center rounded-xl bg-primary/20 text-2xl font-bold text-primary">
                      {label.charAt(0)}
                    </div>
                  );
                })()}
                <div>
                  <p className="mb-0.5 text-xs leading-none text-muted-foreground">
                    Exibindo
                  </p>
                  <p className="text-xl leading-none font-bold">
                    {presentation.showingCompany
                      ? (presentation.currentCompany?.name ?? "Empresa")
                      : (presentation.currentPerformer ?? "Todos")}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="flex-1" />

            {/* Filtro de período */}
            <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
              {PERIOD_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setPeriod(option.value)}
                  className={cn(
                    "rounded px-3 py-1 text-sm font-medium transition-colors",
                    period === option.value
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {/* Indicador de auto-rotação */}
            {presentation.autoRotate && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Próximo em {presentation.rotationInterval}s</span>
                <div className="size-2 animate-pulse rounded-full bg-green-500" />
              </div>
            )}
          </div>

          {/* ROW 2: Conteúdo animado — crossfade sem piscada */}
          <div className="relative min-h-0 overflow-hidden">
            <AnimatePresence mode="sync">
              {presentation.showingCompany && presentation.currentCompany ? (
                <motion.div
                  key={`company-${presentation.currentCompany.name}`}
                  className="absolute inset-0"
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "-100%" }}
                  transition={{ duration: 0.45, ease: "easeInOut" }}
                >
                  <CompanyDisplay
                    performers={presentation.currentCompany.performers}
                    rotationInterval={presentation.rotationInterval}
                    initialData={initialData}
                    spotifyData={spotifyData}
                    period={period}
                    bannerUrl={presentation.currentCompany.files?.company}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key={presentation.currentPerformer ?? "all"}
                  className="absolute inset-0"
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "-100%" }}
                  transition={{ duration: 0.45, ease: "easeInOut" }}
                >
                  <PerformerPresentation
                    performerName={presentation.currentPerformer ?? "Todos"}
                    rankings={currentPerformerTracks}
                    cityData={tvCityData}
                    bannerUrl={tvBannerUrl}
                    totalStreams={tvTotalStreams}
                    youtubeVideos={
                      tvPerformerData?.youtube?.video_count?.latest
                    }
                    youtubeViews={tvPerformerData?.youtube?.views?.latest}
                    streamsDelta={undefined}
                    videosDelta={tvVideosDelta}
                    viewsDelta={tvViewsDelta}
                    totalFollowers={tvTotalFollowers}
                    monthlyListeners={
                      tvPerformerData?.spotify?.monthly_listeners?.latest
                    }
                    followersDelta={tvFollowersDelta}
                    listenersDelta={tvListenersDelta}
                    hasSpotify={!!tvPerformerData?.spotify}
                    hasYoutube={!!tvPerformerData?.youtube}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Controles flutuantes */}
          <PresentationControls
            isActive={presentation.isActive}
            isFullscreen={presentation.isFullscreen}
            autoRotate={presentation.autoRotate}
            rotationInterval={presentation.rotationInterval}
            currentPerformer={presentation.currentPerformer}
            performers={allPerformers}
            companies={companies}
            enabledItems={presentation.enabledItems}
            onStart={presentation.startPresentation}
            onStop={presentation.stopPresentation}
            onToggleFullscreen={presentation.toggleFullscreen}
            onToggleAutoRotate={presentation.toggleAutoRotate}
            onSetInterval={presentation.setRotationInterval}
            onGoToNext={presentation.goToNext}
            onToggleItem={presentation.toggleItemEnabled}
          />
        </div>
      ) : (
        /* Normal Layout - Com scroll */
        <>
          {/* Section 1: Spotify - Unified Hub */}
          <SpotifyHub
            spotifyData={spotifyData}
            dashboardData={spotifyDataFromDashboard}
            fullDashboardData={initialData || undefined}
            isLoading={false}
            period={period}
          />

          {(youtubeData?.followers?.latest ?? 0) > 0 && (
            <>
              <Separator />

              {/* Section 2: YouTube */}
              <YouTubeSection
                data={youtubeData}
                fullDashboardData={initialData || undefined}
                period={period}
              />
            </>
          )}

          {(instagramData?.followers?.latest ?? 0) > 0 && (
            <>
              <Separator />

              {/* Section 3: Instagram */}
              <InstagramSection
                data={instagramData}
                fullDashboardData={initialData || undefined}
                period={period}
              />
            </>
          )}
        </>
      )}
    </div>
  );
}
