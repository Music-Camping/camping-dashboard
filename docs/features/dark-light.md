Aqui está a descrição atualizada:

**Implementação de Alternância de Tema (Dark/Light Mode)**

O sistema deve oferecer suporte para dois modos de visualização: modo claro e modo escuro. A funcionalidade deve ser implementada no Next.js 16 utilizando Shadcn/ui e Tailwind CSS com as seguintes características:

**Detecção Automática Inicial:**

- Ao acessar pela primeira vez, o sistema deve detectar e aplicar automaticamente a preferência de tema configurada no sistema operacional do usuário
- A preferência do usuário deve ser respeitada como estado inicial padrão

**Controle Manual:**

- Um botão alternador deve estar posicionado no header da aplicação, acessível em todas as páginas
- O botão permite ao usuário alternar manualmente entre os modos claro e escuro a qualquer momento
- A escolha manual do usuário deve sobrescrever a preferência do sistema

**Persistência:**

- A preferência selecionada manualmente pelo usuário deve ser salva localmente
- Em acessos subsequentes, o sistema deve carregar a última preferência escolhida pelo usuário

**Transição:**

- A mudança entre os modos deve ocorrer de forma suave e gradual, sem transições bruscas
- A aplicação de tema deve ser consistente em toda a interface utilizando as classes utilitárias do Tailwind CSS e os componentes do Shadcn/ui
