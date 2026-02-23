Entendido. Com base na sua estrutura de **Performers** e nas novas funcionalidades de gestão de registros e integração de campeonatos, aqui está a **PRP (Product Requirements & Plan)** atualizada.

Este documento foi desenhado para que, ao ser lido pelo Claude Code ou por você, a lógica de componentes e fluxos de dados esteja cristalina.

---

## 📄 PRP: Dashboard de Performance & Gestão de Catálogo (v2.1)

### 1. Arquitetura de Dados: Performers

A aplicação deve iterar sobre o objeto de performers. Cada conta selecionada filtra globalmente os dados de redes sociais, músicas e campeonatos.

### 2. Seção Spotify (O "Carro-Chefe")

Esta seção deve ser dividida em duas visões (Perfil vs. Playlists) para evitar poluição visual.

- **Top 3 Ranking (Animated Cards):**
- Uso de **framer-motion** para entrada em cascata.
- Cards com `thumbnail` do performer e destaque para a Track.
- Indicadores de subida/descida no ranking.

- **Visualização de Métricas:**
- **Gráfico A:** `Monthly Listeners` (Ouvintes Mensais) do Artista (Linha/Área).
- **Gráfico B:** Comparativo de `Monthly Listeners` das Playlists onde o performer está inserido (Barras Agrupadas).

- **Imagens:** Uso obrigatório das fotos de perfil e capas de álbuns vindas da API para humanizar o dado.

### 3. Gestão de Músicas (Tabela de Registros)

Um CRUD funcional integrado à tabela de dados.

- **Funcionalidades de Tabela:**
- **Blur Mode (Dados Sensíveis):** Toggle "Modo Privado" que aplica um `backdrop-filter: blur(8px)` nas colunas de receita ou dados de contrato.
- **Ações de Linha:** Ícones laterais para **Editar** e **Apagar**.
- **Criação:** Botão "Novo Registro" acima do header da tabela.

- **Filtros:** Persistência dos filtros atuais (Data, Gênero, Status).

### 4. Integração de Campeonatos (`/api/championships`)

Interface de acompanhamento de competições.

| Categoria    | Descrição                                       |
| ------------ | ----------------------------------------------- |
| **Ativos**   | Campeonatos em andamento com badges de "Live".  |
| **Upcoming** | Próximos eventos (contagem regressiva ou data). |
| **Geral**    | Histórico de participações.                     |

---

### 5. Hierarquia Visual e Fluxo de Redes

A ordem de exibição das seções deve ser:

1. **Header:** Seletor de Performer + Thumbnail Grande do Artista.
2. **Spotify Hub:** Rankings animados → Gráficos de Performance → Performance em Playlists.
3. **YouTube/TikTok:** Cards de métricas gerais (Followers, Views, Likes).
4. **Seção de Músicas:** Tabela com CRUD e Blur Mode.
5. **Campeonatos:** Grid de cards com status (Active/Upcoming).
6. **Discord:** Métricas de comunidade (Membros online/total).

---

### 6. Especificações para Implementação (Claude Code)

> **Instrução de UI/UX:**
> "Claude, ao implementar o Spotify Hub, agrupe os dados de 'Perfil' e 'Playlist' em abas ou em um grid de 2 colunas. Para o **Blur Mode** na tabela, utilize uma variável de estado `isSensitiveDataVisible`. Se `false`, aplique a classe CSS de blur nas colunas específicas. Nos cards de Top 3, use gradientes baseados nas cores da thumbnail do artista para gerar um efeito de glassmorphism."

---

### 7. O core do dash esta bom

1. dividr por ordem de rede
   spotify
   instagram
   tiktok
   youtube
   campeonatos
   e tabela registro de musicas

2. nao tem endpoint pra discord
