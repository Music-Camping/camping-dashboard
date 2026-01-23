# Tailwind CSS

> Documentação obtida via Context7 MCP Server

## Descrição

Tailwind CSS é um framework CSS utility-first para construir rapidamente interfaces de usuário personalizadas. Ele funciona escaneando todos os seus arquivos HTML, componentes JavaScript e outros templates para nomes de classes, gerando os estilos correspondentes e escrevendo-os em um arquivo CSS estático.

## Instalação

```bash
npm install tailwindcss @tailwindcss/postcss
```

## Versão no Projeto

```json
"tailwindcss": "^4",
"@tailwindcss/postcss": "^4"
```

## Conceitos Principais

### Classes Utilitárias

Tailwind fornece classes utilitárias de baixo nível que permitem construir designs completamente customizados:

```html
<!doctype html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link href="./output.css" rel="stylesheet" />
  </head>
  <body>
    <h1 class="text-3xl font-bold underline">Hello world!</h1>
  </body>
</html>
```

### Design Responsivo

Use prefixos de breakpoint para aplicar estilos condicionalmente:

```html
<div class="grid grid-cols-2 sm:grid-cols-3">
  <!-- 2 colunas por padrão, 3 colunas em telas sm e maiores -->
</div>
```

#### Breakpoints Padrão

| Prefixo | Largura Mínima |
| ------- | -------------- |
| `sm`    | 640px          |
| `md`    | 768px          |
| `lg`    | 1024px         |
| `xl`    | 1280px         |
| `2xl`   | 1536px         |

### Dark Mode

Use o prefixo `dark:` para estilos específicos do modo escuro:

```html
<div
  class="rounded-lg bg-white px-6 py-8 shadow-xl ring ring-gray-900/5 dark:bg-gray-800"
>
  <h3
    class="mt-5 text-base font-medium tracking-tight text-gray-900 dark:text-white"
  >
    Writes upside-down
  </h3>
  <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
    The Zero Gravity Pen can be used to write in any orientation, including
    upside-down. It even works in outer space.
  </p>
</div>
```

### Estados (Hover, Focus, etc.)

```html
<button
  class="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
>
  Button
</button>

<input class="border focus:border-blue-500 focus:ring-2 focus:ring-blue-200" />
```

### Flexbox e Grid

```html
<!-- Flexbox -->
<div class="flex items-center justify-between gap-4">
  <div>Item 1</div>
  <div>Item 2</div>
</div>

<!-- Grid -->
<div class="grid grid-cols-3 gap-4">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>
```

### Espaçamento

```html
<!-- Padding -->
<div class="p-4">Padding em todos os lados</div>
<div class="px-4 py-2">Padding horizontal e vertical</div>

<!-- Margin -->
<div class="m-4">Margin em todos os lados</div>
<div class="mt-4 mb-2">Margin top e bottom</div>

<!-- Gap (para flex/grid) -->
<div class="flex gap-4">...</div>
```

### Cores Arbitrárias

```html
<div class="bg-[#1da1f2] text-[#fff]">
  Cor personalizada usando valor arbitrário
</div>
```

## Configuração

### tailwind.config.ts

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1da1f2",
      },
    },
  },
  plugins: [],
};

export default config;
```

### postcss.config.mjs

```js
export default {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
```

## Classes Comuns

| Categoria   | Exemplos                              |
| ----------- | ------------------------------------- |
| Layout      | `flex`, `grid`, `block`, `hidden`     |
| Espaçamento | `p-4`, `m-2`, `gap-4`, `space-x-2`    |
| Tamanho     | `w-full`, `h-screen`, `max-w-lg`      |
| Tipografia  | `text-lg`, `font-bold`, `text-center` |
| Cores       | `bg-blue-500`, `text-gray-900`        |
| Bordas      | `border`, `rounded-lg`, `ring-2`      |
| Sombras     | `shadow-md`, `shadow-lg`              |
| Transições  | `transition`, `duration-300`          |

## Links Úteis

- [Documentação Oficial](https://tailwindcss.com/docs)
- [GitHub](https://github.com/tailwindlabs/tailwindcss)
- [Tailwind Play](https://play.tailwindcss.com)
