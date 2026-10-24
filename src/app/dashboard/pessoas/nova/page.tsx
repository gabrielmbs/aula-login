import type { Metadata } from "next";
import { PersonForm } from "@/components/people/PersonForm";
import { DataError } from "@/components/ui/DataError";
import { ApiError } from "@/lib/server/api";
import { getGenders } from "@/lib/server/people";
import { requirePageSession } from "@/lib/server/session";
import type { Gender } from "@/types/person.types";

export const metadata: Metadata = { title: "Nova pessoa" };

export default async function NewPersonPage() {
  await requirePageSession();
  let genders: Gender[];

  try {
    genders = await getGenders();
  } catch (error) {
    return (
      <DataError
        message={
          error instanceof ApiError
            ? error.message
            : "Não foi possível carregar as opções do cadastro."
        }
      />
    );
  }

  return <PersonForm genders={genders} />;
}
