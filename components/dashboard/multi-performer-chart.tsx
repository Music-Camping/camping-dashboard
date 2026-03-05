"use client";

import { useMemo } from "react";

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

import { Check, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { MultiPerformerChartDataPoint } from "@/lib/types/dashboard";
import { cn, formatCompactNumber } from "@/lib/utils";

interface MultiPerformerChartProps {
  data: MultiPerformerChartDataPoint[];
  selectedPerformers: string[];
  allPerformers?: string[];
  title: string;
  icon?: React.ReactNode;
  className?: string;
  period?: "today" | "7d" | "30d";
  onTogglePerformer?: (performer: string) => void;
  onSelectAll?: () => void;
  onClearAll?: () => void;
}

const PERFORMER_COLORS = [
  "#3b82f6",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#f59e0b",
  "#10b981",
];

// Map performer names to colors for persistence
const performerColorMap = new Map<string, string>();
let colorIndex = 0;

function getPerformerColor(performerName: string): string {
  if (!performerColorMap.has(performerName)) {
    performerColorMap.set(
      performerName,
      PERFORMER_COLORS[colorIndex % PERFORMER_COLORS.length],
    );
    colorIndex += 1;
  }
  return performerColorMap.get(performerName)!;
}

function getGradientId(performerName: string, isDark: boolean): string {
  const sanitized = performerName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-");
  return `gradient-${sanitized}-${isDark ? "dark" : "light"}`;
}

function MultiPerformerTooltip({
  active,
  payload,
  label,
  period,
}: {
  active?: boolean;
  payload?: Array<any>;
  label?: string;
  period?: "today" | "7d" | "30d";
}) {
  if (!active || !payload?.length) return null;

  const datetimeStr =
    payload[0]?.payload?.datetime || payload[0]?.payload?.date || label;
  if (!datetimeStr) return null;

  let formattedDate = "";
  try {
    const isDateTime = datetimeStr.includes("T") && datetimeStr.includes(":");
    const formatStr =
      isDateTime && period === "today" ? "dd/MM HH:mm" : "dd/MM";
    formattedDate = format(parseISO(datetimeStr), formatStr, { locale: ptBR });
  } catch {
    // If date parsing fails, use raw string as fallback
    formattedDate = datetimeStr;
  }

  // Filter out entries with no value
  const validEntries = payload.filter(
    (entry) => entry.value !== null && entry.value !== undefined,
  );

  if (validEntries.length === 0) return null;

  // Sort entries by value in descending order
  const sortedEntries = [...validEntries].sort((a, b) => b.value - a.value);

  return (
    <div className="rounded-lg bg-foreground px-3 py-2 shadow-lg">
      <p className="mb-2 text-xs text-background opacity-70">{formattedDate}</p>
      <div className="space-y-1">
        {sortedEntries.map((entry) => {
          // Extract performer name from "performers.performerName"
          const performerName = entry.name.includes(".")
            ? entry.name.split(".")[1]
            : entry.name;
          return (
            <div key={entry.name} className="flex items-center gap-2">
              <div
                className="size-2 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-xs text-background">{performerName}</span>
              <span className="ml-auto text-xs font-semibold text-background">
                {formatCompactNumber(entry.value)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function MultiPerformerChart({
  data,
  selectedPerformers,
  allPerformers,
  title,
  icon,
  className,
  period,
  onTogglePerformer,
  onSelectAll,
  onClearAll,
}: MultiPerformerChartProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const mutedColor = isDark ? "#a1a1aa" : "#71717a";

  const xAxisTicks = useMemo(() => {
    if (data.length === 0) return [];
    const useDateTime = period === "today";

    if (data.length <= 8) {
      return data.map((d) => (useDateTime ? d.datetime : d.date) || d.date);
    }
    return [
      (useDateTime ? data[0].datetime : data[0].date) || data[0].date,
      (useDateTime
        ? data[data.length - 1].datetime
        : data[data.length - 1].date) || data[data.length - 1].date,
    ];
  }, [data, period]);

  const hasData = data.length > 0 && selectedPerformers.length > 0;

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="inline-flex items-center gap-2 text-base">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-4 transition-all duration-300">
        {/* Chart or Empty State */}
        <div
          className={cn("transition-opacity duration-300", {
            "opacity-50": !hasData,
          })}
        >
          {hasData ? (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={data}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <defs>
                    {selectedPerformers.map((performer) => {
                      const gradientId = getGradientId(performer, isDark);
                      const color = getPerformerColor(performer);
                      return (
                        <linearGradient
                          key={gradientId}
                          id={gradientId}
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor={color}
                            stopOpacity={isDark ? 0.25 : 0.15}
                          />
                          <stop
                            offset="100%"
                            stopColor={color}
                            stopOpacity={0}
                          />
                        </linearGradient>
                      );
                    })}
                  </defs>

                  <CartesianGrid
                    vertical={false}
                    strokeDasharray="3 3"
                    className="stroke-muted"
                  />

                  <XAxis
                    dataKey={
                      period === "today" && data[0]?.datetime
                        ? "datetime"
                        : "date"
                    }
                    ticks={xAxisTicks}
                    tickFormatter={(value) => {
                      const isDateTime =
                        period === "today" &&
                        value &&
                        value.includes("T") &&
                        value.includes(":");
                      if (isDateTime) {
                        return format(parseISO(value), "dd/MM HH:mm");
                      }
                      return format(parseISO(value), "dd MMM", {
                        locale: ptBR,
                      });
                    }}
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
                    width={70}
                  />

                  <Tooltip
                    content={<MultiPerformerTooltip period={period} />}
                    cursor={false}
                  />

                  {selectedPerformers.map((performer) => {
                    const gradientId = getGradientId(performer, isDark);
                    const color = getPerformerColor(performer);
                    return (
                      <Area
                        key={performer}
                        type="monotone"
                        dataKey={`performers.${performer}`}
                        stroke={color}
                        strokeWidth={2}
                        fill={`url(#${gradientId})`}
                        fillOpacity={1}
                        connectNulls
                        dot={{ fill: color, r: 3 }}
                        activeDot={{ r: 5 }}
                      />
                    );
                  })}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
              Selecione performers para visualizar dados
            </div>
          )}
        </div>

        {/* Legend */}
        {hasData && (
          <div className="mt-4 flex flex-wrap gap-3">
            {selectedPerformers.map((performer) => (
              <div key={performer} className="flex items-center gap-2">
                <div
                  className="size-3 rounded-full"
                  style={{ backgroundColor: getPerformerColor(performer) }}
                />
                <span className="text-xs text-muted-foreground">
                  {performer}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        {allPerformers &&
          allPerformers.length > 0 &&
          onTogglePerformer &&
          onSelectAll &&
          onClearAll && (
            <div className="mt-4 space-y-3 border-t pt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  Performers
                </span>
                <div className="flex gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={onSelectAll}
                    className="h-8 px-2.5 text-xs"
                    title="Selecionar todos"
                  >
                    <Check className="size-3.5" />
                    <span className="ml-1">Todos</span>
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={onClearAll}
                    className="h-8 px-2.5 text-xs"
                    title="Limpar seleção"
                  >
                    <X className="size-3.5" />
                    <span className="ml-1">Limpar</span>
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                {allPerformers.map((performer) => (
                  <div key={performer} className="flex items-center gap-2">
                    <Checkbox
                      id={`${performer}-filter`}
                      checked={selectedPerformers.includes(performer)}
                      onCheckedChange={() => onTogglePerformer(performer)}
                    />
                    <Label
                      htmlFor={`${performer}-filter`}
                      className="cursor-pointer text-sm font-normal"
                    >
                      {performer}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}
      </CardContent>
    </Card>
  );
}
