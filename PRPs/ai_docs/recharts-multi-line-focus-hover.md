# Recharts Multi-Line Chart: Focus-on-Hover Reference

Verified against recharts `^3.7.0` source code (github.com/recharts/recharts).

---

## Required Imports

```typescript
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { LegendPayload } from "recharts";
```

---

## Data Shape for Multi-Line

Each point must have `date` (string) plus one key per performer:

```typescript
// Shape of each data point for LineChart
interface MultiLinePoint {
  date: string;
  [performerId: string]: number | undefined | string; // string only for "date"
}

// Example:
const data: MultiLinePoint[] = [
  { date: "2026-01-01", mc_poze: 1200000, mc_cabelinho: 850000 },
  { date: "2026-01-02", mc_poze: 1205000, mc_cabelinho: 853000 },
];

// Legend + Line uses { id, name }:
const performers = [
  { id: "mc_poze", name: "MC Poze" },
  { id: "mc_cabelinho", name: "MC Cabelinho" },
];
```

---

## Focus-on-Hover Pattern (Official Recharts LegendEffectOpacity)

Source: https://recharts.github.io/en-US/examples/LegendEffectOpacity/

```typescript
const [hoveredPerformer, setHoveredPerformer] = useState<string | null>(null);

// Legend handlers — signature: (payload: LegendPayload, index: number, event: MouseEvent)
// Use payload.dataKey (NOT payload.value) for identification — value is the display name
const handleLegendMouseEnter = (payload: LegendPayload) => {
  setHoveredPerformer(payload.dataKey as string);
};

const handleLegendMouseLeave = () => {
  setHoveredPerformer(null);
};

// Opacity per state (per feature spec)
const getOpacity = (performerId: string): number => {
  if (hoveredPerformer === null) return 0.25; // all dimmed by default
  return hoveredPerformer === performerId ? 1.0 : 0.1; // focused vs dimmed
};

const getWidth = (performerId: string): number =>
  hoveredPerformer === performerId ? 2.5 : 1.5;
```

---

## Complete JSX Structure

```tsx
const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

<ResponsiveContainer width="100%" height="100%">
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
      tickFormatter={tickFormatter} // same logic as AreaChart (HH:mm / dd MMM)
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
      domain={["auto", "auto"]} // IMPORTANT: prevents negative clipping with type="natural"
      allowDataOverflow={false}
    />

    <Tooltip
      content={<MultiLineTooltip hoveredPerformer={hoveredPerformer} />}
    />

    <Legend
      verticalAlign="bottom"
      onMouseEnter={handleLegendMouseEnter}
      onMouseLeave={handleLegendMouseLeave}
    />

    {performers.map((performer, index) => (
      <Line
        key={performer.id}
        type="natural" // smooth, organic curves per spec
        dataKey={performer.id} // matches data object key
        name={performer.name} // shown in legend and tooltip
        stroke={CHART_COLORS[index % CHART_COLORS.length]}
        strokeWidth={getWidth(performer.id)}
        strokeOpacity={getOpacity(performer.id)}
        dot={false}
        activeDot={{ r: 5, strokeWidth: 0 }}
        connectNulls
        isAnimationActive={false} // prevents conflicts with opacity transitions
      />
    ))}
  </LineChart>
</ResponsiveContainer>;
```

---

## Custom Multi-Line Tooltip

```tsx
import type { TooltipProps } from "recharts";
import type {
  NameType,
  ValueType,
} from "recharts/types/component/DefaultTooltipContent";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatCompactNumber } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface MultiLineTooltipProps extends TooltipProps<ValueType, NameType> {
  hoveredPerformer: string | null;
}

function MultiLineTooltip({
  active,
  payload,
  label,
  hoveredPerformer,
}: MultiLineTooltipProps) {
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
            "flex items-center gap-2 text-sm",
            hoveredPerformer &&
              hoveredPerformer !== entry.dataKey &&
              "opacity-40",
          )}
        >
          <div
            className="size-2 rounded-full"
            style={{ background: entry.color }}
          />
          <span className="font-medium">{entry.name}:</span>
          <span>{formatCompactNumber(Number(entry.value))}</span>
        </div>
      ))}
    </div>
  );
}
```

---

## Presentation Mode (TV / Static)

```tsx
// isPresentationMode=true: static opacity, no hover interaction
const getOpacity = (performerId: string): number => {
  if (isPresentationMode) return 0.7; // all lines visible, no focus
  if (hoveredPerformer === null) return 0.25;
  return hoveredPerformer === performerId ? 1.0 : 0.1;
};

const getWidth = (performerId: string): number => {
  if (isPresentationMode) return 2;
  return hoveredPerformer === performerId ? 2.5 : 1.5;
};

// Legend: disable hover handlers in presentation mode
<Legend
  verticalAlign="bottom"
  onMouseEnter={!isPresentationMode ? handleLegendMouseEnter : undefined}
  onMouseLeave={!isPresentationMode ? handleLegendMouseLeave : undefined}
/>;
```

---

## Critical Gotchas

### 1. `payload.dataKey` vs `payload.value` in Legend handlers

```typescript
// CORRECT — dataKey is the series identifier (matches <Line dataKey="...">)
const handleLegendMouseEnter = (payload: LegendPayload) => {
  setHoveredPerformer(payload.dataKey as string); // ← use dataKey
};

// WRONG — value is the display name from <Line name="...">
const handleLegendMouseEnter = (payload: LegendPayload) => {
  setHoveredPerformer(payload.value); // ← name, not id
};
```

### 2. Custom `content` prop on Legend disables `onMouseEnter`/`onMouseLeave`

When `content` is passed to `<Legend>`, the default renderer is bypassed and
`onMouseEnter`/`onMouseLeave` on `<Legend>` no longer fire. Either:

- Use default legend (no `content` prop) with `onMouseEnter`/`onMouseLeave` — simpler
- Use `content` and handle events inside the custom renderer directly

### 3. `strokeOpacity` IS whitelisted in Recharts `filterProps`

Confirmed in `src/util/types.ts` `SVGElementPropKeys`. Passes to the SVG `<path>` correctly.
Both `strokeOpacity` and `strokeWidth` work as direct Line props.

### 4. Dots inherit parent `strokeOpacity`

From `renderDots` source — dots inherit Line's `stroke` and `strokeOpacity`.
If you need full-opacity dots on a dimmed line:

```tsx
<Line strokeOpacity={0.1} dot={{ strokeOpacity: 1 }} />
```

For this feature: `dot={false}` avoids the issue entirely.

### 5. `type="natural"` can overshoot

Natural cubic splines can interpolate values outside the actual data range.
Use `domain={["auto", "auto"]}` and `allowDataOverflow={false}` on `YAxis` to clip.

### 6. Dynamic keys — always use string key as React `key` prop

```tsx
// CORRECT
{
  performers.map((p) => <Line key={p.id} dataKey={p.id} />);
}

// WRONG — causes remount/re-animation on reorder
{
  performers.map((p, i) => <Line key={i} dataKey={p.id} />);
}
```

### 7. `name` prop required when `dataKey` is a function

When `dataKey` is a function, the `name` prop is required for the legend to show a label.
For string keys (our case), `name` is optional but recommended for display.

### 8. `isAnimationActive={false}` recommended for opacity transitions

Line animation uses `strokeDasharray`/`strokeDashoffset`, which can conflict with
CSS `transition` or React state-driven `strokeOpacity` changes. Disable animation on
multi-line charts to ensure smooth opacity transitions.

---

## Sources

- Official Recharts focus-on-hover example: https://recharts.github.io/en-US/examples/LegendEffectOpacity/
- Recharts LineChart API: https://recharts.org/en-US/api/LineChart
- Recharts Line API: https://recharts.org/en-US/api/Line
- Recharts Legend API: https://recharts.org/en-US/api/Legend
- Recharts source (v3.7.0): https://github.com/recharts/recharts/blob/master/src/cartesian/Line.tsx
- Legend default content source: https://github.com/recharts/recharts/blob/master/src/component/DefaultLegendContent.tsx
