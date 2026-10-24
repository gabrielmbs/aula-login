# Atividade: 7 problemas do dia a dia no CadastroWeb

Este material é para quem está começando a desenvolver e quer praticar com um projeto real. Você receberá sete pedidos pequenos, parecidos com aqueles que aparecem na rotina de uma equipe.

Os exercícios usam o **CadastroWeb deste repositório**, feito com React, TypeScript e Next.js. Não é necessário criar uma aplicação nova, instalar bibliotecas adicionais ou alterar o banco de dados.

> Os pedidos são melhorias propostas para estudo, não uma lista de funcionalidades quebradas. Alguns comportamentos já existem parcialmente; leia o código antes de alterar.

As soluções estão em [resposta_problemas.md](./resposta_problemas.md). Tente resolver cada exercício antes de consultar!

## Como aproveitar a atividade

1. Leia a situação e explique, com suas palavras, o que o usuário precisa.
2. Abra o arquivo indicado e localize o trecho relacionado ao pedido.
3. Faça uma alteração pequena por vez.
4. Confira todos os critérios de aceite, não apenas se a tela abriu.
5. Compare sua solução com o gabarito. Soluções diferentes também podem estar corretas.

**Critérios de aceite** são condições que ajudam a decidir se o pedido foi atendido.

Faça os exercícios na ordem sugerida. O exercício 6 reaproveita uma variável criada no exercício 4; os demais podem ser feitos separadamente.

### Antes de começar: ambiente seguro

Você precisa de Node.js 24 ou superior e das dependências do projeto instaladas, conforme o [README principal](./README.md).

Para não alterar registros reais da aula, use a [API de teste local](./tests/fixtures/api-server.mjs). Na raiz do projeto, abra um terminal e execute:

```bash
node tests/fixtures/api-server.mjs
```

Em outro terminal, também na raiz, inicie a aplicação apontando para essa API:

```bash
API_URL=http://127.0.0.1:4010/aula/db API_KEY=test-workspace-key npm run dev -- --port 3001
```

Os comandos acima usam a sintaxe do terminal Linux/macOS. Mantenha os dois terminais abertos enquanto estiver praticando.

Abra <http://localhost:3001/login> e entre com a conta fictícia da API local:

| Campo | Valor de teste |
| --- | --- |
| E-mail | `marina@cadastroweb.test` |
| Senha | `fixture-password` |

Essas credenciais e a chave `test-workspace-key` são exclusivas do ambiente de teste. Não use credenciais reais no código ou nos arquivos da atividade.

A API local começa com sete pessoas fictícias e mantém as alterações apenas na memória. Reiniciá-la restaura os dados iniciais. Se a aplicação não carregar dados, confira os dois terminais antes de mexer no código.

### Mapa dos exercícios

| Nº | Pedido | O que você pratica |
| --- | --- | --- |
| 1 | Deixar claro que o login usa e-mail | Texto de interface e associação entre rótulo e campo |
| 2 | Mostrar o tamanho da camisa em maiúsculas | Eventos, strings e atualização de estado |
| 3 | Exibir um contador no campo de nome | Estado existente, limite de caracteres e acessibilidade |
| 4 | Desabilitar “Limpar filtros” quando não há filtros | Condições e reaproveitamento de uma regra |
| 5 | Transformar o e-mail da lista em um link | Renderização condicional e HTML |
| 6 | Explicar melhor uma busca sem resultados | Condições e mensagens úteis |
| 7 | Exibir dez pessoas por página | Constantes, paginação e testes |

---

## Problema 1 — “Qual usuário eu devo digitar?”

### Situação

Na tela de login, o rótulo do primeiro campo diz “Usuário”. Uma pessoa nova no sistema não sabe se precisa informar um apelido, CPF ou e-mail.

O campo já aceita e-mail. O pedido é deixar isso explícito, sem mudar a autenticação.

### Sua tarefa

Troque o rótulo “Usuário” por **“E-mail de acesso”**.

**Onde mexer:** [LoginForm.tsx](./src/components/auth/LoginForm.tsx).

### Critérios de aceite

- [ ] O novo texto aparece acima do campo de e-mail.
- [ ] Clicar no rótulo continua colocando o foco no campo correto.
- [ ] O campo continua com `type="email"`, `name="email"` e preenchimento obrigatório.
- [ ] Mostrar/ocultar a senha e enviar o formulário continuam funcionando.

**Dica:** procure o componente `Label` associado ao identificador `email`. O texto visível e o nome técnico do campo não são a mesma coisa.

---

## Problema 2 — “Digitei `gg`, mas queria ver `GG`”

### Situação

O sistema já transforma o tamanho da camisa em maiúsculas ao preparar os dados para a API. Porém, enquanto a pessoa digita, o campo continua mostrando letras minúsculas.

A equipe quer que essa padronização apareça imediatamente na tela.

### Sua tarefa

Ao digitar ou colar um tamanho, atualize o campo com o texto em maiúsculas.

**Onde mexer:** campo `shirtSize` em [PersonForm.tsx](./src/components/people/PersonForm.tsx).

### Exemplos

| Texto digitado ou colado | Texto exibido |
| --- | --- |
| `p` | `P` |
| `gg` | `GG` |
| `m` | `M` |
| Campo apagado | Campo vazio |

### Critérios de aceite

- [ ] O texto aparece em maiúsculas antes de salvar.
- [ ] Digitação e colagem recebem o mesmo tratamento.
- [ ] Apagar o conteúdo continua permitido; não há tamanho preenchido automaticamente.
- [ ] O comportamento funciona tanto no cadastro quanto na edição.
- [ ] O limite de dez caracteres e a validação existente continuam funcionando.

**Dica:** o campo já chama `updateField`. Use o método de string `toUpperCase()` no valor que será passado a essa função. Não remova a normalização existente no envio à API.

---

## Problema 3 — “Quantos caracteres ainda posso usar no nome?”

### Situação

O campo de nome completo aceita até 150 caracteres, mas a pessoa só percebe o limite quando não consegue mais digitar.

A equipe pediu um contador para tornar esse limite visível.

### Sua tarefa

Mostre um texto abaixo do campo, no formato **“9/150 caracteres”**, atualizado conforme a digitação.

**Onde mexer:** campo `name` em [PersonForm.tsx](./src/components/people/PersonForm.tsx).

### Exemplos

| Conteúdo do campo | Contador |
| --- | --- |
| Vazio | `0/150 caracteres` |
| `Ana` | `3/150 caracteres` |
| `Ana Souza` | `9/150 caracteres` |

### Critérios de aceite

- [ ] O contador muda ao digitar e ao apagar.
- [ ] Na edição, o contador considera o nome que já veio preenchido.
- [ ] Espaços também entram na contagem, pois fazem parte do texto digitado.
- [ ] O limite de 150 caracteres continua no campo.
- [ ] O contador fica associado ao campo por `aria-describedby`.
- [ ] Se houver erro de validação, a associação com a mensagem de erro também é preservada.

**Dica:** `values.name` já contém o texto atual. Sua propriedade `.length` informa o tamanho; não é necessário criar outro `useState`.

---

## Problema 4 — “Por que posso limpar filtros que nem estão preenchidos?”

### Situação

O botão “Limpar filtros” fica disponível mesmo quando a busca está vazia e o status está em “Todos os status”.

Isso permite solicitar uma atualização desnecessária da lista.

### Sua tarefa

Desabilite o botão da barra de filtros quando não houver busca nem filtro de status.

**Onde mexer:** [PeopleList.tsx](./src/components/people/PeopleList.tsx).

### Regras

Considere que existe filtro quando:

- a busca tem algum conteúdo além de espaços; **ou**
- o status é diferente de `all`, que representa “Todos os status”.

Crie uma variável chamada `hasFilters` para representar essa condição e reaproveite-a nas verificações equivalentes do estado vazio da lista.

### Critérios de aceite

- [ ] Busca vazia + todos os status: botão desabilitado.
- [ ] Busca contendo apenas espaços + todos os status: botão desabilitado.
- [ ] Busca por `Ana`: botão habilitado.
- [ ] Busca vazia + status Ativo ou Inativo: botão habilitado.
- [ ] Clicar em “Limpar filtros” apaga a busca, volta para todos os status e para a página 1.
- [ ] Depois de limpar, o botão volta a ficar desabilitado.

**Dica:** use `.trim()` para verificar o conteúdo sem os espaços das pontas. A regra deve produzir um booleano, usado na propriedade `disabled` do botão.

---

## Problema 5 — “Quero abrir meu aplicativo de e-mail pelo cadastro”

### Situação

Na lista de pessoas, o e-mail aparece apenas como texto. Para entrar em contato, é necessário copiá-lo e abrir outro aplicativo.

A equipe quer permitir que a pessoa clique no endereço e abra o aplicativo de e-mail configurado no computador.

### Sua tarefa

Transforme o endereço de e-mail da coluna de contato em um link `mailto:`.

**Onde mexer:** célula com `className="contact-cell"` em [PeopleList.tsx](./src/components/people/PeopleList.tsx).

### Critérios de aceite

- [ ] Um e-mail preenchido aparece como link com destino `mailto:endereco`.
- [ ] O texto exibido continua sendo o endereço da pessoa.
- [ ] Se não houver e-mail, aparece “E-mail não informado”, sem link vazio.
- [ ] O link pode receber foco e ser acionado pelo teclado.
- [ ] O telefone continua aparecendo como antes.
- [ ] Nenhuma mensagem é enviada automaticamente.

**Dica:** um elemento HTML `<a>` é suficiente. Não é necessário criar uma rota, usar `fetch` ou instalar uma biblioteca.

---

## Problema 6 — “Não encontrei ninguém. E agora?”

### Situação

A lista já diferencia uma base sem cadastros de uma pesquisa sem resultados. Porém, a mensagem para filtros sem resultado ainda é genérica.

A equipe quer explicar o que pode ser feito para continuar.

### Sua tarefa

Melhore o parágrafo do estado vazio conforme a situação:

| Situação | A mensagem deve |
| --- | --- |
| Busca preenchida, com ou sem filtro de status | Mostrar o termo pesquisado e sugerir outra busca ou limpar filtros |
| Busca vazia e status específico | Explicar que não há pessoas para aquele filtro e sugerir outro status ou limpar filtros |
| Sem busca e sem filtro de status | Manter “Os cadastros aparecerão aqui.” |

**Onde mexer:** bloco `data-state` em [PeopleList.tsx](./src/components/people/PeopleList.tsx).

### Critérios de aceite

- [ ] Ao pesquisar `PessoaInexistente123`, a mensagem mostra esse termo.
- [ ] A mensagem usa o termo sem espaços sobrando nas pontas.
- [ ] Uma busca composta só de espaços é tratada como busca vazia.
- [ ] Sem filtros, continua disponível o link “Cadastrar primeira pessoa”.
- [ ] Com filtros, continua disponível a ação “Limpar filtros”.
- [ ] Erros de rede e carregamento continuam com suas próprias mensagens; não são apresentados como lista vazia.

**Dica:** calcule a mensagem com `if` e `else if` antes do `return`. Reaproveite `hasFilters`, do exercício 4, para os elementos que dependem da existência de filtros.

Para ver o caso sem filtros e sem cadastros, use **somente a API local**: exclua as sete pessoas fictícias pela interface e depois reinicie a API para restaurá-las. Para testar o caso de status sem resultado, deixe todas as pessoas locais inativas e filtre por Ativo. Não faça esses testes na base compartilhada da aula.

---

## Problema 7 — “Cinco registros por página é pouco”

### Situação

A lista mostra cinco pessoas por página. A equipe solicitou aumentar esse número para dez, mantendo busca, filtros e navegação funcionando.

O desafio não é trocar qualquer número `5` por `10`: é descobrir quais valores representam o tamanho da página e quais têm outros significados.

### Sua tarefa

Altere o tamanho da página para **dez pessoas** e ajuste os pontos diretamente relacionados.

**Onde investigar:**

- [people.ts](./src/lib/people.ts): constante `PEOPLE_PAGE_SIZE` e função `buildPeopleQuery`.
- [PeopleList.tsx](./src/components/people/PeopleList.tsx): valor usado quando `data.pageSize` ainda não está disponível.
- [people.ts do servidor](./src/lib/server/people.ts): função `getPeople`, que já usa a constante compartilhada.
- [people.test.mjs](./tests/people.test.mjs): teste de consulta com paginação.
- [http-smoke.mjs](./tests/http-smoke.mjs): expectativas sobre a API local de sete pessoas.

### Entendendo os números

`limit` é a quantidade máxima de registros da página. `offset` é a quantidade de registros a pular:

```text
offset = (página atual - 1) × tamanho da página

Página 1: (1 - 1) × 10 = 0
Página 2: (2 - 1) × 10 = 10
Página 3: (3 - 1) × 10 = 20
```

### Critérios de aceite

- [ ] A consulta usa `limit` igual a 10.
- [ ] As páginas 1, 2 e 3 geram `offset` 0, 10 e 20.
- [ ] A interface reaproveita `PEOPLE_PAGE_SIZE`, sem um tamanho padrão `5` fixo.
- [ ] Com os sete registros iniciais da API local, a primeira página mostra sete pessoas.
- [ ] Nesse cenário, “Próxima página” fica desabilitado: não existe uma segunda página de resultados.
- [ ] Os testes existentes são ajustados ao novo comportamento, sem mudar a quantidade inicial de pessoas da API local.
- [ ] Busca, filtro por status e indicação “Mostrando … de … registros” continuam coerentes.

**Dica:** não altere o total esperado de sete registros para dez. Tamanho máximo da página e quantidade de pessoas existentes são coisas diferentes.

---

## Antes de considerar uma entrega pronta

Além da conferência manual, execute:

```bash
npm test
npm run lint
```

Para o exercício 7, confira também o teste HTTP, mantendo os dois servidores locais em execução e reiniciando a API antes do teste, caso tenha alterado seus dados:

```bash
APP_URL=http://127.0.0.1:3001 npm run test:smoke
```

O teste HTTP cria, edita e exclui registros fictícios. **Não o execute contra um ambiente com dados reais.**

Ao terminar, registre para cada exercício:

- o que você alterou;
- por que a alteração resolve o pedido;
- como conferiu o resultado;
- o que teve mais dificuldade para entender.

Não precisa criar arquivos adicionais para isso; pode ser uma explicação na entrega da atividade.

Depois, consulte as [possíveis soluções comentadas](./resposta_problemas.md).
