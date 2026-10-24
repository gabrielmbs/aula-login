/**
 * ============================================================================
 * ROTA: /login (src/app/login/page.tsx)
 * ============================================================================
 *
 * Papel desta página no Next.js (App Router):
 * - Atua como um Server Component por padrão.
 * - Define metadados específicos para a rota (título da aba, descrição SEO).
 * - Renderiza o componente cliente LoginForm, mantendo as fronteiras
 *   entre Server Components e Client Components bem definidas.
 */

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Brand } from "@/components/Brand";
import { LoginForm } from "@/components/auth/LoginForm";
import { AUTH_MESSAGES } from "@/constants/api.constants";
import { getSession } from "@/lib/server/session";

export const metadata: Metadata = {
  title: "Entrar",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string | string[] }>;
}) {
  if (await getSession()) redirect("/dashboard");
  const { error } = await searchParams;
  const initialError =
    error === "credentials"
      ? AUTH_MESSAGES.INVALID_CREDENTIALS
      : error === "input"
        ? "Informe seu e-mail e sua senha."
        : error === "server"
          ? AUTH_MESSAGES.CONNECTION_ERROR
          : undefined;

  return (
    <main className="login-page">
      <div className="login-container">
        <header className="login-brand">
          <Brand light subtitle />
        </header>
        <div className="login-layout">
          <section
            className="login-introduction"
            aria-labelledby="intro-heading"
          >
            <span className="eyebrow">ACESSO AO SISTEMA</span>
            <h1 id="intro-heading">
              Organize seus cadastros
              <br className="desktop-break" /> em um só lugar.
            </h1>
            <p>
              Um modelo simples para demonstrar autenticação,
              <br className="desktop-break" /> navegação e operações CRUD.
            </p>
            <ol className="login-features">
              <li>
                <span>01</span>Autenticação por chave da API
              </li>
              <li>
                <span>02</span>Cadastro e consulta de pessoas
              </li>
            </ol>
          </section>
          <LoginForm initialError={initialError} />
        </div>
      </div>
    </main>
  );
}
