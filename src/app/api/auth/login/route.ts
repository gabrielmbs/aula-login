import { AUTH_MESSAGES } from "@/constants/api.constants";
import {
  ApiError,
  assertSameOrigin,
  dynamicRead,
  errorResponse,
} from "@/lib/server/api";
import { createSession } from "@/lib/server/session";

interface ApiUser {
  nome_completo: string;
  email: string;
  nivel_acesso: string;
}

export async function POST(request: Request) {
  const isForm =
    request.headers.get("content-type")?.split(";")[0].trim() ===
    "application/x-www-form-urlencoded";

  try {
    assertSameOrigin(request);
    const body: unknown = isForm
      ? Object.fromEntries(await request.formData())
      : await request.json();

    if (!body || typeof body !== "object")
      throw new ApiError("Informe seu e-mail e sua senha.", 400);

    const { email, senha } = body as Record<string, unknown>;

    if (
      typeof email !== "string" ||
      !email.trim() ||
      email.length > 254 ||
      typeof senha !== "string" ||
      !senha ||
      senha.length > 256
    )
      throw new ApiError("Informe seu e-mail e sua senha.", 400);

    const data = await dynamicRead<ApiUser>("vw_usuario", {
      select: ["nome_completo", "email", "nivel_acesso"],
      where: {
        logic: "AND",
        conditions: [
          { column: "email", operator: "=", value: email.trim() },
          { column: "senha", operator: "=", value: senha },
          { column: "id_situacao_cadastro", operator: "=", value: 1 },
        ],
      },
      limit: 1,
    });
    const user = data.result[0];

    if (!user) throw new ApiError(AUTH_MESSAGES.INVALID_CREDENTIALS, 401);

    if (
      typeof user.nome_completo !== "string" ||
      typeof user.email !== "string"
    ) {
      throw new ApiError("A API retornou um usuário inválido.", 502);
    }

    const role =
      typeof user.nivel_acesso === "string" ? user.nivel_acesso : "Usuário";
    await createSession({
      name: user.nome_completo,
      email: user.email,
      role: role.charAt(0).toUpperCase() + role.slice(1).toLowerCase(),
    });

    if (isForm) {
      return new Response(null, {
        status: 303,
        headers: { Location: "/dashboard", "Cache-Control": "no-store" },
      });
    }

    return Response.json(
      {
        success: true,
        usuario: { nome_completo: user.nome_completo },
        message: `${AUTH_MESSAGES.WELCOME_PREFIX} ${user.nome_completo}`,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    if (isForm) {
      const reason =
        error instanceof ApiError && error.status === 401
          ? "credentials"
          : error instanceof ApiError && error.status === 400
            ? "input"
            : "server";

      return new Response(null, {
        status: 303,
        headers: {
          Location: `/login?error=${reason}`,
          "Cache-Control": "no-store",
        },
      });
    }

    return errorResponse(error);
  }
}
