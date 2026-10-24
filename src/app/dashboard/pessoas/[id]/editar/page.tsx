import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PersonForm } from "@/components/people/PersonForm";
import { DataError } from "@/components/ui/DataError";
import { ApiError } from "@/lib/server/api";
import { getGenders, getPerson } from "@/lib/server/people";
import { requirePageSession } from "@/lib/server/session";
import type { Gender, Person } from "@/types/person.types";

export const metadata: Metadata = { title: "Editar pessoa" };

export default async function EditPersonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePageSession();
  const id = Number((await params).id);
  if (!Number.isSafeInteger(id) || id < 1) notFound();
  let person: Person;
  let genders: Gender[];

  try {
    [person, genders] = await Promise.all([getPerson(id), getGenders()]);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    return (
      <>
        <Link className="back-link" href="/dashboard/pessoas">
          <ArrowLeft size={17} />
          Voltar para pessoas
        </Link>
        <DataError
          message={
            error instanceof ApiError
              ? error.message
              : "Não foi possível carregar este cadastro."
          }
        />
      </>
    );
  }

  return <PersonForm person={person} genders={genders} />;
}
