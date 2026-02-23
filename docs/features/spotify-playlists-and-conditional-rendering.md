# Spotify Playlist Section & Conditional Platform Rendering

## Contexto

### Seção de Playlists

O Spotify distingue dois tipos de perfil: **artista** (followers, monthly listeners, track rankings) e **playlist** (followers da playlist, track count, músicas). Um performer pode ter um ou outro, ou ambos. Hoje o dashboard não exibe seção de playlists.

Um performer pode ter múltiplas playlists vinculadas. A nova seção exibe as playlists de forma estática (sem rotação por ora), com métricas de followers e track count, gráfico de evolução de followers por período, e uma scroll area com as músicas atualmente presentes em cada playlist.

Os dados de playlist virão na mesma rota `/api/dashboard`, como campo `spotify_playlists` dentro de cada `PerformerData` (irmão de `spotify`, `youtube`, `instagram`).

### Renderização condicional

Atualmente todos os performers aparecem nos breakdowns de todas as plataformas, mesmo sem dados (valor 0). Performers só devem aparecer numa seção se tiverem dados reais para aquela métrica. Exemplo: um performer vinculado apenas a playlists não deve aparecer no breakdown de Artistas do Spotify, nem no de YouTube ou Instagram.

**Em produção, atualmente nenhum performer tem `spotify_playlists` no retorno da API — portanto a seção de Playlists não deve renderizar nada.**

---

## Formato real da API (dashboard route)

`spotify_playlists` é um campo de nível raiz em cada performer (não aninhado dentro de `spotify`):

```json
{
  "total": { ... },
  "PerformerA": {
    "spotify": {
      "followers": { "latest": 1000, "entries": [...] },
      "monthly_listeners": { "latest": 50000, "entries": [...] }
    },
    "spotify_playlists": [
      {
        "name": "Nome da Playlist",
        "thumbnail_url": "https://...",
        "followers": {
          "latest": 5000,
          "entries": [
            { "value": 4800, "datetime": "2026-02-20T12:00:00Z" },
            { "value": 5000, "datetime": "2026-02-21T12:00:00Z" }
          ]
        },
        "track_count": {
          "latest": 12,
          "entries": [
            { "value": 11, "datetime": "2026-02-20T12:00:00Z" },
            { "value": 12, "datetime": "2026-02-21T12:00:00Z" }
          ]
        },
        "tracks": [
          { "name": "Nome da Faixa", "thumbnail_url": "https://...", "play_count": "1234" }
        ]
      }
    ]
  },
  "PerformerB": {
    "spotify_playlists": [ ... ]
  }
}
```

Performers sem artista Spotify não terão o bloco `spotify`. Performers sem playlists não terão `spotify_playlists`. **Se nenhum performer tiver `spotify_playlists`, a seção inteira não renderiza — nem no layout normal, nem no modo TV.**

---

## Seção de Playlists — comportamento esperado (layout normal)

### Layout geral

Nova seção no `SpotifyHub`, após a seção de Artistas (se existir), separada por `<Separator>`, com título "Playlists". Só é renderizada se pelo menos um performer tiver `spotify_playlists` com pelo menos uma playlist.

### Estrutura por performer

Para cada performer que tem `spotify_playlists`:

- Cabeçalho com nome do performer (tag verde, igual ao `AnimatedTopTracks`)
- Para cada playlist do performer, em ordem:
  - Nome da playlist + thumbnail
  - **Dois MetricCards lado a lado**:
    - Followers da playlist: `playlist.followers.latest` + badge de crescimento via `calculateGrowth(playlist.followers.entries, period)`
    - Faixas na playlist: `playlist.track_count.latest` + badge de crescimento via `calculateGrowth(playlist.track_count.entries, period)`
  - **Gráfico**: evolução de followers da playlist (usa `buildChartPoints(playlist.followers.entries, period)` — last-value-per-bucket, mesma lógica do `useChartData`)
  - **ScrollArea**: músicas da playlist (`playlist.tracks`) — thumbnail + nome + `play_count` formatado (parseInt antes de formatar)

### Filtragem por período

O gráfico e os badges de crescimento respondem ao filtro ativo (`period`), mesma lógica de followers e ouvintes mensais.

### TODO — múltiplas playlists

A implementação atual renderiza todas as playlists de um performer em sequência (estático). No futuro, quando houver múltiplas playlists por performer, considerar adicionar rotação/carrossel entre elas (similar ao `AnimatedTopTracks`) para não sobrecarregar visualmente a seção.

---

## Seção de Playlists — modo TV (apresentação)

O modo TV em `dashboard-client.tsx` tem layout completamente separado do `SpotifyHub` — ele renderiza o conteúdo de cada performer diretamente no JSX, sem usar `SpotifyHub`. Portanto, a seção de playlists precisa ser adicionada **também** no bloco TV.

### Posicionamento no TV mode

No TV mode, para cada performer (que rotaciona automaticamente), o bloco do Spotify exibe:

- Esquerda: header + métricas (seguidores + ouvintes mensais) + gráficos + (se tiver playlists) métricas de playlist
- Direita: top 3 rankings (se artista) ou lista de tracks da playlist (se apenas playlist)

### Regras de exibição no TV mode

- Se o performer **tem dados de artista** (`spotify?.followers`): mostra seguidores, ouvintes mensais, gráficos e top 3 tracks (comportamento atual)
- Se o performer **tem playlists** (`spotify_playlists?.length > 0`): adiciona sub-bloco de playlists abaixo das métricas de artista (ou no lugar delas, se não tiver artista)
- Se o performer **não tem nem artista nem playlist**: oculta o bloco Spotify inteiro no TV mode

### Layout playlist no TV mode (compacto)

Para cada playlist do `currentPerformer` (ler de `initialData[currentPerformer].spotify_playlists`):

- Nome da playlist
- Dois valores compactos inline (igual ao estilo atual dos blocos de métricas TV):
  - `Seguidores: X`
  - `Faixas: Y`
- Sem gráfico de playlist no TV mode (espaço insuficiente)
- Sem scroll area de tracks no TV mode (espaço insuficiente)

---

## Renderização condicional — regra por seção

Um performer só aparece no breakdown de uma métrica se tiver `latest > 0`.

| Seção                        | Condição para incluir performer no breakdown |
| ---------------------------- | -------------------------------------------- |
| YouTube — Inscritos          | `youtube?.followers?.latest > 0`             |
| YouTube — Views              | `youtube?.views?.latest > 0`                 |
| YouTube — Vídeos             | `youtube?.video_count?.latest > 0`           |
| Instagram — Seguidores       | `instagram?.followers?.latest > 0`           |
| Instagram — Posts            | `instagram?.post_count?.latest > 0`          |
| Spotify — Seguidores Artista | `spotify?.followers?.latest > 0`             |
| Spotify — Ouvintes Mensais   | `spotify?.monthly_listeners?.latest > 0`     |

### Ocultação de seções inteiras no `dashboard-client.tsx`

- Nenhum performer tem YouTube → não renderizar `YouTubeSection` (layout normal e não relevante no TV mode pois já mostra "—")
- Nenhum performer tem Instagram → não renderizar `InstagramSection`
- Para Spotify: renderizar `SpotifyHub` se pelo menos um performer tiver `spotify` **ou** `spotify_playlists`
  - Sub-seção Artistas só aparece se houver performers com dados de artista (`spotify?.followers`)
  - Sub-seção Playlists só aparece se houver performers com `spotify_playlists`

---

## Novos tipos

### `lib/types/dashboard.ts`

```typescript
export interface SpotifyPlaylistTrack {
  name: string;
  thumbnail_url?: string;
  play_count: string; // string no payload da API — converter com parseInt() ao exibir
}

export interface SpotifyPlaylistData {
  name: string;
  thumbnail_url?: string;
  followers: MetricData;
  track_count: MetricData;
  tracks: SpotifyPlaylistTrack[];
}

// Adicionar em PerformerData:
// spotify_playlists?: SpotifyPlaylistData[];
```

`PlaylistData` em `lib/types/spotify.ts` pode ser removida (não usada após essa feature).

---

## Arquivos afetados

- `lib/types/dashboard.ts` — adicionar `SpotifyPlaylistTrack`, `SpotifyPlaylistData`, campo `spotify_playlists` em `PerformerData`
- `lib/types/spotify.ts` — remover `PlaylistData` (não mais usada); remover `playlists` de `SpotifyMetrics`
- `hooks/use-chart-data.ts` — exportar `buildChartPoints(entries, period)` como função utilitária reutilizável (extrai a lógica de bucketing do `useChartData`)
- `components/dashboard/spotify/spotify-hub.tsx` — adicionar seção Playlists; filtrar breakdown de artistas por performers com dados; condicionar sub-seções artista e playlist
- `components/dashboard/spotify/playlist-section.tsx` — **novo componente** estático: itera performers → playlists, renderizando tag do performer, dois MetricCards, gráfico de followers e scroll area de tracks por playlist
- `components/dashboard/spotify/playlist-comparison.tsx` — atualizar import de `PlaylistData` → `SpotifyPlaylistData` e campo `monthlyListeners` → `followers.latest`
- `components/dashboard/metric-card-breakdown.tsx` — filtrar `breakdown` items com `value === 0` antes de renderizar
- `components/dashboard/social-platforms/youtube-section.tsx` — sem mudança de código (visibilidade controlada pelo dashboard-client)
- `components/dashboard/social-platforms/instagram-section.tsx` — sem mudança de código (visibilidade controlada pelo dashboard-client)
- `components/dashboard/dashboard-client.tsx` — (1) ocultar `YouTubeSection` e `InstagramSection` quando sem dados; (2) adicionar bloco de playlists no layout TV mode para o `currentPerformer`
