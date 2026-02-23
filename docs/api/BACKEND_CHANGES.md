# Mudanças do Backend - Dashboard API

**Data da última atualização:** 2026-02-12

## 📊 Endpoint Principal: `GET /api/dashboard`

### Estrutura da Resposta

A API retorna dados agrupados por performer, contendo métricas de múltiplas plataformas sociais.

```typescript
interface DashboardResponse {
  [performerName: string]: {
    youtube?: {
      followers: MetricData;
      views: MetricData;
      video_count: MetricData;
    };
    instagram?: {
      followers: MetricData;
      post_count: MetricData;
    };
    spotify?: {
      followers: MetricData;
      monthly_listeners: MetricData;
    };
  };
  total: {
    // Agregação de todos os performers
    youtube?: { ... };
    instagram?: { ... };
    spotify?: { ... };
  };
}

interface MetricData {
  latest: number;
  entries: Array<{
    value: number;
    datetime: string; // ISO 8601 timestamp
  }>;
}
```

### ✨ Novidades Adicionadas

#### 1. **Métricas do Spotify** (NOVO)

Agora o endpoint retorna dados do Spotify para cada performer:

- **`spotify.followers`**: Número de seguidores no Spotify
- **`spotify.monthly_listeners`**: Ouvintes mensais no Spotify

**Exemplo:**

```json
{
  "MC Cabelinho": {
    "spotify": {
      "followers": {
        "latest": 3440000,
        "entries": [
          {
            "value": 3200000,
            "datetime": "2026-01-06T18:33:01.352318+00:00"
          }
        ]
      },
      "monthly_listeners": {
        "latest": 13500000,
        "entries": [
          {
            "value": 12000000,
            "datetime": "2026-01-06T18:33:01.354329+00:00"
          }
        ]
      }
    }
  }
}
```

---

## 🎵 Novos Endpoints: Spotify Tracks

### `GET /api/dashboard/spotify/tracks`

Retorna faixas do Spotify com métricas de reprodução.

**Query Parameters:**

- `performer_name` (opcional): Filtrar por nome do performer

**Response:**

```typescript
interface SpotifyTracksResponse {
  [performerName: string]: Array<{
    track_id: string;
    track_name: string;
    play_count: number;
    recorded_at: string;
  }>;
}
```

---

### `GET /api/dashboard/spotify/top-tracks`

Retorna as top tracks ordenadas por número de reproduções.

**Query Parameters:**

- `limit` (opcional, padrão: 10, máx: 50): Número de tracks

**Response:**

```typescript
interface TopTracksResponse {
  tracks: Array<{
    track_id: string;
    track_name: string;
    performer_name: string;
    play_count: number;
    recorded_at: string;
  }>;
}
```

---

## 📝 Novos Endpoints: Song Registrations

### `POST /api/dashboard/songs`

Cria um novo registro de música.

**Request Body:**

```typescript
interface CreateSongRequest {
  name: string; // Nome da música (obrigatório)
  status: string; // Status (ex: "pending", "approved", "rejected")
  type?: string; // Tipo da música (opcional)
  deadline?: string; // Prazo em ISO 8601 (opcional)
}
```

**Response:**

```typescript
interface SongRegistration {
  id: number;
  name: string;
  status: string;
  type: string | null;
  deadline: string | null;
  created_at: string;
  updated_at: string;
}
```

**Exemplo:**

```bash
curl -X POST /api/dashboard/songs \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Vida Loka Parte 3",
    "status": "pending",
    "type": "single",
    "deadline": "2026-03-15T00:00:00Z"
  }'
```

---

### `GET /api/dashboard/songs`

Lista todos os registros de músicas.

**Response:**

```typescript
interface SongRegistration {
  id: number;
  name: string;
  status: string;
  type: string | null;
  deadline: string | null;
  created_at: string;
  updated_at: string;
}
[];
```

---

## 🗄️ Mudanças no Banco de Dados

### Novas Tabelas Criadas

#### 1. `dashboard.metrics`

Armazena métricas genéricas do dashboard.

```sql
CREATE TABLE dashboard.metrics (
    id bigint generated always as identity primary key,
    name text not null,
    value bigint not null,
    recorded_at timestamptz not null default now()
);
```

**Uso:** Armazena métricas agregadas como `spotify_followers`, `spotify_monthly_listeners`, etc.

---

#### 2. `dashboard.song_registrations`

Gerencia registros de músicas.

```sql
CREATE TABLE dashboard.song_registrations (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT,
    status TEXT NOT NULL,
    deadline TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

#### 3. `dashboard.refresh_tokens`

Armazena tokens de refresh para autenticação.

```sql
CREATE TABLE dashboard.refresh_tokens (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES dashboard.users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    revoked BOOLEAN NOT NULL DEFAULT FALSE,
    user_agent TEXT,
    ip TEXT
);
```

---

## 🔐 Autenticação

Todos os endpoints requerem **Bearer Token** no header:

```http
Authorization: Bearer <jwt_token>
```

---

## 📊 Frequência de Atualização

- **Dados sociais (YouTube, Instagram, Spotify)**: Atualizados a cada **3 horas**
- **Song registrations**: Real-time (CRUD direto no banco)

---

## ⚠️ Breaking Changes

Nenhuma breaking change. Apenas **adições** aos endpoints existentes:

- Campo `spotify` adicionado à resposta do `/api/dashboard`
- Novos endpoints para Spotify tracks e song registrations

---

## 📌 Próximos Passos (Front-end)

1. ✅ Atualizar interface TypeScript para incluir `spotify` no `DashboardResponse`
2. ✅ Adicionar componentes para exibir métricas do Spotify
3. ✅ Implementar UI para gerenciar Song Registrations
4. ✅ Considerar migração para Server Components (dados atualizados a cada 3h)
5. ✅ Remover SWR se migrar para SSR

---

## 📝 Exemplo Completo de Resposta

```json
{
  "MC Cabelinho": {
    "youtube": {
      "followers": { "latest": 5300000, "entries": [...] },
      "views": { "latest": 2800000000, "entries": [...] },
      "video_count": { "latest": 450, "entries": [...] }
    },
    "instagram": {
      "followers": { "latest": 8500000, "entries": [...] },
      "post_count": { "latest": 1200, "entries": [...] }
    },
    "spotify": {
      "followers": { "latest": 3440000, "entries": [...] },
      "monthly_listeners": { "latest": 13500000, "entries": [...] }
    }
  },
  "Poze do Rodo": {
    "youtube": { ... },
    "instagram": { ... },
    "spotify": { ... }
  },
  "total": {
    "youtube": { ... },
    "instagram": { ... },
    "spotify": { ... }
  }
}
```
