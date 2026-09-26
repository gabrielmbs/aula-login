/**
 * ============================================================================
 * ARQUIVO DE CONSTANTES DA APLICAÇÃO
 * ============================================================================
 * 
 * Por que isolar constantes?
 * 1. Facilidade de Manutenção: Se a URL da API ou a chave mudar, alteramos em um só lugar.
 * 2. Evita Magic Strings / Magic Numbers: Valores soltos no código dificultam a leitura.
 * 3. Reutilização: Podem ser importadas por services, hooks ou componentes sem duplicar dados.
 */

// Endpoint e credenciais da API Dinâmica
export const API_CONFIG = {
  // URL base do endpoint de leitura do banco de dados para a view de usuário
  READ_USER_URL: "https://api.inclus.com.br/aula/db/read/vw_usuario",

  // Chave de autenticação da API (x-api-key)
  API_KEY: "40f073e1-31e6-41c5-8e55-17ca9046f2da",

  // Cabeçalho de autorização esperado pelo servidor
  HEADER_API_KEY_NAME: "x-api-key",

  // Versão da API utilizada nas requisições do corpo
  DEFAULT_API_VERSION: 2,
} as const;

// Mensagens padrão exibidas para o usuário na interface
export const AUTH_MESSAGES = {
  // Mensagem exibida caso as credenciais não correspondam a nenhum registro
  INVALID_CREDENTIALS: "email ou senha invalido.",

  // Prefixo exibido na tela ao autenticar com sucesso (ex: "Bem-vindo Nome")
  WELCOME_PREFIX: "Bem-vindo",

  // Mensagem de fallback para erros inesperados de rede/servidor
  CONNECTION_ERROR: "Não foi possível conectar ao servidor. Tente novamente mais tarde.",
} as const;
