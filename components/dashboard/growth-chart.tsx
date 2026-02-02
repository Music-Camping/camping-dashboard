"use client";

import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { cn, formatCompactNumber } from "@/lib/utils";

interface ChartDataPoint {
  date: string;
  [key: string]: string | number;
}

interface PerformerLine {
  id: string;
  name: string;
  color: string;
}

interface GrowthChartProps {
  data: ChartDataPoint[];
  performers: PerformerLine[];
  className?: string;
}

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#413ea0"];

export function GrowthChart({ data, performers, className }: GrowthChartProps) {
  if (data.length < 2) {
    return (
      <div
        className={cn(
          "flex h-80 w-full items-center justify-center text-muted-foreground",
          className,
        )}
      >
        Dados insuficientes para gerar gráfico
      </div>
    );
  }

  return (
    <div className={cn("h-80 w-full", className)}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="date"
            tickFormatter={(value) =>
              format(parseISO(value), "dd/MM", { locale: ptBR })
            }
            tick={{ fontSize: 12 }}
          />
          <YAxis
            tickFormatter={formatCompactNumber}
            tick={{ fontSize: 12 }}
            width={60}
          />
          <Tooltip
            labelFormatter={(value) =>
              format(parseISO(value as string), "dd/MM/yyyy", { locale: ptBR })
            }
            formatter={(value, name) => [
              formatCompactNumber(Number(value) || 0),
              name,
            ]}
            contentStyle={{
              backgroundColor: "hsl(var(--background))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "6px",
            }}
            labelStyle={{ color: "hsl(var(--foreground))" }}
          />
          <Legend />
          {performers.map((performer, index) => (
            <Line
              key={performer.id}
              type="monotone"
              dataKey={performer.id}
              name={performer.name}
              stroke={performer.color || COLORS[index % COLORS.length]}
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 6 }}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
