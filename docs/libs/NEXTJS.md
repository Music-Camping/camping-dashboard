# Next.js

> Documentação obtida via Context7 MCP Server

## Descrição

Next.js é um framework React para construir aplicações web full-stack. Ele fornece recursos adicionais e otimizações, configurando automaticamente ferramentas de baixo nível para ajudar desenvolvedores a focar na construção de produtos rapidamente.

## Instalação

```bash
npm install next react react-dom
```

## Versão no Projeto

```json
"next": "16.1.1"
```

## Conceitos Principais

### App Router

O Next.js utiliza o App Router como sistema de roteamento baseado em sistema de arquivos. Cada pasta representa um segmento de rota e arquivos especiais como `page.tsx` e `layout.tsx` definem a UI.

### Server Components

Por padrão, componentes no App Router são Server Components, permitindo buscar dados diretamente no servidor:

```tsx
// app/page.tsx - Server Component por padrão
async function getProjects() {
  const res = await fetch(`https://...`, { cache: "no-store" });
  const projects = await res.json();
  return projects;
}

export default async function Dashboard() {
  const projects = await getProjects();

  return (
    <ul>
      {projects.map((project) => (
        <li key={project.id}>{project.name}</li>
      ))}
    </ul>
  );
}
```

### Data Fetching

O Next.js oferece diferentes estratégias de busca de dados:

```tsx
export default async function Page() {
  // Dados estáticos (cache padrão)
  const staticData = await fetch(`https://...`, { cache: "force-cache" });

  // Dados dinâmicos (sem cache)
  const dynamicData = await fetch(`https://...`, { cache: "no-store" });

  // Dados revalidados a cada 10 segundos
  const revalidatedData = await fetch(`https://...`, {
    next: { revalidate: 10 },
  });

  return <div>...</div>;
}
```

### Rotas Dinâmicas

Crie rotas dinâmicas usando colchetes no nome da pasta:

```tsx
// app/blog/[slug]/page.tsx
export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);

  return (
    <div>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
    </div>
  );
}
```

### Client Components

Para componentes interativos, use a diretiva `'use client'`:

```tsx
"use client";

import { useState } from "react";

export default function Counter() {
  const [count, setCount] = useState(0);

  return <button onClick={() => setCount(count + 1)}>Count: {count}</button>;
}
```

### Combinando Server e Client Components

```tsx
// app/page.tsx (Server Component)
import HomePage from "./home-page";

async function getPosts() {
  const res = await fetch("https://...");
  const posts = await res.json();
  return posts;
}

export default async function Page() {
  const recentPosts = await getPosts();
  return <HomePage recentPosts={recentPosts} />;
}
```

## Estrutura de Arquivos

```
app/
├── layout.tsx      # Layout raiz
├── page.tsx        # Página inicial (/)
├── blog/
│   ├── page.tsx    # /blog
│   └── [slug]/
│       └── page.tsx # /blog/:slug
└── api/
    └── route.ts    # API Route
```

## Configuração

```ts
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // suas configurações aqui
};

export default nextConfig;
```

## Links Úteis

- [Documentação Oficial](https://nextjs.org/docs)
- [GitHub](https://github.com/vercel/next.js)
- [Learn Next.js](https://nextjs.org/learn)
