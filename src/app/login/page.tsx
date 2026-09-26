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
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Login • Aula Next.js",
  description: "Página de autenticação simples e modular com shadcn/ui.",
};

export default function LoginPage() {
  return (
    <main className="w-full min-h-screen bg-white">
      <LoginForm />
    </main>
  );
}
