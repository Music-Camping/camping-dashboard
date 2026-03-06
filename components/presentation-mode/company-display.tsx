"use client";

import { useEffect, useState, useMemo } from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  YoutubeIcon,
  InstagramIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DashboardResponse, ChartDataPoint } from "@/lib/types/dashboard";
import { PerformerCard } from "./performer-card";
import { SocialMetricsCard } from "./social-metrics-card";

interface CompanyDisplayProps {
  performers: string[];
  rotationInterval: number;
  initialData?: DashboardResponse | null;
}

export function CompanyDisplay({
  performers,
  rotationInterval,
  initialData,
}: CompanyDisplayProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const performersPerPage = 3;

  // Split performers into pages of 3
  const pages = useMemo(() => {
    const result: string[][] = [];
    for (let i = 0; i < performers.length; i += performersPerPage) {
      result.push(performers.slice(i, i + performersPerPage));
    }
    return result;
  }, [performers]);

  const totalPages = pages.length;

  // Mock chart data for YouTube and Instagram
  const mockChartData: ChartDataPoint[] = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 30 }, (_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() - (29 - i));
      return {
        date: date.toISOString().split("T")[0],
        value: Math.floor(Math.random() * 5000000) + 10000000,
      };
    });
  }, []);

  // Auto-rotate pages based on rotation interval
  useEffect(() => {
    if (totalPages <= 1) {
      return undefined;
    }

    const timePerPage = (rotationInterval * 1000) / totalPages;
    const interval = setInterval(() => {
      setCurrentPage((prev) => (prev + 1) % totalPages);
    }, timePerPage);

    return () => {
      clearInterval(interval);
    };
  }, [rotationInterval, totalPages]);

  const currentPerformers = pages[currentPage] ?? [];

  const goToPrevious = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  const goToNext = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };

  return (
    <div className="relative flex h-full flex-col gap-4 overflow-y-auto">
      {/* Artistas Title */}
      <div className="px-2">
        <h2 className="text-xl font-semibold">Artistas</h2>
      </div>

      {/* Performers Grid/Carousel */}
      <div>
        {performers.length === 0 ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            Nenhum performer disponível
          </div>
        ) : (
          <div className="relative">
            {/* Cards Grid */}
            <div className="grid grid-cols-3 gap-4 px-4">
              {currentPerformers.map((performer) => {
                const performerData = initialData?.[performer];
                return (
                  <PerformerCard
                    key={performer}
                    name={performer}
                    spotifyFollowers={performerData?.spotify?.followers.latest}
                    spotifyListeners={
                      performerData?.spotify?.monthly_listeners?.latest
                    }
                    instagramFollowers={
                      performerData?.instagram?.followers.latest
                    }
                  />
                );
              })}
            </div>

            {/* Carousel Controls (only show if more than one page) */}
            {totalPages > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={goToPrevious}
                  className="absolute top-12 left-2 bg-black/50 hover:bg-black/70"
                >
                  <ChevronLeftIcon className="size-6 text-white" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={goToNext}
                  className="absolute top-12 right-2 bg-black/50 hover:bg-black/70"
                >
                  <ChevronRightIcon className="size-6 text-white" />
                </Button>

                {/* Page indicator */}
                <div className="absolute -bottom-12 left-1/2 flex -translate-x-1/2 gap-2">
                  {pages.map((_, idx) => {
                    const pageId = `page-indicator-${idx}`;
                    return (
                      <button
                        key={pageId}
                        type="button"
                        onClick={() => setCurrentPage(idx)}
                        aria-label={`Ir para página ${idx + 1}`}
                        className={`h-2 rounded-full transition-all ${
                          idx === currentPage
                            ? "w-6 bg-primary"
                            : "w-2 bg-muted-foreground/50 hover:bg-muted-foreground"
                        }`}
                        title={`Página ${idx + 1}`}
                      />
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Social Media Metrics Section */}
      <div className="mt-4 grid grid-cols-2 gap-4 border-t pt-4">
        {/* YouTube */}
        <SocialMetricsCard
          platform="youtube"
          icon={<YoutubeIcon className="size-5 text-red-500" />}
          followers={3200000}
          secondaryMetric={{ label: "Views Totais", value: 450000000 }}
          chartData={mockChartData}
        />

        {/* Instagram */}
        <SocialMetricsCard
          platform="instagram"
          icon={<InstagramIcon className="size-5 text-pink-500" />}
          followers={2800000}
          secondaryMetric={{ label: "Posts", value: 1250 }}
          chartData={mockChartData}
        />
      </div>
    </div>
  );
}
