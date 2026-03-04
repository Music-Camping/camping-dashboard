# PRP: Multi-line Charts com Focus-on-Hover

---

## Goal

**Feature Goal**: Evoluir o sistema de gráficos do dashboard para exibir uma linha por performer quando 2+ performers estiverem ativos, com focus-on-hover que reduz ruído visual — linhas ficam apagadas por padrão e destacam individualmente ao hover. Modo single-performer mantém AreaChart original.

**Deliverable**:

- `useMultiLineChartData` hook exportado de `hooks/use-chart-data.ts`
- Interface `MultiLinePoint` em `lib/types/dashboard.ts`
- `MetricsChart` atualizado com suporte a multi-linha + focus-on-hover + `type="natural"`
- `dashboard-client.tsx` consumindo o novo hook e passando os dados para as seções
- `YouTubeSection`, `InstagramSection`, `SpotifyHub` atualizados para propagar as novas props

**Success Definition**:

- Com 2+ performers: `LineChart` com uma linha por performer, todas a `strokeOpacity: 0.25` por padrão
- Hover em linha ou legenda: linha em foco a `strokeOpacity: 1.0`, demais a `0.1`
- Com 1 performer: `AreaChart` original mantido (sem regressão)
- Curva `type="natural"` em ambos os modos
- Modo TV (`isPresentationMode`): `strokeOpacity: 0.7` estático, sem comportamento de hover
- Dark/light mode funcionando via `isDark` e CSS variables existentes

---

## User Persona

**Target User**: Gerente/produtor musical monitorando crescimento de múltiplos artistas no dashboard

**Use Case**: Visualizar e comparar a evolução de seguidores de 2+ performers em um único gráfico, identificando quem cresce mais rápido e em qual período.

**User Journey**:

1. Usuário acessa o dashboard com 2+ performers selecionados no filtro
2. Gráficos exibem todas as linhas levemente apagadas (`strokeOpacity: 0.25`)
3. Usuário passa mouse sobre uma linha → linha destaca (`strokeOpacity: 1.0`)
4. Demais linhas ficam ainda mais apagadas (`strokeOpacity: 0.1`)
5. Usuário passa mouse sobre nome na legenda → mesmo efeito
6. Remove hover → todas voltam ao estado padrão (`0.25`)
7. Com 1 performer → AreaChart original com gradiente (comportamento atual)

**Pain Points Addressed**:

- Atualmente gráficos mostram apenas valor agregado (soma) — impossível ver quem contribui mais
- Com muitas linhas à opacidade máxima, o gráfico fica confuso e ilegível

---

## Why

- **Valor de negócio**: Permite comparar performers individualmente sem navegar entre filtros
- **UX**: Focus-on-hover resolve o problema de "spaghetti chart" com múltiplas linhas
- **Backward compatibility**: AreaChart mantido para single-performer garante zero regressão
- **TV mode**: `isPresentationMode` já força single-performer via auto-rotate, então opacidade estática é suficiente

---

## What

### Comportamento visível ao usuário

- **Multi-linha (2+ performers)**:
  - `LineChart` (sem área preenchida)
  - Uma `<Line>` por performer com cor de `--chart-1` a `--chart-5`
  - Por padrão: todas as linhas a `strokeOpacity: 0.25`, `strokeWidth: 1.5`
  - Hover em linha ou legenda: linha focada `strokeOpacity: 1.0` / `strokeWidth: 2.5`, demais `strokeOpacity: 0.1`
  - Legenda abaixo do gráfico com nomes dos performers
  - Tooltip mostrando todos os performers (performer em foco destacado)

- **Single-performer (1 performer ou nenhum)**:
  - `AreaChart` com gradiente (comportamento ATUAL, sem alteração)
  - Curva muda de `type="monotone"` para `type="natural"` (mais suave)

- **TV/Apresentação (`isPresentationMode: true`)**:
  - Todas as linhas a `strokeOpacity: 0.7`, `strokeWidth: 2`
  - Sem `onMouseEnter`/`onMouseLeave` (sem estado de foco)

### Success Criteria

- [ ] Com 2+ performers: `LineChart` com uma linha por performer
- [ ] Com 1 performer: `AreaChart` original mantido sem alteração visual (exceto `type="natural"`)
- [ ] Hover em linha destaca ela e apaga as demais
- [ ] Hover em item da legenda produz o mesmo efeito
- [ ] Remover hover restaura `strokeOpacity: 0.25` em todas
- [ ] Curva `type="natural"` aplicada em ambos os modos
- [ ] Modo TV: linhas com opacidade estática, sem comportamento de foco
- [ ] Dark/light mode: mantém comportamento atual via `isDark`
- [ ] Cores seguem CSS variables `--chart-1` a `--chart-5` (`hsl(var(--chart-N))`)
- [ ] Nenhuma regressão: single-performer, TV mode, filtros de período funcionam

---

## All Needed Context

### Context Completeness Check

_"Se alguém não conhecesse este codebase, teria tudo para implementar com sucesso?"_ **SIM** — todos os padrões existentes, tipos, e documentação estão referenciados abaixo.

### Documentation & References

```yaml
# MUST READ — Primary Documentation
- docfile: PRPs/ai_docs/recharts-multi-line-focus-hover.md
  why: >
    Referência completa para LineChart multi-linha com focus-on-hover.
    Contém padrões verificados no source do recharts v3.7.0:
    assinaturas dos handlers de Legend, gotchas de strokeOpacity,
    exemplo completo de JSX, padrões de tooltip multi-linha.
  section: "Focus-on-Hover Pattern" e "Critical Gotchas"

- docfile: PRPs/ai_docs/recharts-date-fns.md
  why: Patterns existentes de AreaChart, custom tooltip, e date-fns formatting.
  section: Todas as seções — padrões que devem ser mantidos/estendidos

# MUST READ — Source Files a Modificar
- file: hooks/use-chart-data.ts
  why: >
    Hook existente `useChartData` a ser extendido com `useMultiLineChartData`.
    Contém toda a lógica de período, bucketing, e last-value-per-(bucket,performer)
    que deve ser REUTILIZADA (não duplicada).
  pattern: >
    Reutilizar: getDateThreshold, getBucketKey, filteredEntries por selectedPerformers,
    lógica de threshold "today" (data-relative), período filtering.
    DIFERENÇA: em vez de somar performers por bucket, manter cada performer separado.
  gotcha: >
    - "today" usa threshold data-relativo (latest entry -24h), não wall-clock
    - Retornar apenas últimas 9 points quando period="today" (slice(-9))
    - Performer key pode ser `entry.performer ?? "__single__"` — filtrar __single__ do resultado

- file: components/dashboard/metrics-chart.tsx
  why: Componente a ser estendido com multi-linha + focus-on-hover.
  pattern: >
    - isDark/mounted pattern (linhas 53-62) deve ser mantido
    - gradientId com theme suffix (linha 66) deve ser mantido para single-performer
    - strokeColor/fillColor/mutedColor (linhas 68-71) devem ser mantidos
    - xAxisTicks (linha 74) deve ser mantido em ambos os modos
    - Empty state (linhas 77-104) deve ser mantido
    - ChartTooltip import mantido para single-performer
  gotcha: >
    - NÃO remover AreaChart — mantido para single-performer
    - NÃO alterar props existentes (data, title, icon, className, compact, fillHeight)
    - hoveredPerformer state é LOCAL ao componente (não compartilhado)

- file: components/dashboard/dashboard-client.tsx
  why: >
    Orquestra todos os dados e renderiza seções. Deve chamar useMultiLineChartData
    ao lado dos useChartData existentes (linhas 82-109) e passar para as seções.
    IMPORTANTE: em TV mode (linhas 414-552), MetricsChart é chamado diretamente
    — essas chamadas também precisam receber as novas props.
  pattern: >
    - TV mode usa tvPerformers (single performer) → multiLineData será vazio/single → AreaChart fallback natural
    - Normal mode passa dados para YouTubeSection, InstagramSection, SpotifyHub via props
  gotcha: >
    - TV mode usa dados separados (tvYoutubeChartData, etc.) calculados de tvPerformers
    - Para TV mode MetricsChart, isPresentationMode={true} é necessário
    - youtubePerformers de useMultiLineChartData retorna apenas performers com dados

- file: components/dashboard/social-platforms/youtube-section.tsx
  why: Recebe chartData e passa para MetricsChart. Deve aceitar e propagar novas props.
  pattern: Props interface atual tem data, fullDashboardData, chartData, period, tvMode.
  gotcha: MetricsChart está na linha 140 sem novas props — deve receber multiLineData/performers.

- file: components/dashboard/social-platforms/instagram-section.tsx
  why: Mesma estrutura que YouTubeSection.
  gotcha: MetricsChart na linha 112 sem novas props.

- file: components/dashboard/spotify/spotify-hub.tsx
  why: Recebe followersChartData e listenersChartData. Deve aceitar e propagar novas props.
  pattern: Dois MetricsChart nas linhas 174 e 182.
  gotcha: Tem props separadas para followers e listeners chart data.

- file: lib/types/dashboard.ts
  why: Adicionar e exportar MultiLinePoint interface.
  pattern: Interfaces existentes como ChartDataPoint (linhas 45-49) para seguir o padrão.

# REFERENCE — Padrões do Codebase (leitura rápida)
- file: components/dashboard/chart-tooltip.tsx
  why: Padrão de custom tooltip existente (dark style, date formatting, formatCompactNumber).
  pattern: >
    - bg-foreground text-background para o card do tooltip
    - Detectar isDateTime via `value.includes("T") && value.includes(":")`
    - format(parseISO(labelStr), "HH:mm") para intraday
    - format(parseISO(labelStr), "dd MMM yy", { locale: ptBR }) para daily
    - formatCompactNumber para valores numéricos
```

### Current Codebase Tree (arquivos relevantes)

```bash
camping-dashboard/
├── app/
│   └── globals.css                    # CSS variables --chart-1..5 (oklch), dark mode via .dark class
├── components/
│   └── dashboard/
│       ├── chart-tooltip.tsx          # Custom tooltip padrão (single-performer)
│       ├── dashboard-client.tsx       # MODIFY: orquestrador principal, TV + normal mode
│       ├── metrics-chart.tsx          # MODIFY: AreaChart → suporte multi-linha + focus-hover
│       ├── social-platforms/
│       │   ├── youtube-section.tsx    # MODIFY: propagar multiLineData/performers
│       │   └── instagram-section.tsx # MODIFY: propagar multiLineData/performers
│       └── spotify/
│           └── spotify-hub.tsx        # MODIFY: propagar multiLineData/performers para charts
├── hooks/
│   └── use-chart-data.ts              # MODIFY: adicionar useMultiLineChartData
└── lib/
    └── types/
        └── dashboard.ts               # MODIFY: adicionar export MultiLinePoint
```

### Desired Codebase Tree (sem novos arquivos)

```bash
# Mesma estrutura — zero novos arquivos criados.
# Apenas extensões nos arquivos existentes listados acima.
# CONSTRAINT da feature: não criar novos componentes.
```

### Known Gotchas of our Codebase & Library Quirks

```typescript
// CRÍTICO: payload.dataKey vs payload.value no Legend handler
// ERRADO — value é o display name (name prop do Line), não o identificador
const handleMouseEnter = (payload: LegendPayload) => setHovered(payload.value);

// CORRETO — dataKey é o identificador da série (dataKey prop do Line)
const handleMouseEnter = (payload: LegendPayload) =>
  setHovered(payload.dataKey as string);

// CRÍTICO: recharts v3.7.0 — onMouseEnter/onMouseLeave no <Legend> APENAS funcionam
// com o renderer padrão. Se passar content={...} ao Legend, DEVE gerenciar
// mouse events dentro do custom renderer. Usar renderer padrão neste feature.

// CRÍTICO: CSS variables neste projeto usam formato OKLCH (não hsl/rgb)
// Para usar nas cores das linhas: "hsl(var(--chart-1))" via string interpolation.
// Ver app/globals.css linhas 71-75 (light) e 106-110 (dark).
// --chart-1 através --chart-5 têm os MESMOS valores em light e dark mode.

// CRÍTICO: isDark pattern — evitar hydration mismatch SSR
const { resolvedTheme } = useTheme(); // from next-themes
const [mounted, setMounted] = useState(false);
useEffect(() => {
  setMounted(true);
}, []);
const isDark = mounted && resolvedTheme === "dark"; // nunca usar sem mounted check

// CRÍTICO: gradientId deve incluir o theme para forçar re-render na troca de tema
const gradientId = `gradient-${title.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase()}-${isDark ? "dark" : "light"}`;

// CRÍTICO: para period="today", threshold é data-relativo (baseado no latest entry),
// NÃO usa wall-clock time. Ver useChartData linhas 139-148.

// CRÍTICO: isAnimationActive={false} recomendado para <Line> em multi-linha
// Animação usa strokeDasharray/strokeDashoffset que conflita com CSS opacity transitions.

// GOTCHA: strokeOpacity nos dots — dots herdam strokeOpacity do Line pai.
// Com dot={false}, isso não é problema. Se usar dot={true}, override explicitamente.

// GOTCHA: type="natural" pode gerar valores negativos por overshoot.
// Usar domain={["auto", "auto"]} allowDataOverflow={false} no YAxis.

// GOTCHA: performers key "__single__" — quando entry.performer é undefined,
// useChartData usa "__single__". Em useMultiLineChartData, filtrar este performer
// do array retornado pois não deve virar uma linha separada.
```

---

## Implementation Blueprint

### Data Models and Structure

```typescript
// 1. Adicionar em lib/types/dashboard.ts (export novo)

// Ponto de dados para multi-linha — chaves dinâmicas por performer
export interface MultiLinePoint {
  date: string;
  [performerId: string]: number | undefined | string; // string só para "date"
}
// Alternativa mais type-safe se preferido:
// export type MultiLinePoint = { date: string } & Record<string, number | undefined>;

// 2. Tipos em hooks/use-chart-data.ts (local, não exportar)
type Platform = "youtube" | "instagram" | "spotify"; // já existe
type Metric = keyof PlatformMetrics; // já existe

// 3. Return type do hook (inline no hook ou exportar)
// { points: MultiLinePoint[]; performers: string[] }
// performers = array de performer IDs únicos com dados no período
```

### Implementation Tasks (ordered by dependencies)

```yaml
Task 1: MODIFY lib/types/dashboard.ts
  - ADD: export interface MultiLinePoint { date: string; [performerId: string]: number | undefined | string; }
  - PLACEMENT: Após a definição de ChartDataPoint (linhas 45-49)
  - NAMING: PascalCase, consistente com ChartDataPoint existente
  - PATTERN: Seguir exatamente o estilo das interfaces existentes no arquivo

Task 2: MODIFY hooks/use-chart-data.ts
  - ADD: export function useMultiLineChartData(...)
  - PLACEMENT: Após useChartData (linha 201), como novo export
  - IMPORTS: Adicionar MultiLinePoint ao import de @/lib/types/dashboard
  - IMPLEMENT:
    1. REUTILIZAR getDateThreshold, getBucketKey (funções já no arquivo)
    2. REUTILIZAR lógica de threshold "today" (data-relativo, linhas 139-148)
    3. REUTILIZAR lógica de filteredEntries por selectedPerformers (linhas 129-133)
    4. REUTILIZAR bucketPerformer Map<string, Map<string, {value, datetime}>> (linhas 159-173)
    5. DIFERENÇA: em vez de somar (Step 2 de useChartData), criar objeto { date, [performer]: value }
    6. DIFERENÇA: retornar { points: MultiLinePoint[], performers: string[] }
    7. performers = Array.from(Set de todos performers encontrados nos dados)
    8. FILTRAR "__single__" do array performers retornado
    9. SLICE(-9) para period="today" como useChartData faz
  - SIGNATURE:
    export function useMultiLineChartData(
      data: DashboardResponse | undefined,
      platform: Platform,
      metric: Metric,
      selectedPerformers: string[],
      period: PeriodFilter = "30d",
    ): { points: MultiLinePoint[]; performers: string[] }

Task 3: MODIFY components/dashboard/metrics-chart.tsx
  PART A — Adicionar imports:
  - ADD: import { LineChart, Line, Legend } from "recharts" (juntar ao import existente)
  - ADD: import type { LegendPayload } from "recharts"
  - ADD: import { useState } from "react" (já tem useEffect e useState? verificar)
  - ADD: import type { MultiLinePoint } from "@/lib/types/dashboard"
  - ADD: import para MultiLineTooltip (definir inline no arquivo ou importar de chart-tooltip.tsx)

  PART B — Atualizar MetricsChartProps interface:
  - ADD as optional props:
    multiLineData?: MultiLinePoint[];
    performers?: { id: string; name: string }[];
    isPresentationMode?: boolean;
  - PRESERVE: todas as props existentes (data, title, icon, className, compact, fillHeight)

  PART C — Adicionar estado e lógica hover:
  - ADD: const [hoveredPerformer, setHoveredPerformer] = useState<string | null>(null);
  - ADD: const isMultiLine = (performers?.length ?? 0) >= 2 && !!multiLineData?.length;
  - ADD: CHART_COLORS constant (array de 5 strings com hsl(var(--chart-N)))
  - ADD: getOpacity(performerId: string): number
      - isPresentationMode → return 0.7
      - hoveredPerformer === null → return 0.25
      - hoveredPerformer === performerId → return 1.0
      - else → return 0.1
  - ADD: getWidth(performerId: string): number
      - isPresentationMode → return 2
      - hoveredPerformer === performerId → return 2.5
      - else → return 1.5
  - ADD: handleLegendMouseEnter = (payload: LegendPayload) => { if (!isPresentationMode) setHoveredPerformer(payload.dataKey as string) }
  - ADD: handleLegendMouseLeave = () => setHoveredPerformer(null)

  PART D — Renderização condicional no JSX (branch isMultiLine):
  - IF isMultiLine:
    RENDER LineChart (ver JSX blueprint abaixo)
    - CartesianGrid, XAxis, YAxis IGUAIS ao AreaChart existente
    - YAxis adiciona: domain={["auto", "auto"]} allowDataOverflow={false}
    - Tooltip: <MultiLineTooltip hoveredPerformer={hoveredPerformer} />
    - Legend: verticalAlign="bottom", onMouseEnter/onMouseLeave
    - Lines: performers.map(...) com isAnimationActive={false}
  - ELSE (single-performer ou multiLineData ausente):
    MANTER AreaChart existente INTACTO, apenas mudar type="natural" (era "monotone")

  PART E — MultiLineTooltip (definir no mesmo arquivo, não criar novo arquivo):
  - Seguir padrão dark style de ChartTooltip (bg-foreground text-background)
  - Mostrar data formatada (isDateTime check igual ao ChartTooltip)
  - Mostrar cada performer com cor + nome + valor formatCompactNumber
  - Reduzir opacity de itens não focados (hoveredPerformer check)

Task 4: MODIFY components/dashboard/social-platforms/youtube-section.tsx
  - ADD to YouTubeSectionProps interface:
    multiLineData?: MultiLinePoint[];
    performers?: { id: string; name: string }[];
    isPresentationMode?: boolean;
  - ADD to function params: multiLineData, performers, isPresentationMode
  - MODIFY MetricsChart call (linha 140-144):
    BEFORE: <MetricsChart title="..." data={chartData} icon={...} />
    AFTER:  <MetricsChart title="..." data={chartData} icon={...}
              multiLineData={multiLineData}
              performers={performers}
              isPresentationMode={isPresentationMode}
            />
  - ADD import: import type { MultiLinePoint } from "@/lib/types/dashboard"

Task 5: MODIFY components/dashboard/social-platforms/instagram-section.tsx
  - MESMO PADRÃO do Task 4
  - MetricsChart na linha 112-116
  - Mesmas 3 novas props opcionais

Task 6: MODIFY components/dashboard/spotify/spotify-hub.tsx
  - ADD to SpotifyHubProps:
    followersMultiLineData?: MultiLinePoint[];
    listenersMultiLineData?: MultiLinePoint[];
    performers?: { id: string; name: string }[];
    isPresentationMode?: boolean;
  - MODIFY MetricsChart linha 174 (followers chart):
    ADD: multiLineData={followersMultiLineData} performers={performers} isPresentationMode={isPresentationMode}
  - MODIFY MetricsChart linha 182 (listeners chart):
    ADD: multiLineData={listenersMultiLineData} performers={performers} isPresentationMode={isPresentationMode}
  - ADD import: import type { MultiLinePoint } from "@/lib/types/dashboard"

Task 7: MODIFY components/dashboard/dashboard-client.tsx
  PART A — Novos imports:
  - ADD: import { useMultiLineChartData } from "@/hooks/use-chart-data"
  - ADD: import type { MultiLinePoint } from "@/lib/types/dashboard"

  PART B — Chamar useMultiLineChartData ao lado dos useChartData existentes (após linha 109):
  - ADD os 4 hooks (ver código abaixo em Implementation Patterns)
  - Mapear performers de string[] para { id: string; name: string }[]

  PART C — Normal mode (linhas 579-616) — passar novas props para seções:
  - SpotifyHub (linha 579-587): ADD followersMultiLineData, listenersMultiLineData, performers, isPresentationMode
  - YouTubeSection (linha 594-600): ADD multiLineData, performers, isPresentationMode
  - InstagramSection (linha 603-614): ADD multiLineData, performers, isPresentationMode

  PART D — TV mode (linhas 414-554) — MetricsChart direto:
  - TV mode usa tvPerformers (máx 1 performer) → useMultiLineChartData retornará
    1 performer → isMultiLine será false → AreaChart fallback automático
  - Mas por segurança, passar isPresentationMode={true} em todos os MetricsChart do TV mode:
    - Spotify: linhas 414, 422 (MetricsChart de followersChart e listenersChart)
    - YouTube: linha 511 (tvYoutubeChartData)
    - Instagram: linha 548 (tvInstagramChartData)
  - NOTA: multiLineData e performers NÃO são necessários para TV mode pois
    tvPerformers sempre tem 1 elemento (isMultiLine será false)
```

### Implementation Patterns & Key Details

```typescript
// ═══════════════════════════════════════════════════════════════
// TASK 2: useMultiLineChartData — padrão exato a seguir
// ═══════════════════════════════════════════════════════════════

export function useMultiLineChartData(
  data: DashboardResponse | undefined,
  platform: Platform,
  metric: Metric,
  selectedPerformers: string[],
  period: PeriodFilter = "30d",
): { points: MultiLinePoint[]; performers: string[] } {
  return useMemo(() => {
    if (!data) return { points: [], performers: [] };

    const totalData = data.total;
    if (!totalData) return { points: [], performers: [] };

    const platformData = totalData[platform];
    if (!platformData) return { points: [], performers: [] };

    const metricData = platformData[metric] as MetricData | undefined;
    if (!metricData?.entries) return { points: [], performers: [] };

    const { entries } = metricData;

    // REUTILIZAR: filtrar por selectedPerformers (igual useChartData linhas 129-133)
    const filteredEntries =
      selectedPerformers.length === 0
        ? entries
        : entries.filter(
            (e) => e.performer && selectedPerformers.includes(e.performer),
          );

    // REUTILIZAR: threshold para "today" (data-relativo, igual useChartData linhas 139-148)
    let threshold: Date;
    if (period === "today") {
      const latestDatetime = filteredEntries.reduce(
        (max, e) => (e.datetime > max ? e.datetime : max),
        filteredEntries[0]?.datetime ?? "",
      );
      threshold = new Date(
        new Date(latestDatetime).getTime() - 24 * 60 * 60 * 1000,
      );
    } else {
      threshold = getDateThreshold(period);
    }

    // REUTILIZAR: filter por período
    const periodFiltered = filteredEntries.filter(
      (e) => new Date(e.datetime) >= threshold,
    );

    // REUTILIZAR: last-value-per-(bucket, performer) (igual useChartData linhas 159-173)
    const bucketPerformer = new Map<
      string,
      Map<string, { value: number; datetime: string }>
    >();
    periodFiltered.forEach((entry) => {
      const bucketKey = getBucketKey(entry.datetime, period);
      const performer = entry.performer ?? "__single__";
      if (!bucketPerformer.has(bucketKey))
        bucketPerformer.set(bucketKey, new Map());
      const pm = bucketPerformer.get(bucketKey)!;
      const existing = pm.get(performer);
      if (!existing || entry.datetime > existing.datetime) {
        pm.set(performer, { value: entry.value, datetime: entry.datetime });
      }
    });

    // DIFERENÇA: em vez de somar, criar objeto { date, [performer]: value }
    const allPerformers = new Set<string>();
    bucketPerformer.forEach((performerMap) => {
      performerMap.forEach((_, performer) => {
        if (performer !== "__single__") allPerformers.add(performer);
      });
    });

    const sortedBuckets = Array.from(bucketPerformer.entries()).sort(
      ([a], [b]) => a.localeCompare(b),
    );

    const points: MultiLinePoint[] = sortedBuckets.map(([date, performerMap]) => {
      const point: MultiLinePoint = { date };
      performerMap.forEach(({ value }, performer) => {
        if (performer !== "__single__") {
          point[performer] = value;
        }
      });
      return point;
    });

    const performers = Array.from(allPerformers);

    // REUTILIZAR: slice para "today" (igual useChartData linha 203)
    const finalPoints = period === "today" ? points.slice(-9) : points;

    return { points: finalPoints, performers };
  }, [data, platform, metric, selectedPerformers, period]);
}

// ═══════════════════════════════════════════════════════════════
// TASK 3: MetricsChart — CHART_COLORS e lógica de foco
// ═══════════════════════════════════════════════════════════════

const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

// Estado de foco — LOCAL ao MetricsChart
const [hoveredPerformer, setHoveredPerformer] = useState<string | null>(null);

// Guard: só ativa multi-linha com 2+ performers E dados presentes
const isMultiLine = (performers?.length ?? 0) >= 2 && !!multiLineData?.length;

// Opacity e width por estado
const getOpacity = (performerId: string): number => {
  if (isPresentationMode) return 0.7;
  if (hoveredPerformer === null) return 0.25;
  return hoveredPerformer === performerId ? 1.0 : 0.1;
};
const getWidth = (performerId: string): number => {
  if (isPresentationMode) return 2;
  return hoveredPerformer === performerId ? 2.5 : 1.5;
};

// Legend handlers
const handleLegendMouseEnter = (payload: LegendPayload) => {
  if (!isPresentationMode) setHoveredPerformer(payload.dataKey as string);
};
const handleLegendMouseLeave = () => setHoveredPerformer(null);

// ═══════════════════════════════════════════════════════════════
// TASK 3: MetricsChart — JSX do LineChart (modo multi-linha)
// ═══════════════════════════════════════════════════════════════

// Substituir AreaChart por LineChart quando isMultiLine
// xAxisTicks, mutedColor, empty state permanecem IGUAIS

<ResponsiveContainer width="100%" height="100%">
  <LineChart
    data={multiLineData}
    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
  >
    {/* CartesianGrid IGUAL ao AreaChart existente */}
    <CartesianGrid
      vertical={false}
      strokeDasharray="3 3"
      className="stroke-muted"
    />

    {/* XAxis IGUAL ao AreaChart existente — mantém tickFormatter de data */}
    <XAxis
      dataKey="date"
      ticks={xAxisTicks}
      tickFormatter={(value) => {
        if (value.includes("T") && value.includes(":")) {
          return format(parseISO(value), "HH:mm");
        }
        return format(parseISO(value), "dd MMM", { locale: ptBR });
      }}
      tick={{ fill: mutedColor, fontSize: 12 }}
      axisLine={false}
      tickLine={false}
      tickMargin={8}
    />

    {/* YAxis — adicionar domain e allowDataOverflow para type="natural" */}
    <YAxis
      tickFormatter={formatCompactNumber}
      tick={{ fill: mutedColor, fontSize: 12 }}
      axisLine={false}
      tickLine={false}
      width={45}
      domain={["auto", "auto"]}
      allowDataOverflow={false}
    />

    {/* Tooltip multi-linha com performer em foco destacado */}
    <Tooltip
      content={
        <MultiLineChartTooltip hoveredPerformer={hoveredPerformer} />
      }
    />

    {/* Legend abaixo, com hover handlers */}
    <Legend
      verticalAlign="bottom"
      onMouseEnter={handleLegendMouseEnter}
      onMouseLeave={handleLegendMouseLeave}
    />

    {/* Uma Line por performer */}
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
</ResponsiveContainer>

// ═══════════════════════════════════════════════════════════════
// TASK 3: MultiLineChartTooltip — definir no metrics-chart.tsx
// ═══════════════════════════════════════════════════════════════

// Importar tipo de recharts para tooltip
import type { TooltipProps } from "recharts";
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";

interface MultiLineChartTooltipProps extends TooltipProps<ValueType, NameType> {
  hoveredPerformer: string | null;
}

function MultiLineChartTooltip({
  active,
  payload,
  label,
  hoveredPerformer,
}: MultiLineChartTooltipProps) {
  if (!active || !payload?.length) return null;

  // REUTILIZAR: padrão de date formatting de ChartTooltip (components/dashboard/chart-tooltip.tsx)
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

// ═══════════════════════════════════════════════════════════════
// TASK 7: dashboard-client.tsx — novos hooks e props
// ═══════════════════════════════════════════════════════════════

// Após linha 109 (useChartData do spotifyListeners), adicionar:
const { points: youtubeMultiLine, performers: youtubePerformerIds } =
  useMultiLineChartData(
    initialData || undefined,
    "youtube",
    "followers",
    selectedPerformers,
    period,
  );

const { points: instagramMultiLine, performers: instagramPerformerIds } =
  useMultiLineChartData(
    initialData || undefined,
    "instagram",
    "followers",
    selectedPerformers,
    period,
  );

const { points: spotifyFollowersMultiLine, performers: spotifyPerformerIds } =
  useMultiLineChartData(
    initialData || undefined,
    "spotify",
    "followers",
    selectedPerformers,
    period,
  );

const { points: spotifyListenersMultiLine } = useMultiLineChartData(
  initialData || undefined,
  "spotify",
  "monthly_listeners",
  selectedPerformers,
  period,
);

// Mapear IDs para { id, name } (feature doc usa id como name)
const youtubePerformers = youtubePerformerIds.map((id) => ({ id, name: id }));
const instagramPerformers = instagramPerformerIds.map((id) => ({ id, name: id }));
const spotifyPerformers = spotifyPerformerIds.map((id) => ({ id, name: id }));

// Normal mode — SpotifyHub (linha ~579):
<SpotifyHub
  // ...props existentes...
  followersMultiLineData={spotifyFollowersMultiLine}
  listenersMultiLineData={spotifyListenersMultiLine}
  performers={spotifyPerformers}
  isPresentationMode={presentation.isActive}
/>

// Normal mode — YouTubeSection (linha ~594):
<YouTubeSection
  // ...props existentes...
  multiLineData={youtubeMultiLine}
  performers={youtubePerformers}
  isPresentationMode={presentation.isActive}
/>

// Normal mode — InstagramSection (linha ~603):
<InstagramSection
  // ...props existentes...
  multiLineData={instagramMultiLine}
  performers={instagramPerformers}
  isPresentationMode={presentation.isActive}
/>

// TV mode — MetricsChart direto — apenas adicionar isPresentationMode:
// (TV mode usa tvPerformers com 1 performer → isMultiLine=false → AreaChart fallback)
<MetricsChart
  title="Seguidores"
  data={tvSpotifyFollowersChartData}
  icon={...}
  isPresentationMode={true}  // ADD
/>
// Idem para tvSpotifyListenersChartData, tvYoutubeChartData, tvInstagramChartData
```

### Integration Points

```yaml
TYPES:
  - add to: lib/types/dashboard.ts
  - export: interface MultiLinePoint
  - after: ChartDataPoint interface (linha ~49)

HOOK:
  - add to: hooks/use-chart-data.ts
  - export: function useMultiLineChartData
  - after: useChartData (linha ~201)
  - reuses: getDateThreshold, getBucketKey (funções locais do mesmo arquivo)

METRICS_CHART_PROPS:
  - modify: components/dashboard/metrics-chart.tsx
  - add optional props: multiLineData, performers, isPresentationMode
  - preserve: ALL existing props and behavior

SECTION_COMPONENTS:
  - youtube-section.tsx: add multiLineData, performers, isPresentationMode props → forward to MetricsChart
  - instagram-section.tsx: mesmo padrão
  - spotify-hub.tsx: add followersMultiLineData, listenersMultiLineData, performers, isPresentationMode

DASHBOARD_CLIENT:
  - add 4 useMultiLineChartData calls (youtube/instagram/spotify-followers/spotify-listeners)
  - add performer mapping (id + name)
  - pass new props to all 3 section components
  - add isPresentationMode={true} to 4 direct MetricsChart calls in TV mode
```

---

## Validation Loop

### Level 1: TypeScript (Imediato — após cada arquivo)

```bash
# Rodar após cada arquivo modificado para pegar erros de tipo cedo
cd /home/wicarpessoa/personal/camping/camping-dashboard

# Type check completo
pnpm exec tsc --noEmit

# Expected: Zero errors.
# Erros comuns a corrigir:
# - "Property 'X' does not exist on type 'MultiLinePoint'" → type assertion necessária
# - "Argument of type 'string | DataKey<any>' is not assignable to 'string'" → usar `payload.dataKey as string`
# - "Property 'multiLineData' does not exist on type 'MetricsChartProps'" → verificar interface atualizada
```

### Level 2: Build (Validação de Compilação)

```bash
cd /home/wicarpessoa/personal/camping/camping-dashboard

pnpm build

# Expected: Build bem-sucedido sem erros.
# "next build" compila TS + lint + bundle — pega erros que tsc --noEmit pode perder.
```

### Level 3: Lint

```bash
cd /home/wicarpessoa/personal/camping/camping-dashboard

pnpm lint

# Expected: Max 10 warnings (limite configurado), zero errors.
# Fix imediato se houver errors de lint.
```

### Level 4: Visual Testing (Navegador)

```bash
cd /home/wicarpessoa/personal/camping/camping-dashboard
pnpm dev

# Navegar para http://localhost:3000
```

**Checklist de testes visuais**:

```bash
# CENÁRIO 1: Multi-performer (2+ selecionados)
# 1. Selecionar 2+ performers no filtro do header
# 2. VERIFICAR: LineChart aparece com uma linha por performer
# 3. VERIFICAR: Todas as linhas começam com opacidade baixa (0.25 — quase transparentes)
# 4. Hover em uma linha → VERIFICAR: linha destaca, outras ficam mais apagadas
# 5. Hover em nome na legenda → VERIFICAR: mesmo efeito do passo 4
# 6. Remove hover → VERIFICAR: todas voltam a opacidade 0.25
# 7. VERIFICAR: Tooltip mostra todos os performers com performer hovado destacado
# 8. VERIFICAR: Cores usando --chart-1 a --chart-5 (azuis no tema padrão)

# CENÁRIO 2: Single-performer (exatamente 1 selecionado)
# 1. Selecionar apenas 1 performer
# 2. VERIFICAR: AreaChart com gradiente (comportamento original mantido)
# 3. VERIFICAR: Curva mais suave que antes (type="natural")
# 4. VERIFICAR: Tooltip original funcionando (data + valor + % change)

# CENÁRIO 3: Nenhum performer selecionado ("todos")
# 1. Desmarcar todos os performers (ou usar filtro padrão)
# 2. VERIFICAR: AreaChart com gradiente (fallback para single-performer)

# CENÁRIO 4: Modo TV (Apresentação)
# 1. Ativar modo de apresentação (botão no header)
# 2. VERIFICAR: MetricsChart sem comportamento de hover
# 3. VERIFICAR: Linhas com opacidade estática (single-performer → AreaChart normal)

# CENÁRIO 5: Dark/Light mode
# 1. Alternar tema (botão no header)
# 2. VERIFICAR: Cores de eixo e grid se adaptam corretamente
# 3. VERIFICAR: Tooltip continua com estilo correto em ambos os modos

# CENÁRIO 6: Filtros de período
# 1. Alternar entre Hoje / 7d / 30d com 2+ performers
# 2. VERIFICAR: Gráficos atualizam corretamente
# 3. VERIFICAR: Eixo X formatado corretamente (HH:mm para Hoje, dd MMM para 7d/30d)
```

---

## Final Validation Checklist

### Technical Validation

- [ ] `pnpm exec tsc --noEmit` — zero type errors
- [ ] `pnpm build` — build bem-sucedido
- [ ] `pnpm lint` — sem errors (max 10 warnings)
- [ ] Nenhum novo arquivo criado (constraint: estender existentes)

### Feature Validation

- [ ] Com 2+ performers: `LineChart` com uma linha por performer renderizando
- [ ] Com 1 performer: `AreaChart` original mantido (zero regressão)
- [ ] Hover em linha destaca ela e apaga as demais
- [ ] Hover em item da legenda produz o mesmo efeito
- [ ] Remover hover restaura `strokeOpacity: 0.25` em todas as linhas
- [ ] Curva `type="natural"` aplicada em ambos os modos (mais suave)
- [ ] Modo TV: linhas com opacidade `0.7` estática, sem comportamento de foco
- [ ] Dark/light mode: mantém comportamento de cores correto
- [ ] Cores seguem CSS variables `--chart-1` a `--chart-5`
- [ ] Tooltip multi-performer: mostra todos, destaca o hovado
- [ ] YouTube, Instagram, e Spotify charts todos com multi-linha
- [ ] Filtros de período (Hoje/7d/30d) continuam funcionando
- [ ] `type="natural"` no AreaChart single-performer não introduz overshoot visível

### Code Quality Validation

- [ ] `useMultiLineChartData` reutiliza `getDateThreshold`, `getBucketKey` do mesmo arquivo (sem duplicação)
- [ ] `hoveredPerformer` state é local ao `MetricsChart` (não vaza para cima)
- [ ] `MultiLineChartTooltip` definido no mesmo arquivo que `MetricsChart` (sem novo arquivo)
- [ ] Props existentes de `MetricsChart` preservadas e opcionais novas não quebram usos atuais
- [ ] `MultiLinePoint` exportada de `lib/types/dashboard.ts`
- [ ] `performers` mapeados como `{ id, name }[]` — `id` é `dataKey`, `name` é display

### Constraint Compliance

- [ ] Zero novos arquivos de componente criados
- [ ] `ChartDataPoint` não modificado (backward compat)
- [ ] Comportamento do modo TV/apresentação não quebrado
- [ ] `data: ChartDataPoint[]` mantido nas props do `MetricsChart`

---

## Anti-Patterns to Avoid

- ❌ Não usar `payload.value` para identificar série no Legend handler — usar `payload.dataKey`
- ❌ Não passar `content={...}` ao `<Legend>` junto com `onMouseEnter`/`onMouseLeave` no Legend — handlers não disparam com custom content
- ❌ Não duplicar a lógica de `getDateThreshold` ou `getBucketKey` — reutilizar as existentes
- ❌ Não remover o `AreaChart` existente — é o fallback para single-performer
- ❌ Não criar novos arquivos de componente — estender os existentes
- ❌ Não usar `index` como React `key` para as `<Line>` — usar `performer.id`
- ❌ Não esquecer `isAnimationActive={false}` nas `<Line>` — conflita com opacity transitions
- ❌ Não usar `useTheme()` sem o `mounted` guard — causa hydration mismatch em SSR
- ❌ Não hardcodar cores hex — usar `hsl(var(--chart-N))` para respeitar o tema

---

## Confidence Score

**9/10** — Feature spec é detalhada com exemplos de código precisos. Toda a lógica de dados reutiliza padrões existentes bem documentados. O principal risco é a propagação das novas props pelas 3 seções (gap na feature doc) que foi explicitamente documentado e resolvido no Task 4-6. Recharts API verificada na source para a versão exata do projeto.
