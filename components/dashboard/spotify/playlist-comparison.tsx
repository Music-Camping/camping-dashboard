"use client";

import { useTheme } from "next-themes";
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PlaylistData } from "@/lib/types/spotify";
import { cn, formatCompactNumber } from "@/lib/utils";

interface TooltipPayload {
  payload: {
    fullName: string;
    listeners: number;
  };
}

function PlaylistTooltipContent({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
}) {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  return (
    <div className="rounded-lg bg-foreground px-3 py-2 text-background shadow-lg">
      <p className="font-medium">{data.fullName}</p>
      <p className="text-lg font-semibold">
        {formatCompactNumber(data.listeners)} ouvintes
      </p>
    </div>
  );
}

interface PlaylistComparisonProps {
  playlists: PlaylistData[];
  title?: string;
  icon?: React.ReactNode;
  className?: string;
}

const COLORS = [
  "#22c55e", // green-500
  "#3b82f6", // blue-500
  "#f59e0b", // amber-500
  "#ec4899", // pink-500
  "#8b5cf6", // violet-500
];

export function PlaylistComparison({
  playlists,
  title = "Comparação de Playlists",
  icon,
  className,
}: PlaylistComparisonProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const mutedColor = isDark ? "#a1a1aa" : "#71717a";

  const chartData = playlists.map((playlist) => ({
    name:
      playlist.name.length > 15
        ? `${playlist.name.slice(0, 15)}...`
        : playlist.name,
    fullName: playlist.name,
    listeners: playlist.monthlyListeners,
    thumbnail: playlist.thumbnail,
  }));

  if (playlists.length === 0) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader className="pb-2">
          <CardTitle className="inline-flex items-center gap-2 text-base">
            {icon}
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-48 items-center justify-center text-muted-foreground">
            Nenhuma playlist disponível
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="inline-flex items-center gap-2 text-base">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <XAxis
                type="number"
                tickFormatter={formatCompactNumber}
                tick={{ fill: mutedColor, fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill: mutedColor, fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                width={100}
              />
              <Tooltip content={<PlaylistTooltipContent />} />
              <Bar dataKey="listeners" radius={[0, 4, 4, 0]}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
