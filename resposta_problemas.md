# Respostas comentadas: 7 problemas do CadastroWeb

Este é o gabarito de [atividade_problemas.md](./atividade_problemas.md). As soluções são possibilidades, não as únicas respostas corretas.

O objetivo é entender **onde alterar, por que funciona e como verificar**, em vez de apenas copiar código.

> Este documento não aplica as mudanças automaticamente. Os arquivos da aplicação permanecem como estavam; os trechos abaixo são instruções para quem estiver resolvendo a atividade.

## Antes de copiar qualquer trecho

- Use o ambiente local isolado explicado na [atividade](./atividade_problemas.md#antes-de-começar-ambiente-seguro).
- Os exemplos substituem apenas os trechos indicados. Não substitua um arquivo inteiro por um exemplo parcial.
- Preserve os imports, as validações e os demais atributos que não fazem parte do pedido.
- Os componentes usados aqui já são Client Components e têm `"use client"` no início. Preserve essa diretiva: eles usam estado e eventos do navegador.
- Não coloque a chave da API externa em componentes da interface nem faça chamadas diretas a ela pelo navegador.

Os números correspondem aos exercícios. A solução 6 considera a variável `hasFilters` da solução 4; se estiver fazendo apenas a 6, inclua essa variável também.

## Solução 1 — Deixar claro que o login usa e-mail

**Arquivo:** [LoginForm.tsx](./src/components/auth/LoginForm.tsx).

### Passo a passo

1. Localize o `Label` que tem `htmlFor="email"`.
2. Troque somente seu conteúdo:

```tsx
<Label htmlFor="email">E-mail de acesso</Label>
```

### Por que funciona?

O conteúdo de `Label` é o texto que a pessoa vê. O atributo `htmlFor="email"` continua apontando para o campo com `id="email"`, preservando a associação entre rótulo e campo.

Não é necessário alterar o hook de login, a API nem o banco.

**Atenção:** não troque `name="email"` por `name="E-mail de acesso"`. O servidor recebe o valor usando o nome técnico `email`.

### Como conferir

1. Abra `/login` sem uma sessão autenticada.
2. Confira o novo texto.
3. Clique no rótulo e veja se o campo recebe foco.
4. Entre com a conta local de teste para confirmar que o formulário continua funcionando.

**Aprendizado:** uma melhoria de clareza pode ser resolvida mudando apenas o texto certo, sem alterar regras de negócio.

---

## Solução 2 — Mostrar o tamanho da camisa em maiúsculas

**Arquivo:** [PersonForm.tsx](./src/components/people/PersonForm.tsx).

### Passo a passo

No campo `shirtSize`, troque o tratamento de `onChange` por:

```tsx
onChange={(event) =>
  updateField("shirtSize", event.target.value.toUpperCase())
}
```

O campo completo fica assim:

```tsx
<Input
  {...accessibility("shirtSize")}
  name="shirtSize"
  placeholder="Ex.: P, M, G, GG"
  maxLength={10}
  value={values.shirtSize}
  onChange={(event) =>
    updateField("shirtSize", event.target.value.toUpperCase())
  }
  required
/>
```

### Por que funciona?

1. `event.target.value` contém o texto depois da alteração.
2. `.toUpperCase()` produz uma versão em maiúsculas.
3. `updateField` atualiza o estado do formulário.
4. Como o campo usa `value={values.shirtSize}`, ele passa a mostrar o valor atualizado.

O mesmo evento também trata alterações feitas por colagem. Não é preciso criar um evento separado para cada tecla.

O formulário é compartilhado entre cadastro e edição, então a alteração atende às duas telas. Ela transforma o texto **quando o campo é alterado**; não modifica automaticamente um registro antigo apenas por abrir a edição.

**Não remova** a normalização em `buildPersonPayload`, de [people.ts](./src/lib/people.ts). A transformação na tela ajuda a pessoa; a transformação no envio mantém a padronização dos dados.

### Como conferir

| Ação | Resultado esperado |
| --- | --- |
| Digitar `p` | Mostrar `P` |
| Colar `gg` | Mostrar `GG` |
| Apagar tudo | Manter o campo vazio |
| Tentar salvar sem tamanho | Exibir a validação existente |
| Editar uma pessoa e trocar `m` por `gg` | Mostrar e salvar `GG` |

**Aprendizado:** reaproveite o estado e a função de atualização existentes, em vez de criar um segundo caminho para modificar o formulário.

---

## Solução 3 — Exibir um contador no campo de nome

**Arquivo:** [PersonForm.tsx](./src/components/people/PersonForm.tsx).

### Passo a passo

Dentro do `Field` com `name="name"`, substitua o `Input` atual pelo trecho abaixo. O `small` deve ficar logo depois do `Input`, ainda dentro do mesmo `Field`:

```tsx
<Input
  {...accessibility("name")}
  name="name"
  autoComplete="name"
  placeholder="Nome completo da pessoa"
  maxLength={150}
  value={values.name}
  onChange={(event) => updateField("name", event.target.value)}
  aria-describedby={
    errors.name
      ? "person-name-hint person-name-error"
      : "person-name-hint"
  }
  required
/>
<small id="person-name-hint">
  {values.name.length}/150 caracteres
</small>
```

### Por que funciona?

`values.name` já é atualizado quando a pessoa digita. Ao renderizar novamente o formulário, React calcula `values.name.length` e atualiza o contador.

Não criamos um estado separado para o número de caracteres. Isso evita que o texto e o contador fiquem diferentes por algum erro de sincronização.

O atributo `aria-describedby` associa o campo a informações complementares:

- sem erro, aponta para o contador;
- com erro, aponta para o contador **e** para a mensagem que o componente `Field` já renderiza.

A ordem importa: o novo `aria-describedby` vem **depois** de `{...accessibility("name")}`, para complementar o valor produzido pelo helper sem perder o `id` e o `aria-invalid`.

Não usamos `.trim()` na contagem, pois queremos contar o conteúdo que está no campo, incluindo espaços.

### Como conferir

1. No cadastro, veja se o campo vazio mostra `0/150 caracteres`.
2. Digite `Ana Souza` e confira `9/150 caracteres`.
3. Apague caracteres e observe a atualização.
4. Abra uma edição e confira se o contador começa com o tamanho do nome existente.
5. Tente salvar com nome `A` e confira a mensagem de validação.
6. Nas ferramentas do navegador, inspecione o campo: com erro, `aria-describedby` deve conter os dois identificadores.

**Aprendizado:** informações derivadas de um estado normalmente podem ser calculadas durante a renderização.

---

## Solução 4 — Desabilitar “Limpar filtros” quando não há filtros

**Arquivo:** [PeopleList.tsx](./src/components/people/PeopleList.tsx).

### Passo 1: representar a regra com um booleano

Dentro de `PeopleList`, depois dos estados e antes do `return`, adicione:

```tsx
const hasFilters =
  filters.search.trim() !== "" || filters.status !== "all";
```

Aqui:

- `.trim()` desconsidera os espaços das pontas;
- `!== ""` verifica se sobrou algum texto;
- `||` significa “ou”: basta uma das condições ser verdadeira.

### Passo 2: usar a regra no botão da barra de filtros

O botão identificado por `className="clear-filters"` fica assim:

```tsx
<Button
  variant="outline"
  className="clear-filters"
  disabled={!hasFilters}
  onClick={() =>
    updateFilters({ search: "", status: "all", page: 1 })
  }
>
  <RotateCcw size={15} />
  Limpar filtros
</Button>
```

`!hasFilters` é a negação: se **não** há filtros, o botão fica desabilitado. O componente `Button` existente já encaminha `disabled` para o botão HTML.

### Passo 3: reaproveitar a regra no estado vazio

No bloco `data-state`, há três verificações equivalentes à expressão:

```tsx
filters.search || filters.status !== "all"
```

Substitua essas verificações por `hasFilters`: uma controla o título, outra o parágrafo e outra a escolha entre limpar filtros e cadastrar a primeira pessoa.

Por exemplo, o título fica:

```tsx
<h2>
  {hasFilters
    ? "Nenhuma pessoa encontrada"
    : "Nenhuma pessoa cadastrada"}
</h2>
```

Assim, uma busca contendo apenas espaços deixa de ser tratada como um filtro nessas mensagens. O parágrafo será refinado na solução 6.

### Como conferir

| Busca | Status | Botão da barra |
| --- | --- | --- |
| Vazia | Todos | Desabilitado |
| Três espaços | Todos | Desabilitado |
| `Ana` | Todos | Habilitado |
| Vazia | Ativo | Habilitado |
| Vazia | Inativo | Habilitado |

Depois de clicar em limpar, confira também se a página volta para 1. Preserve a chamada a `updateFilters`: ela já integra os filtros ao carregamento da lista.

**Aprendizado:** uma regra com nome claro é mais fácil de reutilizar e evita comportamentos diferentes para a mesma situação.

---

## Solução 5 — Transformar o e-mail da lista em um link

**Arquivo:** [PeopleList.tsx](./src/components/people/PeopleList.tsx).

### Passo a passo

Na célula `contact-cell`, substitua apenas o `span` que mostra o e-mail por:

```tsx
<span title={person.email}>
  {person.email ? (
    <a href={`mailto:${person.email}`}>
      {person.email}
    </a>
  ) : (
    "E-mail não informado"
  )}
</span>
```

Mantenha o `small` do telefone logo abaixo, como já está no componente.

### Por que funciona?

O prefixo `mailto:` informa ao navegador que o destino é um endereço de e-mail. Ele pode abrir o aplicativo configurado ou perguntar qual aplicativo usar.

A condição `person.email ? ... : ...` impede a criação de um link vazio quando o endereço não foi informado.

Usamos `<a>`, e não um `span` com `onClick`, porque links já têm comportamento nativo de navegação e suporte ao teclado.

**Isso não envia um e-mail pelo sistema.** O aplicativo de e-mail prepara a ação, e o envio depende da pessoa.

### Como conferir

1. Abra a lista e inspecione um link: o `href` deve começar com `mailto:`.
2. Use `Tab` para chegar ao endereço e `Enter` para acioná-lo.
3. Confira se o telefone continua visível.
4. Se não houver um aplicativo de e-mail configurado, confira o destino do link nas ferramentas do navegador; isso, por si só, não indica erro no código.

Os dados iniciais da API local têm e-mail preenchido. Para testar o caso sem e-mail, sem enfraquecer a validação do cadastro:

1. Na construção de `people`, em [api-server.mjs](./tests/fixtures/api-server.mjs), substitua temporariamente a propriedade `email` por:

   ```js
   email: index === 0
     ? ""
     : `${name.toLowerCase().replace(" ", ".")}@cadastroweb.test`,
   ```

2. Reinicie somente a API local e recarregue a lista.
3. Confira se Ana Souza mostra “E-mail não informado”, sem link.
4. Restaure a linha original e reinicie a API antes de seguir ou executar o teste HTTP. Esse teste espera e-mails de teste preenchidos.

Essa alteração temporária serve apenas para preparar um cenário de teste; não faz parte da solução a entregar.

**Aprendizado:** prefira o elemento HTML que já representa a ação desejada.

---

## Solução 6 — Explicar melhor uma busca sem resultados

**Arquivo:** [PeopleList.tsx](./src/components/people/PeopleList.tsx).

### Passo 1: calcular a mensagem

Dentro de `PeopleList`, antes do `return`, adicione:

```tsx
const searchTerm = filters.search.trim();
let emptyMessage = "Os cadastros aparecerão aqui.";

if (searchTerm) {
  emptyMessage =
    `Não há registros para a busca "${searchTerm}" com os filtros atuais. ` +
    "Tente outra busca ou limpe os filtros.";
} else if (filters.status !== "all") {
  emptyMessage =
    "Não há pessoas com o status selecionado. " +
    "Tente outro status ou limpe os filtros.";
}
```

`emptyMessage` começa com a mensagem de uma base sem pessoas. As condições substituem esse texto quando há uma busca ou um status específico.

A busca tem prioridade porque pode ser usada junto com o status. A expressão “com os filtros atuais” deixa claro que o resultado considera os dois.

### Passo 2: atualizar somente o estado vazio

Depois da solução 4, substitua o bloco `div` com `className="data-state"` por:

```tsx
<div className="data-state">
  <UsersRound size={30} strokeWidth={1.5} />
  <h2>
    {hasFilters
      ? "Nenhuma pessoa encontrada"
      : "Nenhuma pessoa cadastrada"}
  </h2>
  <p>{emptyMessage}</p>
  {hasFilters ? (
    <Button
      variant="outline"
      onClick={() =>
        updateFilters({ search: "", status: "all", page: 1 })
      }
    >
      <RotateCcw size={16} />
      Limpar filtros
    </Button>
  ) : (
    <Link href="/dashboard/pessoas/nova" className="text-link">
      Cadastrar primeira pessoa
      <ChevronRight size={16} />
    </Link>
  )}
</div>
```

Se não fez a solução 4, inclua também:

```tsx
const hasFilters =
  filters.search.trim() !== "" || filters.status !== "all";
```

### Por que não alterar os outros blocos?

O componente já trata separadamente:

- erro, com `DataError`;
- lista com dados;
- carregamento;
- lista vazia.

O pedido modifica somente o último caso. Não transforme falhas de rede em “Nenhuma pessoa encontrada”: isso esconderia um problema e passaria uma informação incorreta.

O termo é exibido como texto JSX por `{emptyMessage}`. Não use `dangerouslySetInnerHTML` para mostrar conteúdo digitado pela pessoa.

### Como conferir

1. Busque `PessoaInexistente123` e aguarde o carregamento terminar.
2. Confira o termo e a orientação para tentar outra busca ou limpar os filtros.
3. Repita com espaços antes e depois do termo.
4. Na API local, deixe todas as pessoas inativas e filtre por Ativo para conferir a mensagem específica de status.
5. Ainda somente na API local, exclua as pessoas fictícias, limpe os filtros e confira “Os cadastros aparecerão aqui.” e o link de cadastro.
6. Reinicie a API para restaurar as sete pessoas.
7. Para conferir o tratamento de erro, pare a API local e altere a busca: deve aparecer o feedback de erro existente, não a nova mensagem de lista vazia. Reinicie a API depois.

**Aprendizado:** uma boa mensagem explica o que aconteceu e oferece um próximo passo, sem confundir ausência de dados com falha do sistema.

---

## Solução 7 — Exibir dez pessoas por página

Esta solução exige olhar além da tela: a consulta, o cálculo da interface e os testes precisam concordar.

### Passo 1: alterar a constante compartilhada

Em [people.ts](./src/lib/people.ts), altere:

```ts
export const PEOPLE_PAGE_SIZE = 10;
```

`buildPeopleQuery` já calcula `limit` e `offset` usando essa constante. Não é necessário reescrever a fórmula.

A função `getPeople`, em [people.ts do servidor](./src/lib/server/people.ts), também já usa a constante para informar `pageSize` e calcular a página retornada. Não precisa ser alterada.

### Passo 2: remover o tamanho padrão fixo da interface

Em [PeopleList.tsx](./src/components/people/PeopleList.tsx), substitua o import atual de `formatDate` por:

```tsx
import { formatDate, PEOPLE_PAGE_SIZE } from "@/lib/people";
```

Depois, substitua o cálculo de `totalPages` por:

```tsx
const totalPages = Math.max(
  1,
  Math.ceil((data?.total ?? 0) / (data?.pageSize ?? PEOPLE_PAGE_SIZE)),
);
```

O operador `??` usa o valor da direita quando o valor da esquerda é `null` ou `undefined`. Quando os dados já chegaram, o cálculo respeita `data.pageSize`; antes disso, usa a constante compartilhada.

Assim, não sobra um `5` fixo representando outro tamanho padrão de página.

### Passo 3: atualizar o teste da consulta

Em [people.test.mjs](./tests/people.test.mjs), localize o teste:

```text
combines a name/email search with status and real pagination
```

Ele consulta a página 3. Substitua as expectativas de `limit` e `offset` e inclua a conferência das primeiras páginas:

```js
assert.equal(query.limit, 10);
assert.equal(query.offset, 20);
assert.equal(buildPeopleQuery({ page: 1 }).offset, 0);
assert.equal(buildPeopleQuery({ page: 2 }).offset, 10);
```

Mantenha as verificações dos filtros e das páginas inválidas que já existem nesse teste.

Usar valores esperados explícitos aqui é importante: se o teste esperasse apenas o próprio valor da constante, poderia continuar passando mesmo que ela fosse configurada com um tamanho diferente de dez.

### Passo 4: ajustar as expectativas do teste HTTP

Em [http-smoke.mjs](./tests/http-smoke.mjs), depois da consulta inicial, o teste espera sete pessoas no total e cinco na primeira página.

Mantenha a verificação de total igual a sete e substitua a expectativa de tamanho da lista por:

```js
assert.equal(initial.people.length, 7);
assert.equal(initial.pageSize, 10);
```

Mais abaixo, substitua a verificação que espera duas pessoas na segunda página por:

```js
assert.equal(
  (await call("/api/people?page=2").then((response) => response.json())).people
    .length,
  0,
);
```

Por quê?

- A API local continua tendo **sete pessoas**.
- A página comporta **até dez pessoas**.
- As sete cabem na primeira página.
- Uma chamada direta à segunda página retorna uma lista vazia, porque não há mais registros.
- A interface nem deve oferecer avançar nesse cenário.

Não altere a API de teste para criar dez registros. Isso mudaria os dados usados por outras verificações e não resolveria a necessidade de manter o teste alinhado à configuração nova.

### Passo 5: executar as verificações

Para validar apenas o arquivo de testes da regra de pessoas:

```bash
node --test tests/people.test.mjs
```

Depois, confira os testes do projeto e o lint:

```bash
npm test
npm run lint
```

Com a API local recém-iniciada e a aplicação apontando para ela na porta 3001, execute:

```bash
APP_URL=http://127.0.0.1:3001 npm run test:smoke
```

Esse último comando faz alterações nos registros de teste. Siga o [preparo do ambiente isolado](./atividade_problemas.md#antes-de-começar-ambiente-seguro); nunca use dados reais.

### Como conferir na tela

- Com os sete registros iniciais, a lista deve mostrar sete linhas.
- O rodapé deve informar “Mostrando 1 a 7 de 7 registros”.
- O botão “Próxima página” deve ficar desabilitado.
- Uma busca por `Ana`, sem filtro de status, deve continuar encontrando Ana Souza.
- Os filtros por Ativo e Inativo devem continuar funcionando.

Para testar a navegação visual entre páginas, são necessários **mais de dez registros locais**. Os sete registros iniciais não demonstram essa navegação; o teste da consulta cobre os offsets 0, 10 e 20, enquanto o teste HTTP cobre a integração com os sete registros disponíveis.

**Aprendizado:** mudar um número de configuração pode afetar vários pontos. Reaproveitar uma constante evita divergências, mas os testes também precisam refletir a nova regra.

---

## Checklist final de revisão

- [ ] Fiz apenas as alterações necessárias para cada pedido.
- [ ] Preservei os componentes, hooks e validações existentes.
- [ ] Não criei estado duplicado para informações que podem ser calculadas.
- [ ] Mantive rótulos, mensagens de erro e navegação por teclado.
- [ ] Testei o cadastro e a edição quando a mudança envolve o formulário compartilhado.
- [ ] Não alterei autenticação nem expus a chave da API no navegador.
- [ ] Ajustei os testes afetados pela mudança de paginação.
- [ ] Fiz os testes de criação, edição e exclusão somente na API local.

## O que esses exercícios ensinam em conjunto?

No dia a dia, muitos pedidos não exigem uma tecnologia nova: exigem entender o código existente e alterar o ponto certo.

Uma boa entrega combina **clareza para quem usa**, **consistência entre interface e dados** e **verificação do comportamento esperado**.
