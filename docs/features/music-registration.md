# Feature: Página de Registro de Músicas (`/musicas`)

## Overview

Página dedicada ao gerenciamento do catálogo de músicas. Substitui a presença da tabela no Dashboard, centralizando visualização e cadastro em uma rota dedicada, acessível pela sidebar.

---

## Navegação

- **Item na Sidebar:** "Músicas" com ícone `Music2Icon`
- **URL:** `/musicas`
- **Removidos da sidebar:** Relatórios, Configurações

---

## Componentes

### 1. `RegisterMusicForm` (`components/musicas/register-music-form.tsx`)

Formulário de cadastro de nova música usando **React Hook Form** + **Zod**.

#### Schema Zod

```ts
z.object({
  name: z.string().min(1), // obrigatório
  status: z.enum(["pending", "recording", "mixing", "mastering", "released"]), // obrigatório
  type: z.enum(["single", "album_track", "feat"]).optional(), // opcional
  deadline: z.string().optional(), // opcional (date input → ISO)
});
```

#### Campos

| Campo    | Tipo        | Obrigatório | Componente | Enum/Valores                                    |
| -------- | ----------- | ----------- | ---------- | ----------------------------------------------- |
| name     | text        | ✅          | Input      | —                                               |
| status   | enum select | ✅          | Select     | pending, recording, mixing, mastering, released |
| type     | enum select | ❌          | Select     | single, album_track, feat                       |
| deadline | date        | ❌          | Input date | —                                               |

#### Comportamento

- `defaultValues.status = "pending"`
- On submit: POST `/api/proxy/api/dashboard/songs`
- Sucesso: toast de confirmação + reset do form + `mutate()` no SWR para atualizar a tabela
- Erro: toast de erro

---

### 2. `MusicTable` (`components/dashboard/music-catalog/music-table.tsx`)

Tabela existente (movida do Dashboard). Mantém:

- Busca global (`globalFilter`)
- Toggle de blur (modo privado)
- Controle de visibilidade de colunas
- Paginação
- Ordenação por coluna

---

## Página (`app/(dashboard)/musicas/page.tsx`)

```
/musicas
├── RegisterMusicForm   ← cadastro via formulário
└── MusicTable          ← listagem com busca/filtro/blur
```

Layout: `flex flex-col gap-6`, client component que consome `useMusicCatalog()` (SWR).

---

## API

| Método | Endpoint                             | Descrição         |
| ------ | ------------------------------------ | ----------------- |
| GET    | `/api/proxy/api/dashboard/songs`     | Listar músicas    |
| POST   | `/api/proxy/api/dashboard/songs`     | Criar nova música |
| DELETE | `/api/proxy/api/dashboard/songs/:id` | Excluir música    |
| PATCH  | `/api/proxy/api/dashboard/songs/:id` | Atualizar música  |

O proxy em `app/api/proxy/[...path]/route.ts` suporta GET, POST, DELETE e PATCH, repassando o token de autenticação.

---

## Tipos (`lib/types/music-catalog.ts`)

```ts
type SongStatus = "pending" | "recording" | "mixing" | "mastering" | "released";
type SongType = "single" | "album_track" | "feat";

const STATUS_LABELS: Record<SongStatus, string>; // labels em PT-BR
const TYPE_LABELS: Record<SongType, string>; // labels em PT-BR
```

---

## User Flow

1. Usuário acessa `/musicas` via sidebar ("Músicas")
2. Vê tabela de músicas com busca, paginação e modo privado (blur)
3. Preenche o formulário de cadastro no topo da página:
   - Nome (obrigatório)
   - Status via Select (obrigatório, padrão: Pendente)
   - Tipo via Select (opcional)
   - Prazo via date picker (opcional)
4. Clica em "Cadastrar Música"
5. Toast de sucesso → tabela revalida e exibe a nova música
6. Em caso de erro → toast de erro

---

## Mudanças em outros arquivos

| Arquivo                                     | Mudança                                             |
| ------------------------------------------- | --------------------------------------------------- |
| `components/sidebar.tsx`                    | Remove Relatórios e Configurações; adiciona Músicas |
| `components/dashboard/dashboard-client.tsx` | Remove `MusicTable` e `useMusicCatalog`             |
| `app/api/proxy/[...path]/route.ts`          | Adiciona handlers DELETE e PATCH                    |
