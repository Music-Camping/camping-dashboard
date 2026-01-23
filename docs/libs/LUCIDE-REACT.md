# Lucide React

> Documentação obtida via Context7 MCP Server

## Descrição

Lucide React fornece componentes React totalmente tipados para ícones Lucide que renderizam como SVGs inline otimizados, com suporte para customização via props e tree-shaking automático.

## Instalação

```bash
npm install lucide-react
```

## Versão no Projeto

```json
"lucide-react": "^0.562.0"
```

## Uso Básico

### Importando e Usando Ícones

```jsx
import { Camera } from "lucide-react";

const App = () => {
  return <Camera color="red" size={48} />;
};

export default App;
```

### Props de Customização

Os ícones aceitam atributos SVG padrão como props:

```jsx
import { Camera } from "lucide-react";

const App = () => {
  return <Camera size={48} fill="red" />;
};
```

## Props Disponíveis

| Prop          | Tipo               | Padrão         | Descrição                         |
| ------------- | ------------------ | -------------- | --------------------------------- |
| `size`        | `number \| string` | `24`           | Tamanho do ícone (width e height) |
| `color`       | `string`           | `currentColor` | Cor do stroke                     |
| `strokeWidth` | `number \| string` | `2`            | Espessura do stroke               |
| `fill`        | `string`           | `none`         | Cor de preenchimento              |
| `className`   | `string`           | -              | Classes CSS adicionais            |

## Exemplos de Uso

### Ícones em Botões

```jsx
import { Download, Upload, Trash2 } from "lucide-react";

function ActionButtons() {
  return (
    <div className="flex gap-2">
      <button className="flex items-center gap-2">
        <Download size={16} />
        Download
      </button>
      <button className="flex items-center gap-2">
        <Upload size={16} />
        Upload
      </button>
      <button className="flex items-center gap-2 text-red-500">
        <Trash2 size={16} />
        Delete
      </button>
    </div>
  );
}
```

### Ícones com Tailwind CSS

```jsx
import { Menu, X, Search, User } from "lucide-react";

function Header() {
  return (
    <header className="flex items-center justify-between p-4">
      <Menu className="h-6 w-6 cursor-pointer text-gray-600 hover:text-gray-900" />
      <div className="flex items-center gap-4">
        <Search className="h-5 w-5 text-gray-400" />
        <User className="h-6 w-6 text-gray-600" />
      </div>
    </header>
  );
}
```

### Ícones Dinâmicos

```jsx
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

function Accordion({ title, children }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between"
      >
        {title}
        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>
      {isOpen && <div>{children}</div>}
    </div>
  );
}
```

## Tree Shaking

O Lucide React suporta tree-shaking automático, garantindo que apenas os ícones que você realmente usa sejam incluídos no bundle final do seu projeto.

```jsx
// Apenas Camera e Home serão incluídos no bundle
import { Camera, Home } from "lucide-react";
```

## Ícones Populares

| Ícone       | Import                                       |
| ----------- | -------------------------------------------- |
| Menu        | `import { Menu } from 'lucide-react'`        |
| X (Close)   | `import { X } from 'lucide-react'`           |
| Search      | `import { Search } from 'lucide-react'`      |
| User        | `import { User } from 'lucide-react'`        |
| Settings    | `import { Settings } from 'lucide-react'`    |
| Home        | `import { Home } from 'lucide-react'`        |
| ChevronDown | `import { ChevronDown } from 'lucide-react'` |
| Check       | `import { Check } from 'lucide-react'`       |
| Plus        | `import { Plus } from 'lucide-react'`        |
| Trash2      | `import { Trash2 } from 'lucide-react'`      |

## Links Úteis

- [Lucide Icons](https://lucide.dev)
- [Documentação Lucide React](https://lucide.dev/guide/packages/lucide-react)
- [GitHub](https://github.com/lucide-icons/lucide)
- [Buscar Ícones](https://lucide.dev/icons)
