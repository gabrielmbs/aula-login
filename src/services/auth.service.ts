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

import { API_CONFIG, AUTH_MESSAGES } from "@/constants/api.constants";
import type {
  LoginCredentials,
  ApiDynamicReadPayload,
  ApiDynamicReadResponse,
  LoginServiceResult,
} from "@/types/auth.types";

export class AuthService {
  /**
   * Realiza a consulta na API Dinâmica buscando um usuário com o e-mail e senha informados.
   * 
   * @param credentials - Objeto contendo email e senha informados no formulário
   * @returns Retorna um resultado padronizado com status de sucesso, mensagem e dados do usuário
   */
  static async login(credentials: LoginCredentials): Promise<LoginServiceResult> {
    const { email, senha } = credentials;

    // 1. Montagem do payload conforme a especificação da API Dinâmica
    const payload: ApiDynamicReadPayload = {
      version: API_CONFIG.DEFAULT_API_VERSION,
      select: ["nome_completo"],
      where: {
        conditions: [
          {
            column: "email",
            operator: "=",
            value: email,
          },
          {
            column: "senha",
            operator: "=",
            value: senha,
          },
        ],
        logic: "AND",
      },
      order_by: [],
    };

    try {
      // 2. Execução da chamada HTTP POST para o endpoint
      const response = await fetch(API_CONFIG.READ_USER_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          [API_CONFIG.HEADER_API_KEY_NAME]: API_CONFIG.API_KEY,
        },
        body: JSON.stringify(payload),
      });

      // 3. Verificação do status HTTP
      if (!response.ok) {
        return {
          success: false,
          message: AUTH_MESSAGES.INVALID_CREDENTIALS,
        };
      }

      // 4. Leitura e tipagem do corpo da resposta
      const data: ApiDynamicReadResponse = await response.json();

      // 5. Validação da regra de negócio:
      // Se 'total >= 1' e houver pelo menos um item no array 'result', o login é válido
      if (data && data.total > 0 && Array.isArray(data.result) && data.result.length > 0) {
        const usuarioEncontrado = data.result[0];

        return {
          success: true,
          usuario: usuarioEncontrado,
          message: `${AUTH_MESSAGES.WELCOME_PREFIX} ${usuarioEncontrado.nome_completo}`,
        };
      }

      // Caso contrário (total === 0 ou result vazio), credenciais inválidas
      return {
        success: false,
        message: AUTH_MESSAGES.INVALID_CREDENTIALS,
      };
    } catch (error) {
      // Tratamento de falhas de conexão de rede ou erros inesperados
      console.error("[AuthService] Erro ao autenticar usuário:", error);

      return {
        success: false,
        message: AUTH_MESSAGES.INVALID_CREDENTIALS,
      };
    }
  }
}
