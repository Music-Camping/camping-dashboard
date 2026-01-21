# Husky

> Documentação obtida via Context7 MCP Server

## Descrição

Husky é uma ferramenta moderna e ultra-rápida para Git hooks que aprimora seus commits automatizando linting de mensagens de commit e execução de testes.

## Instalação

```bash
npm install husky --save-dev
```

## Versão no Projeto

```json
"husky": "^9.1.7"
```

## Inicialização

```bash
# Instalar husky
npm install --save-dev husky

# Inicializar husky (cria diretório .husky/ e hook pre-commit)
npx husky init

# Isso cria:
# - .husky/ diretório
# - .husky/pre-commit arquivo com "npm test"
# - Atualiza package.json com "prepare": "husky"
```

## Estrutura Criada

```
.husky/
├── _/
│   └── husky.sh
├── pre-commit
├── commit-msg
└── pre-push
```

## Criando Hooks

### Pre-commit (Linter)

```bash
# Criar hook pre-commit que executa linter
echo "npm run lint" > .husky/pre-commit
```

### Commit-msg (Validação de Mensagem)

```bash
# Criar hook commit-msg para validar formato
echo "npx commitlint --edit \$1" > .husky/commit-msg
```

### Pre-push (Testes)

```bash
# Criar hook pre-push que executa testes
echo "npm test" > .husky/pre-push
```

## Comandos CLI

```bash
# Verificar status do husky
npx husky
# Output: "" (vazio = sucesso)

# Verificar configuração Git
git config core.hooksPath
# Output: .husky/_

# Listar hooks instalados
ls -la .husky/
```

## Configuração no package.json

```json
{
  "scripts": {
    "prepare": "husky",
    "precommit": "lint-staged",
    "prepush": "npm run type-check && npm run lint"
  }
}
```

## Integração com lint-staged

O `lint-staged` executa linters apenas em arquivos staged:

```json
// package.json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md}": ["prettier --write"]
  }
}
```

### Hook pre-commit com lint-staged

```bash
# .husky/pre-commit
npx lint-staged
```

## Integração com Commitlint

```bash
# Instalar commitlint
npm install @commitlint/cli @commitlint/config-conventional --save-dev
```

```javascript
// commitlint.config.js
export default {
  extends: ["@commitlint/config-conventional"],
};
```

```bash
# .husky/commit-msg
npx commitlint --edit $1
```

## Projetos em Subdiretório

Quando o projeto não está na raiz do repositório Git:

```json
// package.json
{
  "scripts": {
    "prepare": "cd .. && husky frontend/.husky"
  }
}
```

```bash
# frontend/.husky/pre-commit
cd frontend
npm test
```

## Exemplo Completo de Hooks

### .husky/pre-commit

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
```

### .husky/commit-msg

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx --no -- commitlint --edit "$1"
```

### .husky/pre-push

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npm run type-check
npm run lint
npm test
```

## Ignorando Hooks Temporariamente

```bash
# Ignorar pre-commit (não recomendado)
git commit --no-verify -m "mensagem"

# Ignorar pre-push (não recomendado)
git push --no-verify
```

## Troubleshooting

### Hook não está executando

```bash
# Verificar se hooks estão configurados
git config core.hooksPath

# Reinstalar husky
rm -rf .husky
npx husky init
```

### Permissões no Linux/Mac

```bash
# Tornar hooks executáveis
chmod +x .husky/*
```

## Links Úteis

- [Documentação Oficial](https://typicode.github.io/husky/)
- [GitHub](https://github.com/typicode/husky)
- [lint-staged](https://github.com/okonet/lint-staged)
- [commitlint](https://commitlint.js.org/)
