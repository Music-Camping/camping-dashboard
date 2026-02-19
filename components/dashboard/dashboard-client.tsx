"use client";

import { useCallback, useEffect, useMemo } from "react";

import { PresentationControls } from "@/components/dashboard/presentation-controls";
import { InstagramSection } from "@/components/dashboard/social-platforms/instagram-section";
import { YouTubeSection } from "@/components/dashboard/social-platforms/youtube-section";
import { SpotifyHub } from "@/components/dashboard/spotify/spotify-hub";
import { MusicTable } from "@/components/dashboard/music-catalog/music-table";
import { Separator } from "@/components/ui/separator";
import { usePresentationContext } from "@/contexts/presentation-context";
import { useChartData } from "@/hooks/use-chart-data";
import { useFilters } from "@/hooks/use-filters";
import { usePresentationMode } from "@/hooks/use-presentation-mode";
import { useMusicCatalog } from "@/hooks/use-music-catalog";
import type { DashboardResponse, PlatformMetrics } from "@/lib/types/dashboard";
import type { SpotifyMetrics } from "@/lib/types/spotify";
import { cn } from "@/lib/utils";

interface DashboardClientProps {
  initialData: DashboardResponse | null;
  spotifyData?: SpotifyMetrics;
}

export function DashboardClient({
  initialData,
  spotifyData,
}: DashboardClientProps) {
  const { setIsPresentationMode } = usePresentationContext();
  const { filters, setAvailablePerformers, setSelectedPerformers } =
    useFilters();
  const { selectedPerformers, period } = filters;
  const { tracks: musicTracks } = useMusicCatalog();

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
  }, [presentation]);

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

  if (!initialData) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-muted-foreground">
          Não foi possível carregar os dados do dashboard
        </p>
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
        /* TV Layout - Otimizado para caber em uma tela */
        <div className="grid h-full grid-rows-[auto_1fr] gap-4 overflow-hidden">
          {/* Performer Header - Destaque grande */}
          <div className="flex items-center justify-between rounded-lg bg-gradient-to-r from-primary/20 via-primary/10 to-transparent px-6 py-4 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="flex size-12 items-center justify-center rounded-full bg-primary/20">
                <span className="text-2xl font-bold text-primary">
                  {presentation.currentPerformer?.charAt(0) || ""}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Exibindo dados de
                </p>
                <h1 className="text-3xl font-bold tracking-tight">
                  {presentation.currentPerformer || "Todos"}
                </h1>
              </div>
            </div>

            {/* Progress indicator */}
            {presentation.autoRotate && (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Próximo em</p>
                  <p className="text-lg font-semibold">
                    {presentation.rotationInterval}s
                  </p>
                </div>
                <div className="size-2 animate-pulse rounded-full bg-green-500" />
              </div>
            )}
          </div>

          {/* Presentation Controls - Floating */}
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

          {/* Content Grid - 2x2 layout para TV */}
          <div className="grid grid-cols-2 grid-rows-2 gap-4 overflow-auto">
            {/* Spotify */}
            <div className="overflow-auto">
              <SpotifyHub
                spotifyData={spotifyData}
                dashboardData={spotifyDataFromDashboard}
                fullDashboardData={initialData || undefined}
                followersChartData={spotifyFollowersChartData}
                listenersChartData={spotifyListenersChartData}
                isLoading={false}
              />
            </div>

            {/* YouTube */}
            <div className="overflow-auto">
              <YouTubeSection
                data={youtubeData}
                fullDashboardData={initialData || undefined}
                chartData={youtubeChartData}
              />
            </div>

            {/* Instagram */}
            <div className="overflow-auto">
              <InstagramSection
                data={instagramData}
                fullDashboardData={initialData || undefined}
                chartData={instagramChartData}
              />
            </div>

            {/* Championships */}
            <div className="overflow-auto">
              {/* ChampionshipsSection será adicionado */}
              <div className="text-sm text-muted-foreground">Championships</div>
            </div>
          </div>
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
          />

          <Separator />

          {/* Section 2: YouTube */}
          <YouTubeSection
            data={youtubeData}
            fullDashboardData={initialData || undefined}
            chartData={youtubeChartData}
          />

          <Separator />

          {/* Section 3: Instagram */}
          <InstagramSection
            data={instagramData}
            fullDashboardData={initialData || undefined}
            chartData={instagramChartData}
          />

          <Separator />

          {/* Section 4: Championships */}
          {/* <ChampionshipsSection championships={championships} /> */}
          <div className="text-sm text-muted-foreground">
            Championships section
          </div>

          <Separator />

          {/* Section 5: Music Catalog */}
          <MusicTable tracks={musicTracks} />
        </>
      )}
    </div>
  );
}
