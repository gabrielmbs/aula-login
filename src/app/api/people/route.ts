import { ApiError, assertSameOrigin, errorResponse } from "@/lib/server/api";
import { getPeople, savePerson } from "@/lib/server/people";

export async function GET(request: Request) {
  try {
    const params = new URL(request.url).searchParams;
    const status = params.get("status") || "all";
    const page = Number(params.get("page") || 1);
    const search = params.get("search") || "";

    if (
      !["all", "active", "inactive"].includes(status) ||
      !Number.isSafeInteger(page) ||
      page < 1 ||
      page > 100000 ||
      search.length > 100
    ) {
      throw new ApiError("Os filtros informados são inválidos.", 400);
    }

    const data = await getPeople({
      search,
      page,
      status: status as "all" | "active" | "inactive",
    });
    return Response.json(data, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    await savePerson(await request.json());
    return Response.json(
      { message: "Pessoa cadastrada com sucesso." },
      { status: 201 },
    );
  } catch (error) {
    return errorResponse(error);
  }
}
