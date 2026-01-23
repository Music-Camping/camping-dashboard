# Tailwind Merge

> Documentação obtida via Context7 MCP Server

## Descrição

Tailwind Merge é uma função utilitária para mesclar classes Tailwind CSS em JavaScript de forma eficiente, sem conflitos de estilo. Suporta navegadores modernos e versões Node com tipagem completa.

## Instalação

```bash
npm install tailwind-merge
```

## Versão no Projeto

```json
"tailwind-merge": "^3.4.0"
```

## Uso Básico

### Mesclando Classes

```typescript
import { twMerge } from "tailwind-merge";

twMerge("px-2 py-1 bg-red hover:bg-dark-red", "p-3 bg-[#B91C1C]");
// → 'hover:bg-dark-red p-3 bg-[#B91C1C]'
```

### Resolução de Conflitos

A última classe sempre vence:

```typescript
twMerge("p-5 p-2 p-4"); // → 'p-4'
```

## Caso de Uso Principal

O uso principal do `twMerge` é mesclar classes padrão de um componente com classes fornecidas externamente via prop `className`:

```jsx
import { twMerge } from "tailwind-merge";

function MyGenericInput(props) {
  // props.className pode sobrescrever classes conflitantes
  const className = twMerge("border rounded px-2 py-1", props.className);
  return <input {...props} className={className} />;
}

// Uso
<MyGenericInput className="p-3" />;
// O padding será p-3, não px-2 py-1
```

## Exemplos Avançados

### Componente com Estados Condicionais

```jsx
import { twMerge } from "tailwind-merge";

function MyComponent({ forceHover, disabled, isMuted, className }) {
  return (
    <div
      className={twMerge(
        TYPOGRAPHY_STYLES_LABEL_SMALL,
        "grid w-max gap-2",
        forceHover
          ? "bg-gray-200"
          : ["bg-white", !disabled && "hover:bg-gray-200"],
        isMuted && "text-gray-600",
        className,
      )}
    >
      {/* More code… */}
    </div>
  );
}
```

### Com Arrays de Classes

```typescript
twMerge(["px-2", "py-1"], "p-3");
// → 'p-3'
```

### Valores Condicionais

```typescript
twMerge(
  "base-class",
  isActive && "active-class",
  isDisabled && "disabled-class",
);
```

## Como Funciona

O `twMerge` entende a semântica das classes Tailwind:

1. **Detecta conflitos**: Sabe que `p-3` conflita com `px-2 py-1`
2. **Mantém classes não-conflitantes**: `hover:bg-dark-red` é preservado
3. **Última classe vence**: Classes posteriores têm precedência

```typescript
// Exemplo de resolução
twMerge("px-2 py-1 bg-red hover:bg-dark-red", "p-3 bg-[#B91C1C]");

// Processo:
// - px-2 py-1 conflita com p-3 → p-3 vence
// - bg-red conflita com bg-[#B91C1C] → bg-[#B91C1C] vence
// - hover:bg-dark-red não conflita → mantido

// Resultado: 'hover:bg-dark-red p-3 bg-[#B91C1C]'
```

## Integração com CVA

```typescript
import { cva, type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

const buttonVariants = cva("base-classes", {
  variants: {
    variant: {
      primary: "bg-blue-500 text-white",
      secondary: "bg-gray-200 text-gray-800",
    },
  },
  defaultVariants: {
    variant: "primary",
  },
});

// Wrapper que usa twMerge
export function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(inputs.filter(Boolean).join(' '));
}

// Uso em componente
function Button({ variant, className, ...props }) {
  return (
    <button
      className={cn(buttonVariants({ variant }), className)}
      {...props}
    />
  );
}
```

## Função `cn` Helper

Padrão comum em projetos com shadcn/ui:

```typescript
// lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

## Quando Usar

| Cenário                                  | Usar twMerge?        |
| ---------------------------------------- | -------------------- |
| Componentes que aceitam `className` prop | ✅ Sim               |
| Classes estáticas sem override           | ❌ Não necessário    |
| Estilos condicionais que podem conflitar | ✅ Sim               |
| Performance crítica                      | ⚠️ Use com moderação |

## Links Úteis

- [GitHub](https://github.com/dcastil/tailwind-merge)
- [Documentação](https://github.com/dcastil/tailwind-merge/blob/main/docs/README.md)
- [API Reference](https://github.com/dcastil/tailwind-merge/blob/main/docs/api-reference.md)
