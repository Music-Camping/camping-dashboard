# Feature: Header

## Overview

Header fixo no topo da aplicação que se ajusta dinamicamente conforme a sidebar expande/colapsa, contendo filtros de período e rede social.

## Requirements

### Must Have

- Fixo no topo, ao lado direito da sidebar
- Ajustar largura automaticamente quando sidebar colapsa/expande
- Filtros de período: Hoje, 7d, 30d
- Filtro de profile ( user pode ter varios profiles vinculados, entao um profile pode ter multiplas redes, entao poderemos filtrar esses perfis)
- Design baseado no Figma: https://www.figma.com/design/7CKxnQQOGElCxX1tFQezHt/camping-viral?node-id=2-2630&t=UFxCXHqT81zEXcDY-0
- Usar componentes do shadcn/ui

### Nice to Have

- Animação suave ao ajustar largura
- Filtro de período customizado (date picker)
- Multi-seleção de redes sociais
- Indicador visual de filtros ativos

## User Flow

1. Usuário vê header no topo com filtros
2. Sidebar colapsa → header expande para ocupar espaço
3. Sidebar expande → header diminui
4. Click em filtro de período (Hoje/7d/30d) → atualiza dados
5. Click em filtro de rede perfil → filtra por perfil
6. Filtros selecionados ficam destacados
