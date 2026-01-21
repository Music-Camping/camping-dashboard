# Radix UI

> Documentação obtida via Context7 MCP Server

## Descrição

Radix UI é uma biblioteca de componentes React de código aberto que fornece primitivos não estilizados e acessíveis para construir aplicações web de alta qualidade e sistemas de design. Foca em robustez funcional e experiência do desenvolvedor.

## Instalação

```bash
npm install radix-ui @radix-ui/themes
```

## Versão no Projeto

```json
"radix-ui": "^1.4.3",
"@base-ui/react": "^1.0.0"
```

## Conceitos Principais

### Theme Provider

Envolva sua aplicação com o componente `Theme` para aplicar os tokens de estilo:

```tsx
import { Theme } from "@radix-ui/themes";

function App() {
  return (
    <Theme>
      <YourApp />
    </Theme>
  );
}
```

### Dialog (Modal)

```jsx
import { Dialog, Button, Flex, Text, TextField } from "@radix-ui/themes";

function EditProfileDialog() {
  return (
    <Dialog.Root>
      <Dialog.Trigger>
        <Button>Edit profile</Button>
      </Dialog.Trigger>

      <Dialog.Content maxWidth="450px">
        <Dialog.Title>Edit profile</Dialog.Title>
        <Dialog.Description size="2" mb="4">
          Make changes to your profile.
        </Dialog.Description>

        <Flex direction="column" gap="3">
          <label>
            <Text as="div" size="2" mb="1" weight="bold">
              Name
            </Text>
            <TextField.Root
              defaultValue="Freja Johnsen"
              placeholder="Enter your full name"
            />
          </label>
          <label>
            <Text as="div" size="2" mb="1" weight="bold">
              Email
            </Text>
            <TextField.Root
              defaultValue="freja@example.com"
              placeholder="Enter your email"
            />
          </label>
        </Flex>

        <Flex gap="3" mt="4" justify="end">
          <Dialog.Close>
            <Button variant="soft" color="gray">
              Cancel
            </Button>
          </Dialog.Close>
          <Dialog.Close>
            <Button>Save</Button>
          </Dialog.Close>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
```

### Dropdown Menu

```jsx
import { DropdownMenu, Button } from "@radix-ui/themes";

function OptionsMenu() {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <Button variant="soft">
          Options
          <DropdownMenu.TriggerIcon />
        </Button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Content>
        <DropdownMenu.Item shortcut="⌘ E">Edit</DropdownMenu.Item>
        <DropdownMenu.Item shortcut="⌘ D">Duplicate</DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Item shortcut="⌘ N">Archive</DropdownMenu.Item>

        <DropdownMenu.Sub>
          <DropdownMenu.SubTrigger>More</DropdownMenu.SubTrigger>
          <DropdownMenu.SubContent>
            <DropdownMenu.Item>Move to project…</DropdownMenu.Item>
            <DropdownMenu.Item>Move to folder…</DropdownMenu.Item>
            <DropdownMenu.Separator />
            <DropdownMenu.Item>Advanced options…</DropdownMenu.Item>
          </DropdownMenu.SubContent>
        </DropdownMenu.Sub>

        <DropdownMenu.Separator />
        <DropdownMenu.Item>Share</DropdownMenu.Item>
        <DropdownMenu.Item>Add to favorites</DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Item shortcut="⌘ ⌫" color="red">
          Delete
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}
```

### Form com Card

```jsx
import {
  Box,
  Card,
  Flex,
  Grid,
  Text,
  TextArea,
  Switch,
  Button,
} from "@radix-ui/themes";

function FeedbackForm() {
  return (
    <Box maxWidth="400px">
      <Card size="2">
        <Flex direction="column" gap="3">
          <Grid gap="1">
            <Text as="div" weight="bold" size="2" mb="1">
              Feedback
            </Text>
            <TextArea placeholder="Write your feedback…" />
          </Grid>
          <Flex asChild justify="between">
            <label>
              <Text color="gray" size="2">
                Attach screenshot?
              </Text>
              <Switch size="1" defaultChecked />
            </label>
          </Flex>
          <Grid columns="2" gap="2">
            <Button variant="surface">Back</Button>
            <Button>Send</Button>
          </Grid>
        </Flex>
      </Card>
    </Box>
  );
}
```

### Componentes Interativos

```jsx
import { Flex, Button, Link, Checkbox, Switch } from "@radix-ui/themes";

function InteractiveComponents() {
  return (
    <Flex align="center" gap="4" wrap="wrap">
      <Flex align="center" gap="3" wrap="wrap">
        <Button>Button</Button>
        <Button asChild>
          <a href="#">Link</a>
        </Button>
        <Button disabled>Disabled</Button>
      </Flex>
      <Button variant="ghost">Ghost button</Button>
      <Link href="#" size="2">
        Link
      </Link>
      <Checkbox defaultChecked />
      <Switch defaultChecked />
      <Switch defaultChecked disabled />
    </Flex>
  );
}
```

### Custom Dialog com Primitives

Para componentes que renderizam via portal, envolva o conteúdo com `<Theme>`:

```tsx
import { Dialog } from "radix-ui";
import { Theme } from "@radix-ui/themes";

function MyCustomDialog() {
  return (
    <Dialog.Root>
      <Dialog.Trigger>Open</Dialog.Trigger>
      <Dialog.Portal>
        <Theme>
          <Dialog.Overlay />
          <Dialog.Content>
            <Dialog.Title />
            <Dialog.Description />
            <Dialog.Close />
          </Dialog.Content>
        </Theme>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
```

## Componentes Disponíveis

| Categoria   | Componentes                                                      |
| ----------- | ---------------------------------------------------------------- |
| Layout      | `Box`, `Flex`, `Grid`, `Container`, `Section`                    |
| Tipografia  | `Text`, `Heading`, `Code`, `Quote`                               |
| Formulários | `TextField`, `TextArea`, `Select`, `Checkbox`, `Radio`, `Switch` |
| Feedback    | `Dialog`, `AlertDialog`, `Toast`, `Tooltip`                      |
| Navegação   | `DropdownMenu`, `ContextMenu`, `Tabs`, `NavigationMenu`          |
| Dados       | `Table`, `Card`, `Badge`, `Avatar`                               |
| Ações       | `Button`, `IconButton`, `Link`                                   |

## Links Úteis

- [Documentação Radix Themes](https://www.radix-ui.com/themes/docs)
- [Documentação Radix Primitives](https://www.radix-ui.com/primitives/docs)
- [GitHub](https://github.com/radix-ui/primitives)
