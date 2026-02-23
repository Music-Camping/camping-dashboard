# PRD - Autenticacao do Dashboard Next.js

## Contexto

O dashboard Next.js consome uma API FastAPI que ja tem autenticacao implementada. O frontend precisa ter uma tela de login e proteger o acesso ao dashboard.

## Endpoint de Login

- **Rota:** `POST /auth/login`
- **Body:**

```json
{
  "email": "string",
  "password": "string"
}
```

- **Resposta (200):**

```json
{
  "access_token": "eyJ...",
  "token_type": "bearer",
  "expires_in": 900,
  "refresh_token": "wPZl...",
  "refresh_expires_in": 604800
}
```

- **Rate limit:** 10 tentativas por minuto
- **Erro (401):** `{ "detail": "Invalid credentials" }`

## Como funciona a auth no backend

- O `access_token` e um JWT que expira em 15 minutos
- O `refresh_token` e uma string opaca que expira em 7 dias (nao tem endpoint de refresh ainda)
- Todas as rotas do dashboard (`/api/dashboard`) exigem o header `Authorization: Bearer <access_token>`
- Se o token for invalido ou expirado, o backend retorna `401 { "detail": "Invalid or expired token" }`

## Endpoint do Dashboard

- **Rota:** `GET /api/dashboard`
- **Header obrigatorio:** `Authorization: Bearer <access_token>`
- **Resposta:** JSON com metricas agrupadas por performer e plataforma (YouTube, Instagram, Spotify, TikTok)

## Fluxo esperado no frontend

1. Usuario acessa o dashboard (`/`)
2. Se nao estiver logado, redireciona para `/login`
3. Na tela de login, preenche email e senha no formulario e submete
4. O frontend faz `POST /auth/login` com as credenciais
5. Se o login for bem-sucedido, armazena o `access_token` e redireciona para `/`
6. Todas as requests para a API incluem o header `Authorization: Bearer <access_token>`
7. Se qualquer request retornar 401, redireciona para `/login`

## Regras

- A tela de login (`/login`) e a unica rota publica
- O dashboard (`/`) e todas as outras rotas so podem ser acessadas com usuario logado
- O formulario de login deve ter campos de email e senha
- Mostrar mensagem de erro se as credenciais forem invalidas
- A API roda em `http://localhost:8000`

## Credenciais de teste (seed)

- **Email:** `admin@camping.com`
- **Senha:** `admin123`
