# PRD: Autenticação - Plataforma Camping

> **Status:** Implementado (UI) | **Última atualização:** 2026-02-03

## 1. Visão Geral

**Objetivo:** Permitir que usuários acessem suas contas de forma segura e rápida.

**Contexto:** Primeira tela de contato do usuário com a plataforma de campeonatos. Deve transmitir confiança, agilidade e a identidade visual competitiva do Camping.

### Páginas Implementadas

| Rota               | Status       | Descrição                    |
| ------------------ | ------------ | ---------------------------- |
| `/login`           | Implementado | Tela de login com validação  |
| `/forgot-password` | Implementado | Tela de recuperação de senha |

---

## 2. Requisitos Funcionais

| Funcionalidade              | Descrição                                |
| --------------------------- | ---------------------------------------- |
| **Campo de Email**          | Entrada para e-mail do usuário           |
| **Campo de Senha**          | Entrada para senha (mascarada)           |
| **Lembrar de mim**          | Checkbox para manter sessão ativa        |
| **Botão Entrar**            | Submete o formulário                     |
| **Esqueci minha senha**     | Link para recuperação de senha           |
| **Validação em tempo real** | Feedback imediato ao usuário sobre erros |
| **Estado de Loading**       | Indicador visual durante envio           |

---

## 3. Layout e Design

- **Tela dedicada** sem sidebar ou header do dashboard
- **Card centralizado** contendo o formulário
- **Logo Camping** acima do formulário
- **Título "CAMPING"** com fonte Montserrat (identidade visual)
- **Tema:** Segue o padrão dark/light da plataforma

---

## 4. Mensagens de Validação

| Campo | Regra               | Mensagem de Erro                           |
| ----- | ------------------- | ------------------------------------------ |
| Email | Formato válido      | "Insira um e-mail válido"                  |
| Senha | Mínimo 6 caracteres | "A senha deve ter pelo menos 6 caracteres" |

---

## 5. Fluxo do Usuário

1. Usuário acessa `/login`
2. Visualiza logo e formulário centralizado
3. Preenche e-mail e senha
4. (Opcional) Marca "Lembrar de mim"
5. Clica em "Entrar"
6. **Se válido:** Dados são enviados para autenticação
7. **Se inválido:** Mensagens de erro aparecem nos campos
8. **Se erro de API:** Notificação toast aparece

---

## 6. Links e Navegação

| Elemento              | Destino            |
| --------------------- | ------------------ |
| "Esqueci minha senha" | `/forgot-password` |
| Login bem-sucedido    | `/` (Dashboard)    |

---

## 7. Estados da Interface

| Estado                | Comportamento                                  |
| --------------------- | ---------------------------------------------- |
| **Inicial**           | Campos vazios, botão habilitado                |
| **Erro de validação** | Campos com borda vermelha + mensagem           |
| **Loading**           | Botão desabilitado + indicador de carregamento |
| **Erro de API**       | Toast com mensagem de erro                     |

---

## 8. Tela de Recuperação de Senha

### Requisitos Funcionais

| Funcionalidade              | Descrição                                |
| --------------------------- | ---------------------------------------- |
| **Campo de Email**          | Entrada para e-mail do usuário           |
| **Botão Enviar**            | Submete a solicitação de recuperação     |
| **Validação em tempo real** | Feedback imediato ao usuário sobre erros |
| **Toast de sucesso**        | Notificação confirmando envio do e-mail  |
| **Link voltar**             | Retorna para a tela de login             |

### Fluxo do Usuário

1. Usuário clica em "Esqueci minha senha" na tela de login
2. É redirecionado para `/forgot-password`
3. Preenche o e-mail
4. Clica em "Enviar"
5. **Se válido:** Toast de sucesso aparece
6. **Se inválido:** Mensagem de erro no campo
7. Pode clicar em "Voltar para o login"

---

## 9. Arquivos Implementados

```
app/
├── (auth)/
│   ├── login/
│   │   └── page.tsx          # Tela de login
│   └── forgot-password/
│       └── page.tsx          # Tela de recuperação
└── (dashboard)/
    └── layout.tsx            # Layout com sidebar

components/ui/
├── checkbox.tsx              # Componente de checkbox
└── sonner.tsx                # Componente de toast
```

---

## 10. Próximos Passos

- [ ] Integrar com API de autenticação
- [ ] Implementar lógica de "Lembrar de mim"
- [ ] Implementar envio real de e-mail de recuperação
- [ ] Criar tela de redefinição de senha (`/reset-password`)
