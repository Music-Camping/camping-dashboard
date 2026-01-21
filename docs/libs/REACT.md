# React

> Documentação obtida via Context7 MCP Server

## Descrição

React é uma biblioteca JavaScript para construir interfaces de usuário. Permite criar aplicações web e nativas interativas usando componentes reutilizáveis, possibilitando desenvolvimento de UI eficiente e escalável.

## Instalação

```bash
npm install react react-dom
```

## Versão no Projeto

```json
"react": "19.2.3",
"react-dom": "19.2.3"
```

## Conceitos Principais

### Componentes Funcionais

```jsx
function Welcome({ name }) {
  return <h1>Hello, {name}</h1>;
}
```

### useState Hook

Gerencia estado local em componentes funcionais:

```jsx
import { useState } from "react";

function SearchableVideoList({ videos }) {
  const [searchText, setSearchText] = useState("");
  const foundVideos = filterVideos(videos, searchText);

  return (
    <>
      <SearchInput
        value={searchText}
        onChange={(newText) => setSearchText(newText)}
      />
      <VideoList
        videos={foundVideos}
        emptyHeading={`No matches for "${searchText}"`}
      />
    </>
  );
}
```

### Múltiplos Estados

```jsx
import { useState } from "react";

export default function Gallery() {
  const [index, setIndex] = useState(0);
  const [showMore, setShowMore] = useState(false);

  function handleNextClick() {
    setIndex(index + 1);
  }

  function handleMoreClick() {
    setShowMore(!showMore);
  }

  let sculpture = sculptureList[index];

  return (
    <>
      <button onClick={handleNextClick}>Next</button>
      <h2>
        <i>{sculpture.name}</i> by {sculpture.artist}
      </h2>
      <button onClick={handleMoreClick}>
        {showMore ? "Hide" : "Show"} details
      </button>
      {showMore && <p>{sculpture.description}</p>}
      <img src={sculpture.url} alt={sculpture.alt} />
    </>
  );
}
```

### Formulários

```jsx
import { useState } from "react";

export default function Form() {
  const [isSent, setIsSent] = useState(false);
  const [message, setMessage] = useState("Hi!");

  if (isSent) {
    return <h1>Your message is on its way!</h1>;
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setIsSent(true);
        sendMessage(message);
      }}
    >
      <textarea
        placeholder="Message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button type="submit">Send</button>
    </form>
  );
}
```

### Renderização Condicional

#### Com operador &&

```jsx
function Item({ name, isPacked }) {
  return (
    <li className="item">
      {name} {isPacked && "✅"}
    </li>
  );
}

export default function PackingList() {
  return (
    <section>
      <h1>Sally Ride's Packing List</h1>
      <ul>
        <Item isPacked={true} name="Space suit" />
        <Item isPacked={true} name="Helmet with a golden leaf" />
        <Item isPacked={false} name="Photo of Tam" />
      </ul>
    </section>
  );
}
```

#### Com variável

```jsx
function Item({ name, isPacked }) {
  let itemContent = name;
  if (isPacked) {
    itemContent = name + " ✅";
  }
  return <li className="item">{itemContent}</li>;
}
```

### Props

Props são a forma de passar dados de componentes pais para filhos:

```jsx
function Avatar({ person, size }) {
  return (
    <img
      className="avatar"
      src={person.imageUrl}
      alt={person.name}
      width={size}
      height={size}
    />
  );
}

function Profile() {
  return (
    <Avatar person={{ name: "Lin Lanying", imageUrl: "..." }} size={100} />
  );
}
```

### Hooks Principais

| Hook          | Descrição                         |
| ------------- | --------------------------------- |
| `useState`    | Gerencia estado local             |
| `useEffect`   | Efeitos colaterais (side effects) |
| `useContext`  | Acessa contexto React             |
| `useRef`      | Referências mutáveis              |
| `useMemo`     | Memoização de valores             |
| `useCallback` | Memoização de funções             |

## Links Úteis

- [Documentação Oficial](https://react.dev)
- [GitHub](https://github.com/facebook/react)
- [React Learn](https://react.dev/learn)
