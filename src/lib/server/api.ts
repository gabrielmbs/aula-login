import "server-only";
import { API_CONFIG } from "../../constants/api.constants.ts";
import type { ApiReadOptions, ApiReadResult } from "../../types/api.types";
import type { PersonErrors } from "../../types/person.types";

type ApiTable = "pessoa" | "vw_usuario" | "genero";
type ApiOperation = "read" | "create" | "update" | "delete";

export class ApiError extends Error {
  status: number;
  fields?: PersonErrors;

  constructor(message: string, status = 500, fields?: PersonErrors) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fields = fields;
  }
}

export async function dynamicRequest(
  operation: ApiOperation,
  table: ApiTable,
  payload: unknown,
): Promise<Record<string, unknown>> {
  const apiKey = process.env.API_KEY;
  const baseUrl = (process.env.API_URL || API_CONFIG.BASE_URL).replace(
    /\/$/,
    "",
  );

  if (!apiKey)
    throw new ApiError("A conexão com a API não foi configurada.", 503);

  try {
    const response = await fetch(`${baseUrl}/${operation}/${table}`, {
      method:
        operation === "update"
          ? "PATCH"
          : operation === "delete"
            ? "DELETE"
            : "POST",
      headers: {
        "Content-Type": "application/json",
        [API_CONFIG.HEADER_API_KEY_NAME]: apiKey,
      },
      body: JSON.stringify(payload),
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });
    const data: unknown = await response.json().catch(() => null);

    if (!data || typeof data !== "object" || Array.isArray(data)) {
      throw new ApiError(
        "A API retornou uma resposta inválida. Tente novamente.",
        502,
      );
    }

    const result = data as Record<string, unknown>;
    const message = typeof result.message === "string" ? result.message : "";

    if (
      !response.ok ||
      result.error ||
      result.success === false ||
      /^ERRO\b/i.test(message)
    ) {
      console.error("Falha na API externa.", {
        operation,
        table,
        status: response.status,
        code:
          typeof result.code === "string" && /^ER_[A-Z_]+$/.test(result.code)
            ? result.code
            : undefined,
      });

      if (/duplicate|duplicad/i.test(message)) {
        throw new ApiError("Já existe uma pessoa com este CPF ou e-mail.", 409);
      }

      if (/foreign key|vinculad|constraint/i.test(message)) {
        throw new ApiError(
          operation === "delete"
            ? "Este cadastro está vinculado a outros registros e não pode ser excluído."
            : "Confira os vínculos informados no cadastro.",
          409,
        );
      }

      throw new ApiError(
        "Não foi possível concluir a operação na API. Tente novamente.",
        502,
      );
    }

    return result;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      "Não foi possível conectar à API. Tente novamente em instantes.",
      503,
    );
  }
}

export async function dynamicRead<T>(
  table: ApiTable,
  options: ApiReadOptions = {},
): Promise<ApiReadResult<T>> {
  const data = await dynamicRequest("read", table, {
    version: API_CONFIG.DEFAULT_API_VERSION,
    select: [],
    ...options,
  });

  if (
    !Array.isArray(data.result) ||
    data.result.some(
      (record) =>
        !record || typeof record !== "object" || Array.isArray(record),
    ) ||
    typeof data.total !== "number" ||
    !Number.isSafeInteger(data.total) ||
    data.total < 0
  ) {
    throw new ApiError(
      "A API retornou uma resposta inválida. Tente novamente.",
      502,
    );
  }

  return { result: data.result as T[], total: data.total };
}

export function assertSameOrigin(request: Request): void {
  const origin = request.headers.get("origin");
  if (!origin) return;

  try {
    const host =
      request.headers.get("x-forwarded-host") ||
      request.headers.get("host") ||
      new URL(request.url).host;
    const originUrl = new URL(origin);

    if (
      ["http:", "https:"].includes(originUrl.protocol) &&
      originUrl.host === host
    )
      return;
  } catch {
    throw new ApiError("Esta solicitação não é permitida.", 403);
  }

  throw new ApiError("Esta solicitação não é permitida.", 403);
}

export function errorResponse(error: unknown): Response {
  if (error instanceof ApiError) {
    return Response.json(
      { message: error.message, fields: error.fields },
      {
        status: error.status,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }

  return Response.json(
    {
      message:
        error instanceof SyntaxError
          ? "Os dados enviados são inválidos."
          : "Não foi possível concluir a operação. Tente novamente.",
    },
    { status: error instanceof SyntaxError ? 400 : 500 },
  );
}
