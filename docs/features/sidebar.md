# Feature: Sidebar Navigation

## Overview

Sidebar colapsável com navegação principal da aplicação.

## Requirements

### Must Have

- Título do projeto no topo da sidebar
- 3 itens de menu: Dashboard, Relatórios, Configurações
- Botão para colapsar/expandir a sidebar
- Modo expandido: mostrar ícone + texto
- Modo colapsado: mostrar apenas ícone
- Destacar o item da rota atual
- Manter estado (expandido/colapsado) entre sessões
- Use o sheet component do shadcn

### Nice to Have

- Animação suave na transição
- Versão mobile responsiva usando Sheet do shadcn/ui
- Tooltip nos ícones quando colapsada

## User Flow

1. Usuário vê sidebar expandida com título e menus
2. Click no botão de toggle
3. Sidebar colapsa mostrando só ícones
4. Click em qualquer item navega para a rota
5. Item da rota atual fica destacado
6. Estado persiste ao recarregar a página
