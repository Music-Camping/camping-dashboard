"use client";

import { Minus, TrendingDown, TrendingUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { MetricEntry } from "@/lib/types/dashboard";
import type { PeriodFilter } from "@/lib/types/filters";
import { calculateGrowth, cn, formatCompactNumber } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: number;
  entries: MetricEntry[];
  period: PeriodFilter;
  icon?: React.ReactNode;
  className?: string;
}

export function MetricCard({
  title,
  value,
  entries,
  period,
  icon,
  className,
}: MetricCardProps) {
  const growth = calculateGrowth(entries, period);
  const isPositive = growth.absolute > 0;
  const isNegative = growth.absolute < 0;

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="inline-flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{formatCompactNumber(value)}</p>
        <div className="mt-2 flex items-center gap-2">
          {isPositive && (
            <Badge
              variant="secondary"
              className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
            >
              <TrendingUp className="mr-1 size-3" />+
              {formatCompactNumber(growth.absolute)} (
              {growth.percent.toFixed(2)}
              %)
            </Badge>
          )}
          {isNegative && (
            <Badge
              variant="secondary"
              className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
            >
              <TrendingDown className="mr-1 size-3" />
              {formatCompactNumber(growth.absolute)} (
              {growth.percent.toFixed(2)}
              %)
            </Badge>
          )}
          {!isPositive && !isNegative && (
            <Badge variant="secondary">
              <Minus className="mr-1 size-3" />
              Sem variação
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
