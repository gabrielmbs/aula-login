import type { Metadata } from "next";
import "@fontsource/roboto/latin-400.css";
import "@fontsource/roboto/latin-500.css";
import "@fontsource/roboto/latin-600.css";
import "@fontsource/roboto/latin-700.css";
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
  title: { default: "CadastroWeb", template: "%s | CadastroWeb" },
  description: "CadastroWeb. Gestão de pessoas, simples e organizada.",
  icons: { icon: "/brand-mark.svg" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
