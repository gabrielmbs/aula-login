/**
 * ============================================================================
 * ROTA RAIZ: / (src/app/page.tsx)
 * ============================================================================
 *
 * Por que redirecionar?
 * - O usuário especificou que o login deve ser acessado na rota `/login`.
 * - Ao acessar a URL base da aplicação (http://localhost:3000/), o Next.js
 *   faz o redirecionamento automático (HTTP 307/308) no servidor para `/login`.
 */

import { redirect } from "next/navigation";
import { getSession } from "@/lib/server/session";

export default async function HomePage() {
  redirect((await getSession()) ? "/dashboard" : "/login");
}
