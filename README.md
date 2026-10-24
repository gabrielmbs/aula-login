# CadastroWeb

Aplicação de gestão de pessoas com login, visão geral e CRUD, baseada nas referências visuais fornecidas. Next.js 16, React 19, TypeScript, Tailwind CSS 4 e Lucide. A fonte Roboto é servida localmente.

## Executar

Requisitos: Node.js 24 ou superior e npm.

```bash
npm ci
npm run dev
```

O desenvolvimento usa Webpack para evitar o ciclo de recargas contínuas do HMR observado com Turbopack neste ambiente. O build de produção permanece inalterado.

Abra http://localhost:3000/login. Use o e-mail e a senha de um usuário ativo da base da aula. O formulário não possui uma conta local de demonstração.

Configure as variáveis de `.env.example` em `.env.local`:

| Variável         | Finalidade                                                              |
| ---------------- | ----------------------------------------------------------------------- |
| `API_URL`        | Endereço da API, por padrão `https://api.inclus.com.br/aula/db`.        |
| `API_KEY`        | Chave do workspace da aula. Utilizada somente no servidor.              |
| `SESSION_SECRET` | Segredo aleatório de pelo menos 32 caracteres. Obrigatório em produção. |

Em desenvolvimento, quando `SESSION_SECRET` não é definida, o servidor gera um segredo temporário; reiniciar o servidor encerra essas sessões. Em produção, use um segredo fixo e exclusivo, compartilhado entre as instâncias, e HTTPS.

## Telas

| Rota                             | Tela                                                                       |
| -------------------------------- | -------------------------------------------------------------------------- |
| `/login`                         | Login com controle de visibilidade da senha e feedback.                    |
| `/dashboard`                     | Totais reais, cadastros recentes e percentual de cadastros completos.      |
| `/dashboard/pessoas`             | Busca por nome/e-mail, filtro por status, paginação e exclusão confirmada. |
| `/dashboard/pessoas/nova`        | Cadastro com validação de CPF, e-mail, telefone e data.                    |
| `/dashboard/pessoas/[id]/editar` | Edição dos dados existentes.                                               |

O dashboard considera o fuso `America/Sao_Paulo`. Cadastros completos possuem nome, CPF, e-mail, telefone e data de nascimento. Períodos sem registros mostram zero, sem valores fictícios.

## Arquitetura E API

- `src/app`: páginas e endpoints internos autenticados.
- `src/components`: interface, layout compartilhado e formulários.
- `src/hooks`: estado dos formulários e busca com cancelamento de requisições.
- `src/services`: chamadas do navegador aos endpoints internos.
- `src/lib/server`: acesso à API, sessão e operações de pessoas, protegidos por `server-only`.
- `src/lib/people.ts`: máscaras, validação, períodos e tradução do schema.
- `src/types`: contratos tipados de autenticação, API e pessoas.

O navegador não recebe a chave do workspace. A sessão dura oito horas e usa cookie assinado, `HttpOnly`, `SameSite=Lax` e `Secure` em produção. Páginas e operações validam a sessão no servidor; mutações também verificam a origem e os campos permitidos.

O login também funciona antes da hidratação ou sem JavaScript: o formulário envia as credenciais por POST, nunca pela URL, e o servidor redireciona para o dashboard ou devolve o feedback de erro na tela de login. Com JavaScript, a entrada também carrega um documento novo para validar o cookie sem reutilizar o cache de navegação de uma sessão anterior.

A tag `<html>` usa `suppressHydrationWarning` apenas para tolerar atributos adicionados por extensões, como `data-lt-installed` do LanguageTool. Isso não desativa a validação de hidratação dos componentes da aplicação.

Integração conforme https://aula-postman.netlify.app/:

- `POST /read/vw_usuario`: autenticação por e-mail e senha de usuário ativo.
- `POST /read/pessoa`: leitura com `version: 2`, filtros, limite e offset; resposta `result` e `total`.
- `POST /read/genero`: opções reais de gênero (`id` e `descricao`), utilizadas no formulário e validadas no servidor.
- `POST /create/pessoa`: objeto de colunas diretamente no corpo, sem envelope: `cpf`, `id_genero`, `nome_completo`, `data_nascimento`, `telefone`, `email`, `id_situacao_cadastro`, `deficiencia`, `deficiencia_descricao` e `tamanho_camisa`. A resposta contém `message` e `result` com o registro criado; não exige `total` nem `insertId`.
- `PATCH /update/pessoa`: campos e identificador `id` no corpo, sem envelope. O contrato aceita alterações parciais com valores nulos, por exemplo: `{ "id": 2176, "tamanho_camisa": null }`.
- `DELETE /delete/pessoa`: identificador `id` no corpo, por exemplo `{ "id": 2176 }`. A resposta contém `message` e `result` numérico, por exemplo `{ "message": "REGISTRO EXCLUÍDO COM SUCESSO", "result": 1 }`, sem exigir `affectedRows`.

O formulário continua enviando seus dados completos por `PUT /api/people/[id]` à rota interna; o servidor traduz essa operação para o `PATCH` da API externa.

`id_situacao_cadastro` 1 corresponde a Ativo e 2 a Inativo. As alterações usam apenas as colunas necessárias, preservando os demais dados do cadastro.

Na criação e na edição, gênero, deficiência e tamanho da camisa devem ser informados, sem valores automáticos. A deficiência é enviada como `0` ou `1`; a descrição é obrigatória quando a opção é “Sim” e enviada vazia quando é “Não”. O tamanho da camisa é enviado em maiúsculas.

Um HTTP 502 em `/api/people` indica uma rejeição ou resposta inválida da API externa, não necessariamente uma URL incorreta. Rejeições registram no terminal a operação, tabela, status externo e código `ER_*`, quando disponível, sem registrar o corpo, credenciais, SQL ou dados pessoais. Os detalhes privados da API não são enviados ao navegador.

## Verificações

```bash
npm test
npm run lint
npm run build
```

Os testes unitários usam o executor nativo do Node. Para o teste HTTP completo, inicie a API isolada em um terminal:

```bash
node tests/fixtures/api-server.mjs
```

Em outro terminal, execute uma instância de teste da aplicação:

```bash
API_URL=http://127.0.0.1:4010/aula/db API_KEY=test-workspace-key npm run dev -- --port 3001
```

Execute então:

```bash
APP_URL=http://127.0.0.1:3001 npm run test:smoke
```

O teste confere que os registros pertencem à API isolada antes de criar, editar e excluir. Nunca o aponte para um ambiente com dados reais.

## Limites Da API Didática

A API externa usa chave compartilhada e consulta de senha em banco, conforme o material da aula. Essa autenticação não substitui um serviço de identidade com senhas protegidas e controle de acesso individual para produção. Não armazene credenciais reais no repositório.
