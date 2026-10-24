/**
 * ============================================================================
 * SERVIÇO DE AUTENTICAÇÃO (CAMADA DE COMUNICAÇÃO COM O BACKEND)
 * ============================================================================
 *
 * Papel desta camada (Service Pattern):
 * - Isola todas as chamadas HTTP e protocolos de rede.
 * - Constrói a estrutura de dados (payload) exigida pela API.
 * - Trata status HTTP e parse de respostas JSON.
 * - Desacopla a interface (React) das regras da API externa.
 */

import { AUTH_MESSAGES } from "@/constants/api.constants";
import type { LoginCredentials, LoginServiceResult } from "@/types/auth.types";

export class AuthService {
  static async login(
    credentials: LoginCredentials,
  ): Promise<LoginServiceResult> {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });
      const data = await response.json();

      return {
        success: response.ok && data.success === true,
        usuario: data.usuario,
        message:
          typeof data.message === "string"
            ? data.message
            : AUTH_MESSAGES.CONNECTION_ERROR,
      };
    } catch {
      return { success: false, message: AUTH_MESSAGES.CONNECTION_ERROR };
    }
  }
}
