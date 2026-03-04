# Feature: Multi-line Charts com Focus-on-Hover

## Overview

Evolução do sistema de gráficos do dashboard para exibir **uma linha por performer** em vez de uma linha agregada, com comportamento de focus-on-hover que reduz o ruído visual: linhas ficam apagadas por padrão e destacam individualmente no hover.

Quando apenas 1 performer estiver selecionado, o comportamento atual (AreaChart com área preenchida) é mantido.

## Tech Stack

- **Recharts** — `LineChart`, `Line`, `Legend` (já em uso)
- **React** — estado local `hoveredPerformer` para controle de foco

## Implementação atual

**Componente:** `components/dashboard/metrics-chart.tsx`

- `AreaChart` com uma única `<Area dataKey="value" />` — valor agregado (soma de todos os performers)
- Curva: `type="monotone"`
- Recebe `data: ChartDataPoint[]` onde `ChartDataPoint = { date, value, previousValue? }`

**Hook:** `hooks/use-chart-data.ts`

- `useChartData` agrupa entries por bucket, pega último valor por `(bucket, performer)` e **soma** tudo num único `value`
- Dados brutos em `data.total.[platform].[metric].entries` têm campo `performer` por entry

## Requirements

### Must Have

- Uma linha por performer quando 2+ performers estiverem ativos
- Curva `type="natural"` (mais orgânica) em ambos os modos
- Focus-on-hover: linhas apagadas por padrão, destaque individual no hover
- Hover na legenda também ativa o foco da linha correspondente
- Fallback para AreaChart quando apenas 1 performer selecionado
- Suporte a dark/light mode (lógica `isDark` existente)
- Modo TV/apresentação com opacidade estática (sem hover)

### Nice to Have

- Animação suave na transição de opacidade entre estados
- Tooltip mostrando todos os performers com o performer em foco destacado

## User Flow

1. Usuário acessa o dashboard com múltiplos performers ativos
2. Gráficos exibem todas as linhas levemente apagadas (`strokeOpacity: 0.25`)
3. Usuário passa o mouse sobre uma linha ou seu nome na legenda
4. A linha em foco destaca (`strokeOpacity: 1.0`, `strokeWidth: 2.5`)
5. As demais linhas ficam ainda mais apagadas (`strokeOpacity: 0.1`)
6. Ao remover o hover, todas voltam ao estado padrão
7. Com apenas 1 performer selecionado, exibe AreaChart igual ao comportamento atual

## Componentes

### `useMultiLineChartData` (novo export em `hooks/use-chart-data.ts`)

Mesmo bucketing e lógica de last-value-per-(bucket, performer) do `useChartData`, mas em vez de somar, mantém cada performer como chave separada no ponto.

**Signature:**

```ts
export function useMultiLineChartData(
  data: DashboardResponse | undefined,
  platform: Platform,
  metric: Metric,
  selectedPerformers: string[],
  period: PeriodFilter,
): { points: MultiLinePoint[]; performers: string[] };
```

**Tipo de saída:**

```ts
// em lib/types/dashboard.ts
export interface MultiLinePoint {
  date: string;
  [performerId: string]: number | undefined | string; // string = "date"
}
```

**Lógica:**

1. Filtrar entries pelo período (igual ao `useChartData`)
2. Agrupar por `(bucketKey, performer)` mantendo último valor por performer
3. Para cada bucket, criar um objeto `{ date, [performer]: value }` em vez de somar
4. Retornar também o array `performers` (ids únicos presentes nos dados)

---

### `MetricsChart` (atualizar `components/dashboard/metrics-chart.tsx`)

**Novas props:**

```ts
interface MetricsChartProps {
  // existentes
  data: ChartDataPoint[];
  title: string;
  icon?: React.ReactNode;
  className?: string;
  compact?: boolean;
  fillHeight?: boolean;
  // novas
  multiLineData?: MultiLinePoint[];
  performers?: { id: string; name: string }[];
  isPresentationMode?: boolean;
}
```

**Modo multi-linha** (quando `performers.length >= 2` e `multiLineData` presente):

- Renderiza `LineChart` em vez de `AreaChart`
- Estado interno: `const [hoveredPerformer, setHoveredPerformer] = useState<string | null>(null)`
- Sem gradiente/área preenchida
- `type="natural"` em cada `<Line>`
- `<Legend>` abaixo do gráfico com `onMouseEnter`/`onMouseLeave` para controle de foco

**Opacidade por estado:**

```ts
// Para cada linha
const opacity =
  hoveredPerformer === null
    ? 0.25 // nenhum em foco → todas apagadas
    : hoveredPerformer === performer.id
      ? 1.0 // esta em foco → destaque
      : 0.1; // outra em foco → bem apagada

const width = hoveredPerformer === performer.id ? 2.5 : 1.5;
```

**Modo TV/apresentação** (`isPresentationMode: true`):

- `strokeOpacity: 0.7`, `strokeWidth: 2` em todas as linhas
- Sem `onMouseEnter`/`onMouseLeave` (sem estado de foco)

**Modo single-performer** (`performers.length <= 1` ou `multiLineData` ausente):

- Comportamento atual intacto (AreaChart + área gradiente)
- Curva muda para `type="natural"` também

**Cores:**

```ts
const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];
// performers[index % CHART_COLORS.length]
```

---

### `dashboard-client.tsx` (atualizar)

Chamar `useMultiLineChartData` para cada plataforma/métrica ao lado dos `useChartData` existentes:

```ts
const { points: youtubeMultiLine, performers: youtubePerformers } =
  useMultiLineChartData(
    initialData,
    "youtube",
    "followers",
    selectedPerformers,
    period,
  );

const { points: instagramMultiLine, performers: instagramPerformers } =
  useMultiLineChartData(
    initialData,
    "instagram",
    "followers",
    selectedPerformers,
    period,
  );

const { points: spotifyFollowersMultiLine, performers: spotifyPerformers } =
  useMultiLineChartData(
    initialData,
    "spotify",
    "followers",
    selectedPerformers,
    period,
  );

const { points: spotifyListenersMultiLine } = useMultiLineChartData(
  initialData,
  "spotify",
  "monthly_listeners",
  selectedPerformers,
  period,
);
```

Passar para cada `<MetricsChart>`:

```tsx
<MetricsChart
  data={youtubeChartData} // mantido para fallback single
  multiLineData={youtubeMultiLine}
  performers={youtubePerformers.map((id) => ({ id, name: id }))}
  isPresentationMode={presentation.isActive}
  // ...resto das props existentes
/>
```

No modo TV, as instâncias de `MetricsChart` já recebem `isPresentationMode={true}` via prop — comportamento estático sem hover.

## Arquivos a modificar

| Arquivo                                     | Mudança                                                   |
| ------------------------------------------- | --------------------------------------------------------- |
| `hooks/use-chart-data.ts`                   | Adicionar `useMultiLineChartData` e tipo `MultiLinePoint` |
| `lib/types/dashboard.ts`                    | Exportar `MultiLinePoint`                                 |
| `components/dashboard/metrics-chart.tsx`    | Suporte multi-linha + focus-on-hover + `type="natural"`   |
| `components/dashboard/dashboard-client.tsx` | Chamar novo hook, passar novas props                      |

## Constraints

- Não criar novos arquivos de componente — estender o `MetricsChart` existente
- Não alterar `ChartDataPoint` (backwards compat com `buildChartPoints` e outros usos)
- Não quebrar comportamento do modo TV/apresentação
- Não remover `data: ChartDataPoint[]` das props (mantido para single-performer)

## Acceptance Criteria

- [ ] Com 2+ performers: gráfico exibe uma linha por performer
- [ ] Com 1 performer: AreaChart original é mantido
- [ ] Hover em linha destaca ela e apaga as demais
- [ ] Hover em item da legenda produz o mesmo efeito
- [ ] Remover hover restaura todas as linhas ao estado padrão
- [ ] Curva `type="natural"` aplicada em ambos os modos (multi e single)
- [ ] Modo TV: linhas com opacidade estática, sem comportamento de foco
- [ ] Dark/light mode funcionam corretamente
- [ ] Cores seguem as CSS variables `--chart-1` a `--chart-5`
- [ ] Nenhuma regressão nos gráficos existentes (single-performer, TV mode, filtro de período)

## Riscos e Mitigações

| Risco                                                                     | Impacto | Mitigação                                                                                          |
| ------------------------------------------------------------------------- | ------- | -------------------------------------------------------------------------------------------------- |
| Muitos performers (8+) tornam legenda ilegível                            | UX      | Truncar nome na legenda; considerar limite visual de 6 linhas                                      |
| `type="natural"` pode gerar valores negativos em dados com pouca variação | Visual  | Manter `domain` do YAxis em `[auto, auto]` com `allowDataOverflow={false}`                         |
| `MultiLinePoint` com chaves dinâmicas dificulta tipagem estrita           | DX      | Usar `Record<string, number \| undefined> & { date: string }`                                      |
| Modo TV sem hover deixa muitas linhas confusas                            | UX      | `isPresentationMode` força opacidade `0.7` em todas — aceitável pois TV mostra 1 performer por vez |
