import { assertSameOrigin, errorResponse } from "@/lib/server/api";
import { destroySession } from "@/lib/server/session";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    await destroySession();
    return Response.json({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}
