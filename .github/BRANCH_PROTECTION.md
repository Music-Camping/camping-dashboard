# Branch Protection Rules - Configuração Manual no GitHub

Este documento descreve as regras de proteção de branch que devem ser configuradas manualmente no GitHub para garantir o Git Flow completo.

## 📋 Configuração Necessária

### 1. Branch `main` (Produção)

**Settings → Branches → Add rule → Branch name pattern: `main`**

#### Regras obrigatórias:

- ✅ **Require a pull request before merging**
  - Require approvals: `1` (ou mais conforme necessário)
  - Dismiss stale pull request approvals when new commits are pushed: `✅`
  - Require review from Code Owners: `✅` (se tiver CODEOWNERS)
- ✅ **Require status checks to pass before merging**
  - Require branches to be up to date before merging: `✅`
  - Status checks obrigatórias:
    - `🔍 Lint & Format Check`
    - `📝 Type Check`
    - `🏗️ Build Application`
    - `🔒 Security Audit`
- ✅ **Require conversation resolution before merging**: `✅`
- ✅ **Require signed commits**: `✅` (opcional, mas recomendado)
- ✅ **Do not allow bypassing the above settings**: `✅`
- ✅ **Restrict who can push to matching branches**: Adicione apenas admins

### 2. Branch `dev` (Desenvolvimento)

**Settings → Branches → Add rule → Branch name pattern: `dev`**

#### Regras recomendadas:

- ✅ **Require a pull request before merging**
  - Require approvals: `1`
  - Dismiss stale pull request approvals when new commits are pushed: `✅`
- ✅ **Require status checks to pass before merging**
  - Require branches to be up to date before merging: `✅`
  - Status checks obrigatórias:
    - `🔍 Lint & Format Check`
    - `📝 Type Check`
    - `🏗️ Build Application`
- ✅ **Require conversation resolution before merging**: `✅`
- ⚠️ **Do not allow bypassing the above settings**: `❌` (permitir bypass para hotfixes)

### 3. Branch Pattern `feature/**`

**Settings → Branches → Add rule → Branch name pattern: `feature/**`\*\*

#### Regras recomendadas:

- ✅ **Require status checks to pass before merging**
  - Status checks obrigatórias:
    - `🔍 Lint & Format Check`
    - `📝 Type Check`
- ⚠️ **Do not allow bypassing the above settings**: `❌`

## 🔄 Fluxo de Trabalho

### Feature Branch → dev

1. Criar branch: `git checkout -b feature/nome-da-feature dev`
2. Desenvolver e commitar (commits semânticos obrigatórios)
3. Push: `git push -u origin feature/nome-da-feature`
4. Criar PR de `feature/nome-da-feature` para `dev`
5. CI roda automaticamente e valida:
   - ✅ Lint & Format
   - ✅ Type Check
   - ✅ Build
   - ✅ Security Audit
   - ✅ Commitlint (valida commits)
6. Após aprovação e merge → código vai para `dev`

### dev → main (Release)

1. Criar PR de `dev` para `main`
2. CI roda todas as validações
3. Após aprovação e merge → deploy automático para produção

### Hotfix → main

1. Criar branch: `git checkout -b hotfix/nome-do-fix main`
2. Corrigir bug
3. Criar PR de `hotfix/nome-do-fix` para `main`
4. Após merge → deploy automático para produção
5. Merge de volta para `dev`: `git checkout dev && git merge main`

## ✅ Checklist de Configuração

- [ ] Configurar branch protection para `main`
- [ ] Configurar branch protection para `dev`
- [ ] Configurar branch protection para `feature/**`
- [ ] Adicionar CODEOWNERS (opcional)
- [ ] Configurar secrets no GitHub:
  - [ ] `VERCEL_TOKEN`
  - [ ] `VERCEL_ORG_ID`
  - [ ] `VERCEL_PROJECT_ID`
  - [ ] `NEXT_PUBLIC_API_URL` (se necessário)

## 📝 Notas

- As branch protection rules são configuradas no GitHub UI, não via código
- O CI já está configurado para rodar automaticamente em PRs
- O deploy automático só acontece após merge em `main`
- Commits devem seguir o padrão semântico (validado pelo commitlint)
