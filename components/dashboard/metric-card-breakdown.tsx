"use client";

import { Minus, TrendingDown, TrendingUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { MetricEntry } from "@/lib/types/dashboard";
import { calculateGrowth, cn, formatCompactNumber } from "@/lib/utils";

interface PerformerBreakdown {
  performer: string;
  value: number;
  percentage?: number;
}

interface MetricCardWithBreakdownProps {
  title: string;
  totalValue: number;
  entries: MetricEntry[];
  breakdown: PerformerBreakdown[];
  icon?: React.ReactNode;
  className?: string;
}

export function MetricCardWithBreakdown({
  title,
  totalValue,
  entries,
  breakdown,
  icon,
  className,
}: MetricCardWithBreakdownProps) {
  const growth = calculateGrowth(entries);
  const isPositive = growth.absolute > 0;
  const isNegative = growth.absolute < 0;

  // Sort breakdown by value (descending)
  const sortedBreakdown = [...breakdown].sort((a, b) => b.value - a.value);

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="inline-flex items-center gap-2 text-sm">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Total Value */}
        <div>
          <p className="text-3xl font-bold">
            {formatCompactNumber(totalValue)}
          </p>
          <div className="mt-2 flex items-center gap-2">
            {isPositive && (
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
              >
                <TrendingUp className="mr-1 size-3" />+
                {formatCompactNumber(growth.absolute)} (
                {growth.percent.toFixed(1)}%)
              </Badge>
            )}
            {isNegative && (
              <Badge
                variant="secondary"
                className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
              >
                <TrendingDown className="mr-1 size-3" />
                {formatCompactNumber(growth.absolute)} (
                {growth.percent.toFixed(1)}%)
              </Badge>
            )}
            {!isPositive && !isNegative && (
              <Badge variant="secondary" className="text-xs">
                <Minus className="mr-1 size-3" />
                Estável
              </Badge>
            )}
          </div>
        </div>

        {/* Breakdown by Performer */}
        {sortedBreakdown.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              {sortedBreakdown.map((item) => {
                const percentage =
                  totalValue > 0
                    ? ((item.value / totalValue) * 100).toFixed(1)
                    : "0";

                return (
                  <div
                    key={item.performer}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="truncate text-muted-foreground">
                      {item.performer}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {percentage}%
                      </span>
                      <span className="font-medium">
                        {formatCompactNumber(item.value)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
