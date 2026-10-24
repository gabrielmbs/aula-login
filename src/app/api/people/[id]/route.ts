import { ApiError, assertSameOrigin, errorResponse } from "@/lib/server/api";
import { deletePerson, getPerson, savePerson } from "@/lib/server/people";

type Context = { params: Promise<{ id: string }> };

async function getId(context: Context): Promise<number> {
  const id = Number((await context.params).id);
  if (!Number.isSafeInteger(id) || id < 1)
    throw new ApiError("Identificador inválido.", 400);
  return id;
}

export async function GET(_request: Request, context: Context) {
  try {
    return Response.json(await getPerson(await getId(context)), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PUT(request: Request, context: Context) {
  try {
    assertSameOrigin(request);
    await savePerson(await request.json(), await getId(context));
    return Response.json({ message: "Alterações salvas com sucesso." });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(request: Request, context: Context) {
  try {
    assertSameOrigin(request);
    await deletePerson(await getId(context));
    return Response.json({ message: "Pessoa excluída com sucesso." });
  } catch (error) {
    return errorResponse(error);
  }
}
