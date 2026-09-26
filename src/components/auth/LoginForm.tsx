"use client";

/**
 * ============================================================================
 * COMPONENTE DE APRESENTAÇÃO: LoginForm
 * ============================================================================
 * 
 * Papel deste componente:
 * - Renderiza a estrutura visual do formulário de autenticação.
 * - Utiliza os componentes primitivos da biblioteca shadcn/ui (Button, Input, Label).
 * - Conecta a interface ao custom hook `useLogin`, mantendo o componente
 *   100% focado na camada de apresentação (View).
 * - Fundo branco e design minimalista, atendendo aos requisitos da aula.
 */

import { useLogin } from "@/hooks/useLogin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  // Consumindo estados e funções do Custom Hook
  const { credentials, isLoading, feedback, handleInputChange, handleSubmit } =
    useLogin();

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-white p-4">
      {/* Container principal do formulário com largura máxima controlada */}
      <form onSubmit={handleSubmit} className="w-full max-w-xs space-y-4">
        {/* Campo de Email */}
        <div className="space-y-1">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Digite seu email"
            value={credentials.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            required
            disabled={isLoading}
            autoComplete="email"
          />
        </div>

        {/* Campo de Senha */}
        <div className="space-y-1">
          <Label htmlFor="senha">Senha</Label>
          <Input
            id="senha"
            name="senha"
            type="password"
            placeholder="Digite sua senha"
            value={credentials.senha}
            onChange={(e) => handleInputChange("senha", e.target.value)}
            required
            disabled={isLoading}
            autoComplete="current-password"
          />
        </div>

        {/* Botão de Ação: Entrar */}
        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? "Entrando..." : "Entrar"}
        </Button>

        {/* Área de exibição de feedback (Mensagem de sucesso ou erro) */}
        {feedback.message && (
          <div
            role="alert"
            className={`text-center text-sm font-medium transition-all ${
              feedback.type === "success"
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {feedback.message}
          </div>
        )}
      </form>
    </div>
  );
}
