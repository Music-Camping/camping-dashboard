# Prettier

> Documentação obtida via Context7 MCP Server

## Descrição

Prettier é um formatador de código opinativo que impõe um estilo consistente ao analisar e reimprimir código com suas próprias regras, suportando uma ampla gama de linguagens e frameworks.

## Instalação

```bash
npm install prettier --save-dev
```

## Versão no Projeto

```json
"prettier": "^3.7.4",
"prettier-plugin-tailwindcss": "^0.7.2"
```

## Arquivos de Configuração

### .prettierrc (JSON)

```json
{
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "bracketSpacing": true,
  "arrowParens": "avoid"
}
```

### .prettierrc (YAML)

```yaml
printWidth: 100
tabWidth: 2
semi: true
singleQuote: true
trailingComma: es5
```

### prettier.config.js

```javascript
// .prettierrc.js ou prettier.config.js
export default {
  semi: false,
  singleQuote: true,
  trailingComma: "all",
  plugins: ["prettier-plugin-tailwindcss"],
  overrides: [
    {
      files: ["*.json", "*.jsonc"],
      options: {
        parser: "json",
        trailingComma: "none",
      },
    },
  ],
};
```

### package.json

```json
{
  "name": "my-project",
  "prettier": {
    "printWidth": 100,
    "singleQuote": true
  }
}
```

## Configuração do Projeto

```json
// .prettierrc.json
{
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "bracketSpacing": true,
  "arrowParens": "avoid"
}
```

## Opções Principais

| Opção            | Tipo    | Padrão   | Descrição                                         |
| ---------------- | ------- | -------- | ------------------------------------------------- |
| `printWidth`     | number  | 80       | Comprimento máximo da linha                       |
| `tabWidth`       | number  | 2        | Espaços por nível de indentação                   |
| `useTabs`        | boolean | false    | Usar tabs ao invés de espaços                     |
| `semi`           | boolean | true     | Adicionar ponto e vírgula                         |
| `singleQuote`    | boolean | false    | Usar aspas simples                                |
| `trailingComma`  | string  | "all"    | Vírgula no final ("es5", "none", "all")           |
| `bracketSpacing` | boolean | true     | Espaços em objetos literais                       |
| `arrowParens`    | string  | "always" | Parênteses em arrow functions ("always", "avoid") |
| `endOfLine`      | string  | "lf"     | Final de linha ("lf", "crlf", "cr", "auto")       |

## Usando Plugins

### Configuração JSON

```json
{
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

### Configuração JS

```javascript
export default {
  plugins: ["prettier-plugin-tailwindcss"],
};
```

## API Programática

```javascript
import * as prettier from "prettier";

const code = `function foo(){console.log("hello world")}`;
const formatted = await prettier.format(code, {
  semi: true,
  singleQuote: true,
  trailingComma: "all",
  printWidth: 80,
  tabWidth: 2,
  parser: "babel",
});

console.log(formatted);
// function foo() {
//   console.log('hello world');
// }
```

## Scripts no package.json

```json
{
  "scripts": {
    "format": "prettier --write \"{app,components,lib}/**/*.{js,jsx,ts,tsx,json,css,md,mdx}\"",
    "format:check": "prettier --check \"{app,components,lib}/**/*.{js,jsx,ts,tsx,json,css,md,mdx}\""
  }
}
```

## Comandos CLI

```bash
# Formatar arquivos
npx prettier --write .

# Verificar formatação (CI)
npx prettier --check .

# Formatar arquivo específico
npx prettier --write src/index.ts

# Ver diff sem alterar
npx prettier --check src/index.ts
```

## Integração com ESLint

O plugin `eslint-config-prettier` desabilita regras ESLint que conflitam com Prettier:

```javascript
// eslint.config.js
import prettier from "eslint-config-prettier";

export default [
  // ... outras configs
  prettier, // Deve ser o último
];
```

## .prettierignore

```
# Ignorar diretórios
node_modules
dist
build
.next

# Ignorar arquivos
pnpm-lock.yaml
package-lock.json

# Ignorar tipos de arquivo
*.min.js
*.min.css
```

## Links Úteis

- [Documentação Oficial](https://prettier.io/docs/en/)
- [GitHub](https://github.com/prettier/prettier)
- [Playground](https://prettier.io/playground/)
- [Opções](https://prettier.io/docs/en/options.html)
