# TypeScript

> Documentação obtida via Context7 MCP Server

## Descrição

TypeScript é um superset de JavaScript que adiciona tipos estáticos, permitindo que desenvolvedores construam aplicações mais robustas e escaláveis com ferramentas aprimoradas e verificação de erros.

## Instalação

```bash
npm install typescript --save-dev
```

## Versão no Projeto

```json
"typescript": "^5"
```

## Inicialização

```bash
# Gerar tsconfig.json padrão
tsc --init
```

## Configuração (tsconfig.json)

### Exemplo Básico

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "noImplicitAny": true,
    "sourceMap": true
  }
}
```

### Configuração do Projeto

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

## Conceitos Principais

### Tipos Básicos

```typescript
// Primitivos
let name: string = "John";
let age: number = 30;
let isActive: boolean = true;

// Arrays
let numbers: number[] = [1, 2, 3];
let names: Array<string> = ["a", "b"];

// Tuplas
let tuple: [string, number] = ["hello", 10];

// Any (evitar)
let anything: any = "pode ser qualquer coisa";

// Unknown (mais seguro que any)
let unknown: unknown = 4;
```

### Interfaces

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  age?: number; // Opcional
  readonly createdAt: Date; // Somente leitura
}

const user: User = {
  id: 1,
  name: "John",
  email: "john@example.com",
  createdAt: new Date(),
};
```

### Types

```typescript
type ID = string | number;

type Point = {
  x: number;
  y: number;
};

type Status = "pending" | "approved" | "rejected";
```

### Generics

```typescript
// Função genérica
function identity<T>(arg: T): T {
  return arg;
}

let output = identity<string>("hello");

// Interface genérica
interface GenericIdentityFn<Type> {
  (arg: Type): Type;
}

function identityFn<Type>(arg: Type): Type {
  return arg;
}

let myIdentity: GenericIdentityFn<number> = identityFn;
```

### Generic Interface

```typescript
interface Backpack<Type> {
  add: (obj: Type) => void;
  get: () => Type;
}

declare const backpack: Backpack<string>;

const object = backpack.get(); // string
backpack.add("item"); // OK
// backpack.add(23); // Erro: number não é string
```

### Classes

```typescript
class Animal {
  private name: string;

  constructor(name: string) {
    this.name = name;
  }

  public move(distance: number = 0): void {
    console.log(`${this.name} moved ${distance}m.`);
  }
}

class Dog extends Animal {
  bark(): void {
    console.log("Woof!");
  }
}
```

### Union Types

```typescript
function printId(id: number | string) {
  if (typeof id === "string") {
    console.log(id.toUpperCase());
  } else {
    console.log(id);
  }
}
```

### Type Guards

```typescript
function isString(value: unknown): value is string {
  return typeof value === "string";
}

function example(value: unknown) {
  if (isString(value)) {
    // value é string aqui
    console.log(value.toUpperCase());
  }
}
```

### Utility Types

```typescript
interface Todo {
  title: string;
  description: string;
  completed: boolean;
}

// Partial - todas propriedades opcionais
type PartialTodo = Partial<Todo>;

// Required - todas propriedades obrigatórias
type RequiredTodo = Required<Todo>;

// Pick - seleciona propriedades
type TodoPreview = Pick<Todo, "title" | "completed">;

// Omit - omite propriedades
type TodoInfo = Omit<Todo, "completed">;

// Record
type PageInfo = Record<string, { title: string }>;

// Readonly
type ReadonlyTodo = Readonly<Todo>;
```

## Scripts no package.json

```json
{
  "scripts": {
    "type-check": "tsc --noEmit --pretty",
    "build": "tsc"
  }
}
```

## Comandos CLI

```bash
# Verificar tipos sem emitir arquivos
npx tsc --noEmit

# Compilar projeto
npx tsc

# Compilar em modo watch
npx tsc --watch

# Gerar tsconfig.json
npx tsc --init
```

## Opções Importantes do Compiler

| Opção                              | Descrição                               |
| ---------------------------------- | --------------------------------------- |
| `strict`                           | Habilita todas verificações estritas    |
| `noImplicitAny`                    | Erro em tipos `any` implícitos          |
| `strictNullChecks`                 | Verificações estritas de null/undefined |
| `noEmit`                           | Não gera arquivos de saída              |
| `esModuleInterop`                  | Interoperabilidade com módulos ES       |
| `skipLibCheck`                     | Pula verificação de .d.ts               |
| `forceConsistentCasingInFileNames` | Força consistência em nomes de arquivo  |

## Links Úteis

- [Documentação Oficial](https://www.typescriptlang.org/docs/)
- [GitHub](https://github.com/microsoft/TypeScript)
- [Playground](https://www.typescriptlang.org/play)
- [Handbook](https://www.typescriptlang.org/docs/handbook/)
