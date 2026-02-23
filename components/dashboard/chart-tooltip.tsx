"use client";

import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

import { cn, formatCompactNumber } from "@/lib/utils";

interface ChartTooltipPayload {
  value: number;
  payload?: {
    previousValue?: number;
  };
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: ChartTooltipPayload[];
  label?: string;
}

export function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;

  const value = Number(payload[0].value);
  const previousValue = payload[0].payload?.previousValue as number | undefined;
  const change = previousValue
    ? ((value - previousValue) / previousValue) * 100
    : null;

  const labelStr = label as string;
  // Full datetime key (today filter) — e.g. "2026-02-23T09:15:00"
  const isDateTime = labelStr.includes("T") && labelStr.includes(":");
  const formattedDate = isDateTime
    ? format(parseISO(labelStr), "HH:mm")
    : format(parseISO(labelStr), "dd MMM yy", { locale: ptBR });

  return (
    <div className="rounded-lg bg-foreground px-3 py-2 text-background shadow-lg">
      <p className="text-xs opacity-70">{formattedDate}</p>
      <p className="text-lg font-semibold">{formatCompactNumber(value)}</p>
      {change !== null && (
        <p
          className={cn(
            "text-xs",
            change >= 0 ? "text-green-400" : "text-red-400",
          )}
        >
          {change >= 0 ? "+" : ""}
          {change.toFixed(1)}% {change >= 0 ? "↗" : "↘"}
        </p>
      )}
    </div>
  );
}
