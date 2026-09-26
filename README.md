# 📚 Projeto Aula Login (Next.js + shadcn/ui + API Dinâmica)

Este projeto foi construído para servir de material didático em aula, demonstrando as melhores práticas do mercado para:
- Estruturação modular de diretórios em **Next.js (App Router)**.
- Separação clara de responsabilidades (**Separation of Concerns**).
- Criação e uso de componentes no padrão **shadcn/ui**.
- Criação de **Custom Hooks** para isolamento de estado e regras de negócio.
- Camada de **Services** desacoplada para comunicação HTTP via `fetch`.
- Centralização de **Constantes** e contratos tipados com **TypeScript**.

---

## 📁 Arquitetura e Estrutura de Pastas

```text
src/
├── app/
│   ├── globals.css          # Estilos globais (fundo branco, Tailwind CSS)
│   ├── layout.tsx           # Layout raiz com fontes e metadados globais
│   ├── page.tsx             # Redirecionamento automático da rota raiz (/) para /login
│   └── login/
│       └── page.tsx         # Rota /login (Server Component com metadados da página)
│
├── components/
│   ├── auth/
│   │   └── LoginForm.tsx    # Componente de Apresentação (View) do formulário de login
│   └── ui/
│       ├── button.tsx       # Componente de Botão estilizado (shadcn/ui)
│       ├── input.tsx        # Componente de Input estilizado (shadcn/ui)
│       └── label.tsx        # Componente de Label estilizado (shadcn/ui)
│
├── constants/
│   └── api.constants.ts     # Configurações de API, chaves, URLs e mensagens de tela
│
├── hooks/
│   └── useLogin.ts          # Custom Hook: gerencia estados (loading, feedback, campos) e submit
│
├── lib/
│   └── utils.ts             # Função utilitária cn (clsx + tailwind-merge)
│
├── services/
│   └── auth.service.ts      # Camada de Serviço: executa o POST na API Dinâmica
│
└── types/
    └── auth.types.ts        # Interfaces e Tipos TypeScript da aplicação
```

---

## 🔄 Fluxo de Dados (Data Flow)

1. **Usuário interage com a View**: Preenche os campos de email e senha no `LoginForm.tsx`.
2. **Hook captura a alteração**: `useLogin.ts` atualiza o estado local `credentials`.
3. **Submissão do Formulário**: O formulário aciona o método `handleSubmit` do hook.
4. **Chamada da Camada de Serviço**: O hook invoca `AuthService.login(credentials)`.
5. **Comunicação com o Backend**: O `AuthService` monta o payload dinâmico com a `x-api-key` e faz o `POST` para a API.
6. **Processamento da Resposta**:
   - Se `total >= 1` e registro localizado: exibe `"Bem-vindo <nome_completo>"`.
   - Se `total === 0` ou credenciais inválidas: exibe `"email ou senha invalido."`.
7. **Atualização da View**: O hook devolve o estado atualizado para a interface renderizar o feedback.

---

## 🚀 Como Executar o Projeto

1. Instale as dependências:
   ```bash
   npm install
   ```

2. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

3. Abra o navegador em:
   ```text
   http://localhost:3000/login
   ```
   *(ou acesse `http://localhost:3000/` que redirecionará automaticamente para `/login`)*.

---

## 🧪 Credenciais de Teste

- **Sucesso**:
  - Email: `GILMARJUNIOR@OUTLOOK.COM`
  - Senha: `XkUwQ9Cv102PFaAUpOrBbg==`
  - Resultado esperado: `Bem-vindo GILMAR BEZERRA DE MENEZES JÚNIOR`

- **Erro**:
  - Qualquer combinação não cadastrada (ex: `GILMAR@OUTLOOK.COM`)
  - Resultado esperado: `email ou senha invalido.`
