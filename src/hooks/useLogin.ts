"use client";

/**
 * ============================================================================
 * CUSTOM HOOK: useLogin
 * ============================================================================
 * 
 * Por que usar um Custom Hook?
 * - Princípio da Responsabilidade Única (SRP): O componente visual (LoginForm)
 *   apenas desenha os elementos na tela. O hook gerencia os estados e as ações.
 * - Centraliza o estado do formulário: email, senha, loading e feedback.
 * - Orquestra a chamada ao serviço (AuthService) e atualiza a interface.
 */

import { useState } from "react";
import { AuthService } from "@/services/auth.service";
import type { FormFeedbackState, LoginCredentials } from "@/types/auth.types";
import { useRouter } from "next/navigation";

export function useLogin() {
  const router = useRouter();

  // Estado para armazenar os valores dos campos do formulário
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: "",
    senha: "",
  });

  // Estado que indica se uma requisição está em andamento (para desabilitar botões/inputs)
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Estado para controlar a mensagem de retorno (sucesso ou erro) exibida na tela
  const [feedback, setFeedback] = useState<FormFeedbackState>({
    type: "idle",
    message: null,
  });

  /**
   * Atualiza os campos do formulário de forma dinâmica.
   * Pode ser usado com qualquer input baseado na propriedade 'name' ou 'id'.
   */
  function handleInputChange(field: keyof LoginCredentials, value: string) {
    setCredentials((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  /**
   * Submete o formulário, chama o serviço de autenticação e atualiza o estado de feedback.
   */
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // Inicia o carregamento e reseta feedbacks anteriores
    setIsLoading(true);
    setFeedback({ type: "idle", message: null });

    try {
      // Chama a camada de serviço desacoplada
      const result = await AuthService.login(credentials);

      if (result.success) {
        setFeedback({
          type: "success",
          message: result.message,
        });
        router.push("/dashboard");
      } else {
        setFeedback({
          type: "error",
          message: result.message,
        });
      }
    } catch {
      setFeedback({
        type: "error",
        message: "email ou senha invalido.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return {
    credentials,
    isLoading,
    feedback,
    handleInputChange,
    handleSubmit,
  };
}
