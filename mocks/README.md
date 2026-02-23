# Mock API Data

Este diretório contém exemplos de respostas JSON das APIs do backend.

## Arquivos

### 1. `dashboard.json`

**Endpoint:** `GET /api/dashboard`

Retorna métricas agregadas de todas as plataformas sociais (YouTube, Instagram, Spotify) para cada performer.

**Estrutura:**

- Dados por performer (MC Cabelinho, Poze do Rodo, Orochi, camping.viral)
- Dados totais agregados
- Histórico de métricas com timestamps
- Métricas incluem: followers, views, video_count, post_count, monthly_listeners

### 2. `spotify-tracks.json`

**Endpoint:** `GET /api/dashboard/spotify/tracks`

Retorna todas as tracks do Spotify com estatísticas de plays para cada performer.

**Estrutura:**

- Organizado por performer
- Cada track contém:
  - `id`: ID interno
  - `external_id`: Spotify URI
  - `name`: Nome da música
  - `artist_name`: Nome do artista
  - `thumbnail`: URL da capa
  - `plays`: Objeto com latest e histórico de plays

### 3. `music-catalog.json`

**Endpoint:** `GET /api/dashboard/songs`

Retorna o catálogo de músicas em produção/lançamento.

**Estrutura:**

- Array de músicas
- Cada música contém:
  - `status`: pending, recording, mixing, mastering, released
  - `type`: single, album_track, feat
  - `deadline`: Data limite
  - Timestamps de criação e atualização

### 4. `championships.json`

**Endpoint:** `GET /api/championships`

Retorna campeonatos/competições em andamento ou finalizados.

**Estrutura:**

- Array de campeonatos
- Cada campeonato contém:
  - Informações básicas (título, hashtag, datas)
  - Lista de contendores com scores (opcional)
  - Status calculado baseado nas datas (upcoming, active, completed)

## Uso

Estes arquivos podem ser usados para:

- Testes de desenvolvimento local
- Documentação da API
- Desenvolvimento offline
- Mock de dados em testes automatizados

## Autenticação

Todas as requisições reais requerem autenticação via Bearer token no header:

```
Authorization: Bearer {access_token}
```

O token é obtido através do endpoint de login e armazenado em cookie httpOnly.

## Notas

- Todos os timestamps estão em formato ISO 8601 UTC
- Os IDs externos do Spotify são URIs válidos do formato `spotify:track:{id}`
- As URLs de thumbnails são placeholders e devem apontar para o CDN do Spotify
- Os valores de plays, followers, etc. são exemplos realistas baseados em métricas típicas
