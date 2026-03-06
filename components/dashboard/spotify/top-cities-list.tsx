"use client";

import { formatCompactNumber } from "@/lib/utils";

interface CityEntry {
  value: number;
  extra_data?: {
    city: string;
    country: string;
  };
}

interface TopCitiesListProps {
  data?: object | null;
}

export function TopCitiesList({ data }: TopCitiesListProps) {
  const cities = (
    (data as Record<string, Record<string, unknown>>)?.spotify as Record<
      string,
      unknown
    >
  )?.top_city_listeners as { entries: CityEntry[] } | undefined;
  const cityEntries = cities?.entries ?? [];

  if (!cityEntries || cityEntries.length === 0) {
    return null;
  }

  // Top 5 cities
  const topCities = cityEntries.slice(0, 5);

  return (
    <div className="space-y-2 pt-2">
      <p className="text-sm font-semibold text-foreground">Top Cidades</p>
      <div className="space-y-1.5">
        {topCities.map((entry, idx) => (
          <div
            key={`${entry.extra_data?.city}-${entry.extra_data?.country}`}
            className="flex items-center justify-between rounded-lg bg-gradient-to-r from-muted/40 to-muted/20 px-3 py-2.5 transition-colors hover:from-muted/60 hover:to-muted/30"
          >
            <div className="flex flex-1 items-center gap-3">
              <span className="w-5 text-center text-xs font-bold text-muted-foreground">
                {idx + 1}
              </span>
              <span className="truncate text-sm font-medium text-foreground">
                {entry.extra_data?.city}
              </span>
            </div>
            <span className="ml-2 text-sm font-bold text-green-600 dark:text-green-400">
              {formatCompactNumber(entry.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
