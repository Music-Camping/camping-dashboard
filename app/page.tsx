"use client";

import { useEffect } from "react";
import { InstagramIcon, YoutubeIcon } from "lucide-react";

import { MetricCard } from "@/components/dashboard/metric-card";
import { MetricsChart } from "@/components/dashboard/metrics-chart";
import { Skeleton } from "@/components/ui/skeleton";
import { useChartData } from "@/hooks/use-chart-data";
import { useFilters } from "@/hooks/use-filters";
import { useDashboard } from "@/lib/hooks/dashboard";

export default function DashboardPage() {
  const { data, isLoading } = useDashboard();
  const { filters, setAvailablePerformers } = useFilters();
  const { selectedPerformers, period } = filters;

  // Extract and set available performers from API data
  useEffect(() => {
    if (data) {
      const performers = Object.keys(data).filter((key) => key !== "total");
      setAvailablePerformers(performers);
    }
  }, [data, setAvailablePerformers]);

  // Get chart data for YouTube and Instagram followers
  const youtubeChartData = useChartData(
    data,
    "youtube",
    "followers",
    selectedPerformers,
    period,
  );
  const instagramChartData = useChartData(
    data,
    "instagram",
    "followers",
    selectedPerformers,
    period,
  );

  // Calculate totals based on selected performers
  const getAggregatedMetrics = (
    platform: "youtube" | "instagram",
    metric: "followers" | "views" | "video_count" | "post_count",
  ) => {
    if (!data) return { latest: 0, entries: [] };

    // If no performers selected, use total
    if (selectedPerformers.length === 0) {
      return data.total?.[platform]?.[metric] ?? { latest: 0, entries: [] };
    }

    // Otherwise, sum up selected performers
    let total = 0;
    const allEntries: Array<{ value: number; datetime: string }> = [];

    selectedPerformers.forEach((performer) => {
      const performerData = data[performer];
      if (performerData?.[platform]?.[metric]) {
        total += performerData[platform]![metric]!.latest;
        allEntries.push(...performerData[platform]![metric]!.entries);
      }
    });

    return { latest: total, entries: allEntries };
  };

  const youtubeFollowers = getAggregatedMetrics("youtube", "followers");
  const youtubeViews = getAggregatedMetrics("youtube", "views");
  const youtubeVideos = getAggregatedMetrics("youtube", "video_count");
  const instagramFollowers = getAggregatedMetrics("instagram", "followers");
  const instagramPosts = getAggregatedMetrics("instagram", "post_count");

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-4">
        <div className="grid grid-cols-5 gap-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Metric Cards Row */}
      <div className="grid grid-cols-5 gap-3">
        {/* YouTube Metrics */}
        <MetricCard
          title="Inscritos"
          value={youtubeFollowers.latest}
          entries={youtubeFollowers.entries}
          icon={<YoutubeIcon className="size-4 text-red-500" />}
        />
        <MetricCard
          title="Views"
          value={youtubeViews.latest}
          entries={youtubeViews.entries}
          icon={<YoutubeIcon className="size-4 text-red-500" />}
        />
        <MetricCard
          title="Vídeos"
          value={youtubeVideos.latest}
          entries={youtubeVideos.entries}
          icon={<YoutubeIcon className="size-4 text-red-500" />}
        />

        {/* Instagram Metrics */}
        <MetricCard
          title="Seguidores"
          value={instagramFollowers.latest}
          entries={instagramFollowers.entries}
          icon={<InstagramIcon className="size-4 text-pink-500" />}
        />
        <MetricCard
          title="Posts"
          value={instagramPosts.latest}
          entries={instagramPosts.entries}
          icon={<InstagramIcon className="size-4 text-pink-500" />}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-2 gap-4">
        <MetricsChart
          title="Inscritos (YouTube)"
          data={youtubeChartData}
          icon={<YoutubeIcon className="size-4 text-red-500" />}
        />
        <MetricsChart
          title="Seguidores (Instagram)"
          data={instagramChartData}
          icon={<InstagramIcon className="size-4 text-pink-500" />}
        />
      </div>
    </div>
  );
}
