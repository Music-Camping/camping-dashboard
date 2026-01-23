# Class Variance Authority (CVA)

> Documentação obtida via Context7 MCP Server

## Descrição

Class Variance Authority (CVA) simplifica a criação de variantes de componentes UI type-safe usando CSS tradicional, proporcionando uma alternativa ao CSS-in-TS para desenvolvedores que preferem controle total sobre stylesheets ou usam frameworks como Tailwind CSS.

## Instalação

```bash
npm install class-variance-authority
```

## Versão no Projeto

```json
"class-variance-authority": "^0.7.1"
```

## Uso Básico

### Criando Variantes de Botão

```typescript
// components/button.ts
import { cva } from "class-variance-authority";

const button = cva(["font-semibold", "border", "rounded"], {
  variants: {
    intent: {
      primary: ["bg-blue-500", "text-white", "border-transparent"],
      secondary: ["bg-white", "text-gray-800", "border-gray-400"],
    },
    size: {
      small: ["text-sm", "py-1", "px-2"],
      medium: ["text-base", "py-2", "px-4"],
    },
    disabled: {
      false: null,
      true: ["opacity-50", "cursor-not-allowed"],
    },
  },
  compoundVariants: [
    {
      intent: "primary",
      disabled: false,
      class: "hover:bg-blue-600",
    },
    {
      intent: "secondary",
      disabled: false,
      class: "hover:bg-gray-100",
    },
    {
      intent: "primary",
      size: "medium",
      class: "uppercase",
    },
  ],
  defaultVariants: {
    intent: "primary",
    size: "medium",
    disabled: false,
  },
});

// Uso
button();
// => "font-semibold border rounded bg-blue-500 text-white border-transparent text-base py-2 px-4 hover:bg-blue-600 uppercase"

button({ disabled: true });
// => "font-semibold border rounded bg-blue-500 text-white border-transparent text-base py-2 px-4 opacity-50 cursor-not-allowed uppercase"

button({ intent: "secondary", size: "small" });
// => "font-semibold border rounded bg-white text-gray-800 border-gray-400 text-sm py-1 px-2 hover:bg-gray-100"
```

## Conceitos Principais

### Variantes

Defina diferentes variações do componente:

```typescript
const button = cva("base-classes", {
  variants: {
    variant: {
      primary: "bg-blue-500 text-white",
      secondary: "bg-gray-200 text-gray-800",
      outline: "border border-gray-300 bg-transparent",
    },
  },
});
```

### Compound Variants

Aplique estilos quando múltiplas variantes são combinadas:

```typescript
const button = cva("base-classes", {
  variants: {
    intent: { primary: "...", secondary: "..." },
    size: { small: "...", large: "..." },
  },
  compoundVariants: [
    {
      intent: "primary",
      size: "large",
      class: "text-lg font-bold", // Aplicado quando intent=primary E size=large
    },
  ],
});
```

### Default Variants

Define valores padrão para variantes:

```typescript
const button = cva("base-classes", {
  variants: {
    intent: { primary: "...", secondary: "..." },
  },
  defaultVariants: {
    intent: "primary",
  },
});
```

### Adicionando Classes Customizadas

```typescript
import { cva } from "class-variance-authority";

const button = cva(/* … */);

button({ class: "m-4" });
// => "…buttonClasses m-4"

button({ className: "m-4" });
// => "…buttonClasses m-4"
```

## Integração com TypeScript

### Extraindo Tipos de Variantes

```typescript
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";

export type ButtonProps = VariantProps<typeof button>;
export const button = cva(/* … */);
```

### Componente React Tipado

```tsx
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md font-medium",
  {
    variants: {
      variant: {
        default: "bg-primary text-white",
        destructive: "bg-red-500 text-white",
        outline: "border border-input bg-transparent",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button
      className={buttonVariants({ variant, size, className })}
      {...props}
    />
  );
}
```

## Integração com tailwind-merge

Para resolver conflitos de classes Tailwind:

```typescript
import { cva, type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

const buttonVariants = cva(["your", "base", "classes"], {
  variants: {
    intent: {
      primary: ["your", "primary", "classes"],
    },
  },
  defaultVariants: {
    intent: "primary",
  },
});

export interface ButtonVariants extends VariantProps<typeof buttonVariants> {}

export const button = (variants: ButtonVariants) =>
  twMerge(buttonVariants(variants));
```

## Links Úteis

- [Documentação Oficial](https://cva.style/docs)
- [GitHub](https://github.com/joe-bell/cva)
- [Exemplos](https://cva.style/docs/examples)
