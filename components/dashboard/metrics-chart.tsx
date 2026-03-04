"use client";

import { useEffect, useState } from "react";

import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useTheme } from "next-themes";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ChartDataPoint, MultiLinePoint } from "@/lib/types/dashboard";
import { cn, formatCompactNumber } from "@/lib/utils";

import { ChartTooltip } from "./chart-tooltip";

// Chart colors using CSS variables (same in light and dark mode)
const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

// LegendPayload shape — using inline type to avoid recharts internal path issues
// dataKey can be a function in recharts (DataKey<any>), so we widen the type
interface LegendPayloadItem {
  dataKey?: string | number | ((obj: unknown) => unknown);
  value?: string | number;
  color?: string;
}

interface MultiLineChartTooltipProps {
  active?: boolean;
  payload?: Array<{
    dataKey?: string | number;
    name?: string;
    value?: number | string;
    color?: string;
  }>;
  label?: string;
  hoveredPerformer: string | null;
}

function MultiLineChartTooltip({
  active,
  payload,
  label,
  hoveredPerformer,
}: MultiLineChartTooltipProps) {
  if (!active || !payload?.length) return null;

  // Same date formatting as existing ChartTooltip
  const labelStr = label as string;
  const isDateTime = labelStr.includes("T") && labelStr.includes(":");
  const formattedDate = isDateTime
    ? format(parseISO(labelStr), "HH:mm")
    : format(parseISO(labelStr), "dd MMM yy", { locale: ptBR });

  return (
    <div className="rounded-lg bg-foreground px-3 py-2 text-background shadow-lg">
      <p className="mb-1 text-xs opacity-70">{formattedDate}</p>
      {payload.map((entry) => (
        <div
          key={String(entry.dataKey)}
          className={cn(
            "flex items-center gap-1.5 text-sm",
            hoveredPerformer &&
              hoveredPerformer !== String(entry.dataKey) &&
              "opacity-40",
          )}
        >
          <div
            className="size-2 shrink-0 rounded-full"
            style={{ background: entry.color }}
          />
          <span className="font-medium">{entry.name}:</span>
          <span>{formatCompactNumber(Number(entry.value))}</span>
        </div>
      ))}
    </div>
  );
}

interface MetricsChartProps {
  data: ChartDataPoint[];
  title: string;
  icon?: React.ReactNode;
  className?: string;
  compact?: boolean;
  fillHeight?: boolean;
  multiLineData?: MultiLinePoint[];
  performers?: { id: string; name: string }[];
  isPresentationMode?: boolean;
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
  multiLineData,
  performers,
  isPresentationMode,
}: MetricsChartProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [hoveredPerformer, setHoveredPerformer] = useState<string | null>(null);

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

  // Guard: only activate multi-line mode with 2+ performers AND data present
  const isMultiLine = (performers?.length ?? 0) >= 2 && !!multiLineData?.length;

  // Get only the first and last dates for X-axis labels
  let xAxisTicks: string[];
  if (isMultiLine) {
    xAxisTicks =
      multiLineData!.length > 1
        ? [
            multiLineData![0].date,
            multiLineData![multiLineData!.length - 1].date,
          ]
        : [];
  } else {
    xAxisTicks =
      data.length > 1 ? [data[0].date, data[data.length - 1].date] : [];
  }

  // Opacity and width per hover state
  const getOpacity = (performerId: string): number => {
    if (isPresentationMode) return 0.7;
    if (hoveredPerformer === null) return 0.25;
    return hoveredPerformer === performerId ? 1.0 : 0.1;
  };

  const getWidth = (performerId: string): number => {
    if (isPresentationMode) return 2;
    return hoveredPerformer === performerId ? 2.5 : 1.5;
  };

  // Legend hover handlers — use payload.dataKey (NOT payload.value)
  const handleLegendMouseEnter = (payload: LegendPayloadItem) => {
    if (!isPresentationMode) {
      const key = payload.dataKey;
      if (typeof key === "string" || typeof key === "number") {
        setHoveredPerformer(String(key));
      }
    }
  };

  const handleLegendMouseLeave = () => {
    setHoveredPerformer(null);
  };

  // Common X-axis tick formatter (shared by both modes)
  const tickFormatter = (value: string) => {
    if (value.includes("T") && value.includes(":")) {
      return format(parseISO(value), "HH:mm");
    }
    return format(parseISO(value), "dd MMM", { locale: ptBR });
  };

  // Empty state: show when neither mode has data
  const showEmpty = !isMultiLine && data.length === 0;

  if (showEmpty) {
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
            {isMultiLine ? (
              /* ── Multi-line mode: one Line per performer ── */
              <LineChart
                data={multiLineData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  vertical={false}
                  strokeDasharray="3 3"
                  className="stroke-muted"
                />

                <XAxis
                  dataKey="date"
                  ticks={xAxisTicks}
                  tickFormatter={tickFormatter}
                  tick={{ fill: mutedColor, fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  tickMargin={8}
                />

                <YAxis
                  tickFormatter={formatCompactNumber}
                  tick={{ fill: mutedColor, fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  width={45}
                  domain={["auto", "auto"]}
                  allowDataOverflow={false}
                />

                <Tooltip
                  content={
                    <MultiLineChartTooltip
                      hoveredPerformer={hoveredPerformer}
                    />
                  }
                />

                <Legend
                  verticalAlign="bottom"
                  onMouseEnter={
                    !isPresentationMode ? handleLegendMouseEnter : undefined
                  }
                  onMouseLeave={
                    !isPresentationMode ? handleLegendMouseLeave : undefined
                  }
                />

                {performers!.map((performer, index) => (
                  <Line
                    key={performer.id}
                    type="natural"
                    dataKey={performer.id}
                    name={performer.name}
                    stroke={CHART_COLORS[index % CHART_COLORS.length]}
                    strokeWidth={getWidth(performer.id)}
                    strokeOpacity={getOpacity(performer.id)}
                    dot={false}
                    activeDot={{ r: 5, strokeWidth: 0 }}
                    connectNulls
                    isAnimationActive={false}
                  />
                ))}
              </LineChart>
            ) : (
              /* ── Single-performer mode: AreaChart with gradient ── */
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
                  tickFormatter={tickFormatter}
                  tick={{ fill: mutedColor, fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  tickMargin={8}
                />

                <YAxis
                  tickFormatter={formatCompactNumber}
                  tick={{ fill: mutedColor, fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  width={45}
                />

                <Tooltip content={<ChartTooltip />} />

                {/* Line and fill follow theme color */}
                <Area
                  type="natural"
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
            )}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
