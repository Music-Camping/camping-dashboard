# Recharts & date-fns Quick Reference

## Recharts for AreaChart (Recommended for Dashboard)

### Essential Imports for AreaChart

```typescript
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts";
```

### AreaChart with Gradient Fill (Reference Style)

```tsx
<ResponsiveContainer width="100%" height={300}>
  <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
    {/* Gradient Definition - MUST be inside chart */}
    <defs>
      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8} />
        <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0.1} />
      </linearGradient>
    </defs>

    {/* Grid - hide vertical lines for cleaner look */}
    <CartesianGrid
      vertical={false}
      strokeDasharray="3 3"
      className="stroke-muted"
    />

    {/* Axes - hide lines and ticks for minimal style */}
    <XAxis
      dataKey="date"
      tickFormatter={(value) =>
        format(parseISO(value), "dd MMM", { locale: ptBR })
      }
      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
      axisLine={false}
      tickLine={false}
    />
    <YAxis
      tickFormatter={formatCompactNumber}
      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
      axisLine={false}
      tickLine={false}
      width={45}
    />

    <Tooltip content={<CustomTooltip />} />

    {/* Optional horizontal reference line */}
    <ReferenceLine
      y={targetValue}
      stroke="hsl(var(--muted-foreground))"
      strokeDasharray="5 5"
    />

    {/* Area with gradient, smooth curves, null handling */}
    <Area
      type="monotone"
      dataKey="value"
      stroke="hsl(var(--chart-1))"
      strokeWidth={2}
      fillOpacity={1}
      fill="url(#colorValue)"
      connectNulls={true}
      dot={false}
      activeDot={{
        r: 6,
        fill: "hsl(var(--chart-1))",
        stroke: "hsl(var(--background))",
        strokeWidth: 2,
      }}
    />
  </AreaChart>
</ResponsiveContainer>
```

### Custom Tooltip Component (Dark Style - Reference Design)

```tsx
import { TooltipProps } from "recharts";
import {
  NameType,
  ValueType,
} from "recharts/types/component/DefaultTooltipContent";

interface ChartTooltipProps extends TooltipProps<ValueType, NameType> {}

export function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;

  const value = Number(payload[0].value);
  const previousValue = payload[0].payload?.previousValue;
  const change = previousValue
    ? ((value - previousValue) / previousValue) * 100
    : null;

  return (
    <div className="rounded-lg bg-foreground px-3 py-2 text-background shadow-lg">
      <p className="text-xs opacity-70">
        {format(parseISO(label), "dd MMM yy", { locale: ptBR })}
      </p>
      <p className="text-lg font-semibold">{formatCompactNumber(value)}</p>
      {change !== null && (
        <p
          className={cn(
            "text-xs",
            change >= 0 ? "text-green-400" : "text-red-400",
          )}
        >
          {change >= 0 ? "+" : ""}
          {change.toFixed(1)}% ↗
        </p>
      )}
    </div>
  );
}
```

### Key AreaChart Properties

| Property       | Value                | Purpose                            |
| -------------- | -------------------- | ---------------------------------- |
| `type`         | `"monotone"`         | Smooth curves that don't overshoot |
| `connectNulls` | `true`               | Connect line across missing data   |
| `fillOpacity`  | `1`                  | Full gradient visibility           |
| `fill`         | `"url(#gradientId)"` | Reference gradient definition      |
| `dot`          | `false`              | Hide dots on line                  |
| `activeDot`    | `{ r: 6, ... }`      | Show dot on hover                  |

---

## Recharts for LineChart

### Essential Imports

```typescript
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
```

### Basic LineChart Structure

```tsx
<ResponsiveContainer width="100%" height={400}>
  <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="date" tickFormatter={formatDate} />
    <YAxis tickFormatter={formatValue} />
    <Tooltip />
    <Legend />
    <Line
      type="monotone"
      dataKey="value"
      stroke="#8884d8"
      strokeWidth={2}
      dot={{ r: 3 }}
      activeDot={{ r: 6 }}
    />
  </LineChart>
</ResponsiveContainer>
```

### Data Format

```typescript
const data = [
  { date: "2024-01-01", performer1: 4000, performer2: 2400 },
  { date: "2024-01-02", performer1: 3000, performer2: 1398 },
  { date: "2024-01-03", performer1: 2000, performer2: 9800 },
];
```

### Multiple Lines (Dynamic Performers)

```tsx
const performers = [
  { id: "performer1", name: "MC Cabelinho", color: "#8884d8" },
  { id: "performer2", name: "Poze do Rodo", color: "#82ca9d" },
];

{
  performers.map((performer, index) => (
    <Line
      key={performer.id}
      type="monotone"
      dataKey={performer.id}
      name={performer.name}
      stroke={performer.color}
      strokeWidth={2}
    />
  ));
}
```

### Axis Formatters

```typescript
// For dates
tickFormatter={(value) => format(parseISO(value), "dd/MM")}

// For numbers (compact)
tickFormatter={(value) => {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toString();
}}
```

### Custom Tooltip

```tsx
<Tooltip
  labelFormatter={(value) =>
    format(parseISO(value), "dd/MM/yyyy", { locale: ptBR })
  }
  formatter={(value: number, name: string) => [
    formatCompactNumber(value),
    name,
  ]}
  contentStyle={{
    backgroundColor: "var(--background)",
    border: "1px solid var(--border)",
  }}
/>
```

### CRITICAL Notes

1. **Height is required** - Use numeric value or Tailwind class (h-80), NOT "100%"
2. **"use client"** - Recharts components require client-side rendering in Next.js
3. **connectNulls** - Add `connectNulls` prop to Line if data may have gaps

---

## date-fns for Date Formatting

### Installation

```bash
pnpm add date-fns
```

### Essential Imports

```typescript
import { format, parseISO, compareAsc } from "date-fns";
import { ptBR } from "date-fns/locale";
```

### Parse ISO 8601 Strings

```typescript
const date = parseISO("2026-01-29T21:27:14.051376+00:00");
// Returns: Date object
```

### Format Dates

```typescript
// Brazilian format
format(date, "dd/MM/yyyy"); // "29/01/2026"

// For chart axis
format(date, "dd/MM"); // "29/01"

// Full date with locale
format(date, "dd MMMM yyyy", { locale: ptBR }); // "29 janeiro 2026"

// With time
format(date, "dd/MM HH:mm", { locale: ptBR }); // "29/01 21:27"
```

### Common Format Tokens

| Token | Output           | Example           |
| ----- | ---------------- | ----------------- |
| dd    | Day (2 digits)   | 01, 29            |
| MM    | Month (2 digits) | 01, 12            |
| MMM   | Month short      | jan, dez          |
| MMMM  | Month full       | janeiro, dezembro |
| yyyy  | Year             | 2026              |
| HH    | Hour (24h)       | 00, 23            |
| mm    | Minutes          | 00, 59            |

### Sort Dates

```typescript
import { compareAsc, parseISO } from "date-fns";

const entries = [
  { datetime: "2026-01-29T10:00:00Z", value: 100 },
  { datetime: "2026-01-22T10:00:00Z", value: 90 },
];

const sorted = [...entries].sort((a, b) =>
  compareAsc(parseISO(a.datetime), parseISO(b.datetime)),
);
// Result: oldest first
```

---

## Combined Example: Transform API Data to Chart Format

```typescript
import { parseISO, format, compareAsc } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { DashboardResponse, MetricEntry } from "@/lib/types/dashboard";

interface ChartDataPoint {
  date: string;
  [performerId: string]: string | number;
}

function transformToChartData(
  dashboardData: DashboardResponse,
  platform: "youtube" | "instagram",
  metric: "followers" | "views",
): ChartDataPoint[] {
  const allDates = new Set<string>();
  const performerData: Record<string, Record<string, number>> = {};

  // Collect all dates and values
  Object.entries(dashboardData)
    .filter(([key]) => key !== "total")
    .forEach(([performer, data]) => {
      const platformData = data[platform];
      if (!platformData?.[metric]) return;

      performerData[performer] = {};
      platformData[metric].entries.forEach((entry) => {
        const dateKey = entry.datetime.split("T")[0]; // Use date part only
        allDates.add(dateKey);
        performerData[performer][dateKey] = entry.value;
      });
    });

  // Build chart data array
  const chartData: ChartDataPoint[] = Array.from(allDates)
    .sort((a, b) => compareAsc(parseISO(a), parseISO(b)))
    .map((date) => {
      const point: ChartDataPoint = { date };
      Object.keys(performerData).forEach((performer) => {
        point[performer] = performerData[performer][date] || 0;
      });
      return point;
    });

  return chartData;
}
```

---

## Tailwind Dark Mode Compatibility

For charts to work well in dark mode, use CSS variables:

```tsx
<CartesianGrid strokeDasharray="3 3" className="stroke-muted" />

<Tooltip
  contentStyle={{
    backgroundColor: 'hsl(var(--background))',
    border: '1px solid hsl(var(--border))',
    borderRadius: '6px',
  }}
  labelStyle={{ color: 'hsl(var(--foreground))' }}
/>
```

---

## Sources

- Recharts Official: https://recharts.org/en-US/api/LineChart
- Recharts Examples: https://recharts.org/en-US/examples
- date-fns Official: https://date-fns.org/docs/format
- date-fns parseISO: https://date-fns.org/docs/parseISO
