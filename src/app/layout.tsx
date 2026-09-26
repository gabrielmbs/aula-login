import type { Metadata } from "next";
import "./globals.css";

/**
 * ============================================================================
 * ROOT LAYOUT (src/app/layout.tsx)
 * ============================================================================
 * 
 * Papel do RootLayout no Next.js App Router:
 * - Define a estrutura HTML global (tags <html> e <body>).
 * - Carrega as fontes e os estilos globais (globals.css).
 * - Aplica metadados globais e classes utilitárias no body (ex: bg-white).
 */

export const metadata: Metadata = {
  title: "Aula Login • Next.js & shadcn/ui",
  description: "Exemplo didático de autenticação com Next.js, shadcn/ui e consumo de API RESTful.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="bg-white text-slate-900 min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
