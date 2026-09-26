/**
 * ============================================================================
 * TIPAGENS E INTERFACES TYPESCRIPT PARA AUTENTICAÇÃO E API
 * ============================================================================
 * 
 * Por que tipar dados em TypeScript?
 * 1. Segurança em tempo de desenvolvimento: O compilador impede o acesso a propriedades inexistentes.
 * 2. Autocomplete e Documentação Viva: Qualquer desenvolvedor entende o formato dos dados que entram e saem.
 * 3. Facilita refatorações sem introduzir bugs silenciosos.
 */

// Dados preenchidos pelo usuário no formulário de login
export interface LoginCredentials {
  email: string;
  senha: string;
}

// Registro de usuário retornado dentro da lista 'result' da API
export interface UsuarioResult {
  nome_completo: string;
  [key: string]: unknown; // Permite flexibilidade caso outros campos venham no futuro
}

// Estrutura de uma condição no padrão da API Dinâmica
export interface ApiQueryCondition {
  column: string;
  operator: "=" | "!=" | ">" | "<" | "LIKE" | "IN";
  value: string | number;
}

// Estrutura do corpo (body) enviado para a rota POST de leitura dinâmica
export interface ApiDynamicReadPayload {
  version: number;
  select: string[];
  where: {
    conditions: ApiQueryCondition[];
    logic: "AND" | "OR";
  };
  order_by: unknown[];
}

// Estrutura da resposta retornada pela API Dinâmica
export interface ApiDynamicReadResponse {
  version: number;
  message: string;
  distinct?: boolean;
  select: string[];
  group_by?: unknown[];
  order_by?: unknown[];
  limit?: number | null;
  offset?: number | null;
  total: number;
  result: UsuarioResult[];
}

// Resultado processado pelo serviço de autenticação
export interface LoginServiceResult {
  success: boolean;
  usuario?: UsuarioResult;
  message: string;
}

// Estado do feedback visual do formulário (sucesso ou erro)
export type FeedbackType = "idle" | "success" | "error";

export interface FormFeedbackState {
  type: FeedbackType;
  message: string | null;
}
