# ESLint

> Documentação obtida via Context7 MCP Server

## Descrição

ESLint é um utilitário de linting plugável para JavaScript e JSX, projetado para identificar e relatar padrões encontrados em código ECMAScript/JavaScript, garantindo qualidade e consistência do código.

## Instalação

```bash
npm install eslint --save-dev
```

## Versão no Projeto

```json
"eslint": "8.57.1",
"@typescript-eslint/eslint-plugin": "^7.18.0",
"@typescript-eslint/parser": "^7.18.0"
```

## Configuração Flat (eslint.config.js)

O ESLint 9+ utiliza o novo formato de configuração "flat":

### Configuração Básica

```javascript
// eslint.config.js
import { defineConfig, globalIgnores } from "eslint/config";
import js from "@eslint/js";

export default defineConfig([
  // Configuração base recomendada
  js.configs.recommended,

  // Ignores globais
  globalIgnores(["dist/**", "build/**", "node_modules/**"]),

  // Configuração para arquivos JavaScript
  {
    name: "app-javascript",
    files: ["src/**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        console: "readonly",
        process: "readonly",
      },
    },
    rules: {
      "no-console": "warn",
      "prefer-const": "error",
      "no-var": "error",
      eqeqeq: ["error", "always"],
    },
  },

  // Arquivos de teste com regras relaxadas
  {
    name: "test-files",
    files: ["test/**/*.js", "**/*.test.js"],
    rules: {
      "no-console": "off",
    },
  },
]);
```

### Usando Plugins

```javascript
// eslint.config.js
import { defineConfig } from "eslint/config";
import jsdoc from "eslint-plugin-jsdoc";

export default defineConfig([
  {
    files: ["**/*.js"],
    plugins: {
      jsdoc: jsdoc,
    },
    rules: {
      "jsdoc/require-description": "error",
      "jsdoc/check-values": "error",
    },
  },
]);
```

### Plugin npm

```js
// eslint.config.js
import example from "eslint-plugin-example";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    plugins: {
      example,
    },
    rules: {
      "example/rule1": "warn",
    },
  },
]);
```

### Usando Configuração Recomendada de Plugin

```js
import { defineConfig } from "eslint/config";
import example from "eslint-plugin-example";

export default defineConfig([
  {
    files: ["**/*.js", "**/*.cjs", "**/*.mjs"],
    plugins: {
      example,
    },
    extends: ["example/recommended"],
    rules: {
      "example/rule1": "warn",
    },
  },
]);
```

### Regras Locais Customizadas

```javascript
// eslint.config.js
import { defineConfig } from "eslint/config";
import myRule from "./rules/my-rule.js";

export default defineConfig([
  {
    plugins: {
      local: {
        rules: {
          "my-rule": myRule,
        },
      },
    },
    rules: {
      "local/my-rule": ["error"],
    },
  },
]);
```

## Plugins Usados no Projeto

| Plugin                             | Descrição                                    |
| ---------------------------------- | -------------------------------------------- |
| `@typescript-eslint/eslint-plugin` | Regras para TypeScript                       |
| `@typescript-eslint/parser`        | Parser TypeScript para ESLint                |
| `eslint-config-airbnb`             | Guia de estilo Airbnb                        |
| `eslint-config-airbnb-typescript`  | Airbnb com suporte TypeScript                |
| `eslint-config-prettier`           | Desabilita regras que conflitam com Prettier |
| `eslint-plugin-import`             | Regras para imports ES6+                     |
| `eslint-plugin-jsx-a11y`           | Regras de acessibilidade JSX                 |
| `eslint-plugin-react`              | Regras específicas React                     |
| `eslint-plugin-react-hooks`        | Regras para React Hooks                      |
| `eslint-plugin-simple-import-sort` | Ordenação de imports                         |
| `eslint-plugin-unused-imports`     | Remove imports não utilizados                |
| `eslint-plugin-prettier`           | Executa Prettier como regra ESLint           |

## Níveis de Severidade

| Valor            | Significado         |
| ---------------- | ------------------- |
| `"off"` ou `0`   | Desabilita a regra  |
| `"warn"` ou `1`  | Aviso (não falha)   |
| `"error"` ou `2` | Erro (falha o lint) |

## Scripts no package.json

```json
{
  "scripts": {
    "lint": "eslint \"{app,components,lib}/**/*.{js,jsx,ts,tsx}\" --max-warnings=10",
    "lint:fix": "eslint \"{app,components,lib}/**/*.{js,jsx,ts,tsx}\" --fix"
  }
}
```

## Comandos CLI

```bash
# Executar lint
npx eslint .

# Corrigir automaticamente
npx eslint . --fix

# Lint em arquivos específicos
npx eslint src/**/*.ts

# Mostrar configuração usada
npx eslint --print-config file.js
```

## Links Úteis

- [Documentação Oficial](https://eslint.org/docs/latest/)
- [GitHub](https://github.com/eslint/eslint)
- [Regras](https://eslint.org/docs/latest/rules/)
- [Configuração Flat](https://eslint.org/docs/latest/use/configure/configuration-files-new)
