# Feature: Charts Dashboard

## Overview

Sistema de visualização de métricas através de gráficos interativos na página principal do dashboard, exibindo dados diários agregados por rede social, com filtro por performer no header.

**Contexto de uso:** Dashboard para exibição em TV - layout otimizado para visualização à distância, sem necessidade de scroll, todas as informações visíveis simultaneamente.

## Tech Stack

- **Recharts** - Biblioteca de gráficos React
- **date-fns** - Formatação e manipulação de datas (locale pt-BR)

## Estrutura da API

**Endpoint:** `GET /api/dashboard`

**Response:** Objeto com performers individuais + chave `total` agregada

**Performers disponíveis:** Chaves dinâmicas (ex: "MC Cabelinho", "Poze do Rodo")

**Métricas por plataforma:**

| Plataforma | Métrica     | Descrição              |
| ---------- | ----------- | ---------------------- |
| YouTube    | followers   | Inscritos no canal     |
| YouTube    | views       | Total de visualizações |
| YouTube    | video_count | Quantidade de vídeos   |
| Instagram  | followers   | Seguidores             |
| Instagram  | post_count  | Quantidade de posts    |

**Estrutura de cada métrica:**

- `latest`: Valor mais recente (número)
- `entries`: Array de histórico com `value`, `datetime` (ISO 8601), e `performer` (opcional, presente no total)

**Cálculo de crescimento:** Comparação do valor atual com o valor do dia anterior

**Chave `total`:** Já vem agregada da API com entries de todos os performers identificados pelo campo `performer`

## Requirements

### Must Have

- Gráficos de linha/área diários
- Exibição agregada por rede social (YouTube e Instagram separados)
- Integração com filtro de performer no header (multi-select)
- Paleta de cores consistente com o tema do sistema (CSS variables chart-1 a chart-5)
- Responsividade para diferentes tamanhos de tela
- Suporte a dark/light mode
- Tooltip interativo com valores formatados em pt-BR
- Formatação de números grandes (K para milhares, M para milhões)

### Nice to Have

- Animação suave ao carregar dados
- Zoom/pan nos gráficos
- Export de dados (CSV/PNG)
- Comparação de períodos anteriores

## User Flow

1. Usuário acessa dashboard
2. Gráficos carregam com dados de todos os performers (padrão)
3. Usuário pode filtrar performers no header (multi-select dropdown)
4. Filtro de período (Hoje/7d/30d) atualiza granularidade dos dados
5. Hover sobre pontos mostra tooltip com detalhes
6. Dados são agregados automaticamente para todas as redes

## Componentes

### MetricsChart (novo)

Componente principal do gráfico localizado em `/components/dashboard/metrics-chart.tsx`

**Estilo Visual (baseado na referência):**

- AreaChart com linha sólida e preenchimento gradiente suave abaixo (opacidade decrescente)
- Fundo limpo, minimalista
- Sem grid vertical
- Linha horizontal pontilhada sutil como referência
- Curva suave e contínua (não angular)

**Eixos:**

- Eixo Y: valores formatados (K, M) alinhados à esquerda, fonte pequena, cor muted
- Eixo X: datas formatadas (dd MMM) nos extremos e pontos relevantes, cor muted
- Sem linhas de eixo visíveis (axisLine: false)
- Sem ticks visíveis (tickLine: false)

**Interação (Tooltip):**

- Tooltip escuro (dark card) aparece no hover
- Mostra: data completa, valor formatado, percentual de variação (verde/vermelho)
- Ponto destacado (dot) no local do hover
- Linha vertical pontilhada do ponto até o eixo X
- Marcador "Today" ou data atual destacada no eixo X

**Características técnicas:**

- ResponsiveContainer (100% width, altura fixa)
- Curvas suaves (type="monotone")
- Tratamento de valores nulos (connectNulls)
- Linha única (sempre agregado, sem legenda de múltiplos performers)

### Filtro de Performer (Header)

Atualização do componente `/components/app-header.tsx`

**Mudanças:**

- Profile filter atual → Performer filter (multi-select)
- Checkbox para selecionar todos ou performers específicos
- Dropdown com lista de performers disponíveis da API

**Comportamento:**

- Filtro afeta quais performers são incluídos na agregação
- Gráficos sempre exibem linha única agregada (soma dos performers selecionados)
- Cards de métricas mostram valores separados por performer + card de total
- Nenhum selecionado: Comporta como todos selecionados

## Layout do Dashboard

### Contexto: TV Display

- Layout otimizado para telas grandes (TV)
- Sem scroll - todas as informações visíveis simultaneamente
- Tipografia legível à distância
- Densidade de informação balanceada

### Estrutura da Página

1. **Cards de Métricas por Rede** (topo)
   - Agregação por rede social (YouTube e Instagram separados)
   - YouTube: Seguidores, Views, Vídeos
   - Instagram: Seguidores, Posts
   - Indicador de crescimento: comparação com dia anterior
   - Layout compacto em grid para caber na tela

2. **Gráficos de Evolução por Rede**
   - Grid de 2 colunas
   - YouTube: Evolução de Inscritos
   - Instagram: Evolução de Seguidores
   - Filtro "Hoje": exibe gráfico com apenas o ponto de hoje
   - Filtro "7d"/"30d": exibe evolução no período

**Extensibilidade futura:** Estrutura preparada para adicionar novos gráficos (Views, Vídeos, Listeners, etc.) conforme necessidade

### Considerações para TV

- Altura total deve caber em 1080p ou 4K sem scroll
- Cards e gráficos proporcionais ao espaço disponível
- Cores com bom contraste para visualização à distância
- Fonte mínima adequada para leitura em TV

## Paleta de Cores

Usar CSS variables do tema existente para consistência com dark/light mode:

- chart-1: Roxo claro (linha principal)
- chart-2: Roxo médio
- chart-3: Roxo escuro
- chart-4: Azul-roxo
- chart-5: Azul escuro

## Arquivos a Criar

1. `/components/dashboard/metrics-chart.tsx` - Componente principal do gráfico
2. `/hooks/use-chart-data.ts` - Hook para processamento e agregação de dados
3. `/components/dashboard/chart-tooltip.tsx` - Tooltip customizado

## Arquivos a Modificar

1. `/components/app-header.tsx` - Filtro de performer multi-select
2. `/hooks/use-filters.tsx` - Adicionar state para performers selecionados
3. `/lib/types/filters.ts` - Adicionar tipos para performer filter
4. `/lib/utils.ts` - Adicionar formatCompactNumber
5. `/app/page.tsx` - Layout com gráficos

## Wireframe (Layout TV - sem scroll)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Header: [Período: 7d] [Performers: Todos ▼]                  [Theme Toggle] │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  YOUTUBE                                    INSTAGRAM                       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐    ┌──────────┐ ┌──────────┐       │
│  │  8.45M   │ │    2B    │ │   137    │    │  14.8M   │ │   500    │       │
│  │Inscritos │ │  Views   │ │ Vídeos   │    │Seguidores│ │  Posts   │       │
│  │ ▲ 1.2%  │ │ ▲ 0.5%  │ │ ▲ 2     │    │ ▲ 1.1%  │ │ ▲ 5     │       │
│  └──────────┘ └──────────┘ └──────────┘    └──────────┘ └──────────┘       │
│                                                                             │
│  ┌────────────────────────────────┐  ┌────────────────────────────────┐    │
│  │ Inscritos (YouTube)            │  │ Seguidores (Instagram)         │    │
│  │ 10M                            │  │ 15M                            │    │
│  │                    ╭───────●   │  │                      ╭─────●   │    │
│  │ 8M─ ─ ─ ─ ─ ─ ─╭───╯─ ─ ─ ─:   │  │ 14M─ ─ ─ ─ ─ ─ ─╭───╯─ ─ ─:   │    │
│  │            ╭───╯░░░░░░░░░░░:   │  │             ╭───╯░░░░░░░░░░:   │    │
│  │ 6M────────╯░░░░░░░░░░░░░░░░:   │  │ 13M────────╯░░░░░░░░░░░░░░░:   │    │
│  │     22 Jan              Today  │  │     22 Jan              Today  │    │
│  └────────────────────────────────┘  └────────────────────────────────┘    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

Legenda:
░ = Área com gradiente
─ = Linha horizontal pontilhada de referência
: = Linha vertical pontilhada no hover
● = Ponto destacado no hover

Extensível: Novos gráficos (Views, Vídeos, Listeners) podem ser adicionados no grid
```

## Acceptance Criteria

- [ ] Gráficos renderizam corretamente com dados da API
- [ ] Filtro de performer funciona (multi-select)
- [ ] Filtro de período atualiza dados exibidos
- [ ] Tooltip mostra valores corretos em pt-BR
- [ ] Dark/light mode funcionam corretamente
- [ ] Layout cabe em tela de TV (1080p) sem scroll
- [ ] Performance adequada (< 100ms para render)
- [ ] Métricas separadas por rede (YouTube / Instagram)
- [ ] Crescimento calculado comparando com dia anterior
- [ ] Dados são diários (granularidade dia)

## Riscos e Mitigações

| Risco                    | Impacto        | Mitigação                                  |
| ------------------------ | -------------- | ------------------------------------------ |
| Muitos pontos no gráfico | Performance    | Limitar a 30 pontos, agregar se necessário |
| Dados faltantes          | UX             | Usar connectNulls no Recharts              |
| Cores não acessíveis     | Acessibilidade | Testar contraste, adicionar padrões        |

## References

- [Recharts Documentation](https://recharts.org/en-US)
- [date-fns Documentation](https://date-fns.org/)
- Design reference: Figma (https://www.figma.com/design/7CKxnQQOGElCxX1tFQezHt/camping-viral)
- Estilo visual de referência: `/docs/images/image.png`
