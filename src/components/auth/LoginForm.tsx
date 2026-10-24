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

import { useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  LoaderCircle,
} from "lucide-react";
import { useLogin } from "@/hooks/useLogin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm({ initialError }: { initialError?: string }) {
  const [showPassword, setShowPassword] = useState(false);
  // Consumindo estados e funções do Custom Hook
  const { credentials, isLoading, feedback, handleInputChange, handleSubmit } =
    useLogin(initialError);

  return (
    <section className="login-card" aria-labelledby="login-heading">
      <span className="eyebrow">BEM-VINDO</span>
      <h2 id="login-heading">Entre na sua conta</h2>
      <p className="login-card-description">
        Use seus dados de acesso para continuar.
      </p>
      <form
        action="/api/auth/login"
        method="post"
        onSubmit={handleSubmit}
        className="login-form"
        aria-busy={isLoading}
      >
        <div className="field-group">
          <Label htmlFor="email">Usuário</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Seu e-mail de acesso"
            value={credentials.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            required
            disabled={isLoading}
            autoComplete="username"
            autoCapitalize="none"
            maxLength={254}
            aria-invalid={feedback.type === "error"}
            aria-describedby={feedback.message ? "login-feedback" : undefined}
          />
        </div>
        <div className="field-group">
          <Label htmlFor="senha">Senha</Label>
          <div className="password-field">
            <Input
              id="senha"
              name="senha"
              type={showPassword ? "text" : "password"}
              placeholder="Digite sua senha"
              value={credentials.senha}
              onChange={(e) => handleInputChange("senha", e.target.value)}
              required
              disabled={isLoading}
              autoComplete="current-password"
              maxLength={256}
              aria-invalid={feedback.type === "error"}
              aria-describedby={feedback.message ? "login-feedback" : undefined}
            />
            <button
              className="password-toggle"
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              aria-pressed={showPassword}
              title={showPassword ? "Ocultar senha" : "Mostrar senha"}
            >
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
        </div>
        {feedback.message && (
          <div
            id="login-feedback"
            role={feedback.type === "error" ? "alert" : "status"}
            className={`form-feedback form-feedback--${feedback.type}`}
          >
            {feedback.type === "error" && <AlertCircle size={16} />}
            <span>{feedback.message}</span>
          </div>
        )}
        <Button type="submit" className="login-submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <LoaderCircle className="spin" size={18} />
              Entrando...
            </>
          ) : (
            <>
              Entrar
              <ArrowRight size={18} />
            </>
          )}
        </Button>
      </form>
      <p className="login-note">CadastroWeb · Gestão de pessoas</p>
    </section>
  );
}
