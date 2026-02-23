# Charts Data Logic & Growth Calculation

## Contexto

Os gráficos estão somando todos os timestamps do mesmo dia, mas o correto é pegar o último valor do dia. Os dados são snapshots cumulativos (followers, views), não eventos incrementais.

O crescimento mostrado nos cards sempre compara hoje vs ontem, mas deveria variar de acordo com o filtro ativo.

## Comportamento esperado por filtro

### Filtro `today` (1d)

- Gráfico: mostrar o último registro de cada janela de 3 horas nas últimas 24h
  - Janelas: 00h-03h, 03h-06h, 06h-09h, 09h-12h, 12h-15h, 15h-18h, 18h-21h, 21h-00h
  - Resultado: até 8 pontos no gráfico
- Crescimento no card: latest vs o registro mais antigo dentro das últimas 24h

### Filtro `7d`

- Gráfico: mostrar o último registro de cada dia dos últimos 7 dias
  - Resultado: até 7 pontos
- Crescimento no card: latest vs o último registro de 7 dias atrás

### Filtro `30d`

- Gráfico: mostrar o último registro de cada dia dos últimos 30 dias
  - Resultado: até 30 pontos
- Crescimento no card: latest vs o último registro de 30 dias atrás

## Valor no MetricCard

- Sempre mostrar `metricData.latest` (não muda com o filtro)
- O badge de crescimento muda conforme o filtro ativo

## Cache

- Atualizar os dados automaticamente a cada 10 minutos (hoje não tem refreshInterval no SWR)

## Arquivos afetados

- `hooks/use-chart-data.ts` — lógica de agrupamento (último valor, não soma; granularidade por período)
- `lib/utils.ts` — `calculateGrowth` precisa receber o período para comparar corretamente
- `lib/hooks/dashboard.ts` — adicionar `refreshInterval: 600000`
- `components/dashboard/metric-card.tsx` — passar `period` para `calculateGrowth`
