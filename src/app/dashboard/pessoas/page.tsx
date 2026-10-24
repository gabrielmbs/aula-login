import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { PeopleList } from "@/components/people/PeopleList";
import { ApiError } from "@/lib/server/api";
import { getPeople } from "@/lib/server/people";
import { requirePageSession } from "@/lib/server/session";
import type { PeoplePage } from "@/types/person.types";

export const metadata: Metadata = { title: "Pessoas" };

export default async function PeoplePage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>;
}) {
  await requirePageSession();
  const params = await searchParams;
  let data: PeoplePage | null = null;
  let error: string | undefined;

  try {
    data = await getPeople();
  } catch (failure) {
    error =
      failure instanceof ApiError
        ? failure.message
        : "Não foi possível carregar as pessoas. Tente novamente.";
  }

  const notice =
    params.success === "created"
      ? "Pessoa cadastrada com sucesso."
      : params.success === "updated"
        ? "Alterações salvas com sucesso."
        : "";

  return (
    <>
      <PageHeader
        title="Pessoas"
        description="Consulte e gerencie os registros."
        showCreate
      />
      <PeopleList
        initialData={data}
        initialError={error}
        initialNotice={notice}
      />
    </>
  );
}
