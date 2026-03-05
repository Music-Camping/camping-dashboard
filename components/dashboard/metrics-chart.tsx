"use client";

import { useEffect, useState } from "react";

import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useTheme } from "next-themes";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ChartDataPoint } from "@/lib/types/dashboard";
import { cn, formatCompactNumber } from "@/lib/utils";

import { ChartTooltip } from "./chart-tooltip";

interface MetricsChartProps {
  data: ChartDataPoint[];
  title: string;
  icon?: React.ReactNode;
  className?: string;
  compact?: boolean;
  fillHeight?: boolean;
}

function getContentClassName(compact?: boolean, fillHeight?: boolean) {
  if (compact) return "p-3 pt-1";
  if (fillHeight) return "flex flex-1 flex-col min-h-0 pb-2";
  return "pb-4";
}

function getChartHeightClassName(compact?: boolean, fillHeight?: boolean) {
  if (compact) return "h-28";
  if (fillHeight) return "flex-1 min-h-[60px]";
  return "h-48";
}

export function MetricsChart({
  data,
  title,
  icon,
  className,
  compact,
  fillHeight,
}: MetricsChartProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Determine if dark mode (default to false during SSR)
  const isDark = mounted && resolvedTheme === "dark";

  // Create a unique gradient ID based on title AND theme to force re-render
  // Remove special characters to avoid SVG ID issues
  const gradientId = `gradient-${title.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase()}-${isDark ? "dark" : "light"}`;

  // Theme-aware colors
  const strokeColor = isDark ? "#ffffff" : "#000000";
  const fillColor = isDark ? "#94a3b8" : "#000000"; // slate-400 for dark, black for light
  const mutedColor = isDark ? "#a1a1aa" : "#71717a"; // zinc-400 / zinc-500

  // Get only the first and last dates for X-axis labels
  const xAxisTicks =
    data.length > 1 ? [data[0].date, data[data.length - 1].date] : [];

  if (data.length === 0) {
    return (
      <Card
        className={cn(
          "w-full",
          fillHeight && "flex h-full flex-col",
          className,
        )}
      >
        <CardHeader className={cn("pb-2", compact && "p-3 pb-1")}>
          <CardTitle className="inline-flex items-center gap-2 text-base">
            {icon}
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className={getContentClassName(compact, fillHeight)}>
          <div
            className={cn(
              "flex items-center justify-center text-muted-foreground",
              getChartHeightClassName(compact, fillHeight),
            )}
          >
            Dados insuficientes para gerar gráfico
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn("w-full", fillHeight && "flex h-full flex-col", className)}
    >
      <CardHeader className={cn("pb-2", compact && "p-3 pb-1")}>
        <CardTitle className="inline-flex items-center gap-2 text-base">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className={getContentClassName(compact, fillHeight)}>
        <div className={getChartHeightClassName(compact, fillHeight)}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor={fillColor}
                    stopOpacity={isDark ? 0.35 : 0.15}
                  />
                  <stop offset="100%" stopColor={fillColor} stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid
                vertical={false}
                strokeDasharray="3 3"
                className="stroke-muted"
              />

              {/* X-axis: only show first and last date */}
              <XAxis
                dataKey="date"
                ticks={xAxisTicks}
                tickFormatter={(value) => {
                  // Full datetime key (today filter) — e.g. "2026-02-23T09:15:00"
                  if (value.includes("T") && value.includes(":")) {
                    return format(parseISO(value), "HH:mm");
                  }
                  // Date-only key (7d/30d filter) — e.g. "2026-02-23"
                  return format(parseISO(value), "dd MMM", { locale: ptBR });
                }}
                tick={{
                  fill: mutedColor,
                  fontSize: 12,
                }}
                axisLine={false}
                tickLine={false}
                tickMargin={8}
              />

              <YAxis
                tickFormatter={formatCompactNumber}
                tick={{
                  fill: mutedColor,
                  fontSize: 12,
                }}
                axisLine={false}
                tickLine={false}
                width={45}
              />

              <Tooltip content={<ChartTooltip />} />

              {/* Line and fill follow theme color */}
              <Area
                type="monotone"
                dataKey="value"
                stroke={strokeColor}
                strokeWidth={2}
                fill={`url(#${gradientId})`}
                fillOpacity={1}
                connectNulls
                dot={{
                  r: 3,
                  fill: strokeColor,
                  strokeWidth: 0,
                }}
                activeDot={{
                  r: 6,
                  fill: strokeColor,
                  stroke: isDark ? "#000000" : "#ffffff",
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
