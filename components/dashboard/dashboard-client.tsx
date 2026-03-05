"use client";

import { useCallback, useEffect, useMemo } from "react";

import { AnimatePresence, motion } from "framer-motion";
import { InstagramIcon, Music2Icon, YoutubeIcon } from "lucide-react";

import { PresentationControls } from "@/components/dashboard/presentation-controls";
import { InstagramSection } from "@/components/dashboard/social-platforms/instagram-section";
import { YouTubeSection } from "@/components/dashboard/social-platforms/youtube-section";
import { SpotifyHub } from "@/components/dashboard/spotify/spotify-hub";
import { TopRankings } from "@/components/dashboard/spotify/top-rankings";
import { MetricsChart } from "@/components/dashboard/metrics-chart";
import { Separator } from "@/components/ui/separator";
import { usePresentationContext } from "@/contexts/presentation-context";
import { useChartData } from "@/hooks/use-chart-data";
import { useFilters } from "@/hooks/use-filters";
import { usePresentationMode } from "@/hooks/use-presentation-mode";
import type { DashboardResponse, PlatformMetrics } from "@/lib/types/dashboard";
import type { SpotifyMetrics } from "@/lib/types/spotify";
import { PERIOD_OPTIONS } from "@/lib/types/filters";
import { cn, formatCompactNumber } from "@/lib/utils";

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
  // Memoize available performers from data
  const allPerformers = useMemo(() => {
    if (!initialData) return [];
    return Object.keys(initialData).filter((key) => key !== "total");
  }, [initialData]);

  // Update available performers when data changes
  useEffect(() => {
    if (allPerformers.length > 0) {
      setAvailablePerformers(allPerformers);
    }
  }, [allPerformers, setAvailablePerformers]);

  // Presentation Mode
  const presentation = usePresentationMode(allPerformers);

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

  // Get chart data for each platform
  const youtubeChartData = useChartData(
    initialData || undefined,
    "youtube",
    "followers",
    selectedPerformers,
    period,
  );
  const instagramChartData = useChartData(
    initialData || undefined,
    "instagram",
    "followers",
    selectedPerformers,
    period,
  );
  const spotifyFollowersChartData = useChartData(
    initialData || undefined,
    "spotify",
    "followers",
    selectedPerformers,
    period,
  );
  const spotifyListenersChartData = useChartData(
    initialData || undefined,
    "spotify",
    "monthly_listeners",
    selectedPerformers,
    period,
  );

  // Calculate aggregated metrics based on selected performers
  const getAggregatedPlatformData = useCallback(
    (
      platform: "youtube" | "instagram" | "spotify",
    ): PlatformMetrics | undefined => {
      if (!initialData) return undefined;

      // If no performers selected, use total
      if (selectedPerformers.length === 0) {
        return initialData.total?.[platform];
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

  // Top 3 tracks for the current performer (used in TV mode ranking panel)
  const currentPerformerTracks = useMemo(() => {
    if (!spotifyData?.rankingsByPerformer) return [];
    const performer = presentation.currentPerformer;
    if (performer) {
      return (
        spotifyData.rankingsByPerformer
          .find((p) => p.performer === performer)
          ?.rankings.slice(0, 3) ?? []
      );
    }
    return spotifyData.rankingsByPerformer[0]?.rankings.slice(0, 3) ?? [];
  }, [spotifyData, presentation.currentPerformer]);

  // ─── TV-specific data ──────────────────────────────────────────────────────
  // Computed directly from currentPerformer (synchronous), bypassing the
  // selectedPerformers state that updates asynchronously via useEffect.
  // This eliminates the "piscada" (flicker) caused by the data lag.
  const tvPerformers = useMemo(
    () =>
      presentation.currentPerformer ? [presentation.currentPerformer] : [],
    [presentation.currentPerformer],
  );

  const tvYoutubeData = useMemo(
    () =>
      presentation.currentPerformer
        ? initialData?.[presentation.currentPerformer]?.youtube
        : youtubeData,
    [presentation.currentPerformer, initialData, youtubeData],
  );

  const tvInstagramData = useMemo(
    () =>
      presentation.currentPerformer
        ? initialData?.[presentation.currentPerformer]?.instagram
        : instagramData,
    [presentation.currentPerformer, initialData, instagramData],
  );

  const tvSpotifyData = useMemo(
    () =>
      presentation.currentPerformer
        ? initialData?.[presentation.currentPerformer]?.spotify
        : spotifyDataFromDashboard,
    [presentation.currentPerformer, initialData, spotifyDataFromDashboard],
  );

  const tvYoutubeChartData = useChartData(
    initialData || undefined,
    "youtube",
    "followers",
    tvPerformers,
    period,
  );

  const tvInstagramChartData = useChartData(
    initialData || undefined,
    "instagram",
    "followers",
    tvPerformers,
    period,
  );

  const tvSpotifyFollowersChartData = useChartData(
    initialData || undefined,
    "spotify",
    "followers",
    tvPerformers,
    period,
  );

  const tvSpotifyListenersChartData = useChartData(
    initialData || undefined,
    "spotify",
    "monthly_listeners",
    tvPerformers,
    period,
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
                key={presentation.currentPerformer ?? "all"}
                className="flex items-center gap-3"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.25 }}
              >
                <div className="flex size-9 items-center justify-center rounded-full bg-primary/20 text-lg font-bold text-primary">
                  {presentation.currentPerformer?.charAt(0) ?? "●"}
                </div>
                <div>
                  <p className="mb-0.5 text-xs leading-none text-muted-foreground">
                    Exibindo
                  </p>
                  <p className="text-lg leading-none font-bold">
                    {presentation.currentPerformer ?? "Todos"}
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
              <motion.div
                key={presentation.currentPerformer ?? "all"}
                className="absolute inset-0 flex flex-col gap-4 overflow-y-auto"
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ duration: 0.45, ease: "easeInOut" }}
              >
                {/* ── SPOTIFY ── */}
                {(tvSpotifyData ||
                  (presentation.currentPerformer &&
                    (initialData?.[presentation.currentPerformer]
                      ?.spotify_playlists?.length ?? 0) > 0)) && (
                  <div className="rounded-xl border bg-card p-6">
                    <div className="grid grid-cols-[1fr_minmax(0,40%)] gap-6">
                      {/* Esquerda: header + métricas + gráficos */}
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-2">
                          <Music2Icon className="size-5 text-green-500" />
                          <span className="text-xl font-bold">Spotify</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="rounded-lg bg-muted/50 p-4">
                            <p className="text-sm text-muted-foreground">
                              Seguidores
                            </p>
                            <p className="text-2xl font-bold tabular-nums">
                              {tvSpotifyData
                                ? formatCompactNumber(
                                    tvSpotifyData.followers.latest,
                                  )
                                : "—"}
                            </p>
                          </div>
                          <div className="rounded-lg bg-muted/50 p-4">
                            <p className="text-sm text-muted-foreground">
                              Ouvintes Mensais
                            </p>
                            <p className="text-2xl font-bold tabular-nums">
                              {tvSpotifyData?.monthly_listeners
                                ? formatCompactNumber(
                                    tvSpotifyData.monthly_listeners.latest,
                                  )
                                : "—"}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-4">
                          <div className="flex-1">
                            <MetricsChart
                              title="Seguidores"
                              data={tvSpotifyFollowersChartData}
                              icon={
                                <Music2Icon className="size-4 text-green-500" />
                              }
                            />
                          </div>
                          {tvSpotifyData?.monthly_listeners && (
                            <div className="flex-1">
                              <MetricsChart
                                title="Ouvintes Mensais"
                                data={tvSpotifyListenersChartData}
                                icon={
                                  <Music2Icon className="size-4 text-green-500" />
                                }
                              />
                            </div>
                          )}
                        </div>

                        {/* Playlists in TV mode (compact) */}
                        {presentation.currentPerformer &&
                          (initialData?.[presentation.currentPerformer]
                            ?.spotify_playlists?.length ?? 0) > 0 && (
                            <div className="space-y-2">
                              <p className="text-sm font-medium text-muted-foreground">
                                Playlists
                              </p>
                              {initialData![
                                presentation.currentPerformer
                              ].spotify_playlists!.map((playlist, idx) => (
                                <div
                                  key={idx}
                                  className="rounded-lg bg-muted/50 px-4 py-2"
                                >
                                  <p className="text-sm font-medium">
                                    {playlist.name}
                                  </p>
                                  <div className="flex gap-4 text-sm text-muted-foreground">
                                    <span>
                                      Seguidores:{" "}
                                      {formatCompactNumber(
                                        playlist.followers.latest,
                                      )}
                                    </span>
                                    <span>
                                      Faixas:{" "}
                                      {formatCompactNumber(
                                        playlist.track_count.latest,
                                      )}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                      </div>

                      {/* Direita: top 3 rankings */}
                      <TopRankings rankings={currentPerformerTracks} />
                    </div>
                  </div>
                )}

                {/* ── YOUTUBE + INSTAGRAM ── */}
                <div className="grid grid-cols-2 gap-4">
                  {/* YouTube */}
                  <div className="flex flex-col gap-4 rounded-xl border bg-card p-6">
                    <div className="flex items-center gap-2">
                      <YoutubeIcon className="size-5 text-red-500" />
                      <span className="text-xl font-bold">YouTube</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded-lg bg-muted/50 p-4">
                        <p className="text-sm text-muted-foreground">
                          Inscritos
                        </p>
                        <p className="text-2xl font-bold tabular-nums">
                          {tvYoutubeData
                            ? formatCompactNumber(
                                tvYoutubeData.followers.latest,
                              )
                            : "—"}
                        </p>
                      </div>
                      <div className="rounded-lg bg-muted/50 p-4">
                        <p className="text-sm text-muted-foreground">
                          Views Totais
                        </p>
                        <p className="text-2xl font-bold tabular-nums">
                          {tvYoutubeData?.views
                            ? formatCompactNumber(tvYoutubeData.views.latest)
                            : "—"}
                        </p>
                      </div>
                    </div>
                    <MetricsChart
                      title="Inscritos"
                      data={tvYoutubeChartData}
                      icon={<YoutubeIcon className="size-4 text-red-500" />}
                    />
                  </div>

                  {/* Instagram */}
                  <div className="flex flex-col gap-4 rounded-xl border bg-card p-6">
                    <div className="flex items-center gap-2">
                      <InstagramIcon className="size-5 text-pink-500" />
                      <span className="text-xl font-bold">Instagram</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded-lg bg-muted/50 p-4">
                        <p className="text-sm text-muted-foreground">
                          Seguidores
                        </p>
                        <p className="text-2xl font-bold tabular-nums">
                          {tvInstagramData
                            ? formatCompactNumber(
                                tvInstagramData.followers.latest,
                              )
                            : "—"}
                        </p>
                      </div>
                      <div className="rounded-lg bg-muted/50 p-4">
                        <p className="text-sm text-muted-foreground">Posts</p>
                        <p className="text-2xl font-bold tabular-nums">
                          {tvInstagramData?.post_count
                            ? formatCompactNumber(
                                tvInstagramData.post_count.latest,
                              )
                            : "—"}
                        </p>
                      </div>
                    </div>
                    <MetricsChart
                      title="Seguidores"
                      data={tvInstagramChartData}
                      icon={<InstagramIcon className="size-4 text-pink-500" />}
                    />
                  </div>
                </div>
              </motion.div>
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
            onStart={presentation.startPresentation}
            onStop={presentation.stopPresentation}
            onToggleFullscreen={presentation.toggleFullscreen}
            onToggleAutoRotate={presentation.toggleAutoRotate}
            onSetInterval={presentation.setRotationInterval}
            onGoToPerformer={presentation.goToPerformer}
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
            followersChartData={spotifyFollowersChartData}
            listenersChartData={spotifyListenersChartData}
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
                chartData={youtubeChartData}
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
                chartData={instagramChartData}
                period={period}
              />
            </>
          )}
        </>
      )}
    </div>
  );
}
