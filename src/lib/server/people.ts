import "server-only";
import {
  buildPeopleQuery,
  buildPersonPayload,
  getReportingDates,
  isPersonInput,
  PEOPLE_PAGE_SIZE,
  PERSON_COLUMNS,
  toPerson,
  validatePerson,
} from "@/lib/people";
import type { ApiCondition } from "@/types/api.types";
import type {
  ApiPerson,
  DashboardData,
  Gender,
  PeoplePage,
  Person,
  PersonStatus,
} from "@/types/person.types";
import { ApiError, dynamicRead, dynamicRequest } from "./api";
import { requireSession } from "./session";

export async function getGenders(): Promise<Gender[]> {
  await requireSession();
  const data = await dynamicRead<Gender>("genero", {
    select: ["id", "descricao"],
    order_by: [{ column: "id", direction: "ASC" }],
    limit: 1000,
  });

  if (
    !data.result.length ||
    data.total > data.result.length ||
    data.result.some(
      (gender) =>
        !Number.isSafeInteger(gender.id) ||
        gender.id < 1 ||
        typeof gender.descricao !== "string" ||
        !gender.descricao.trim(),
    )
  ) {
    throw new ApiError("Não foi possível carregar as opções de gênero.", 502);
  }

  return data.result;
}

export async function getPeople(
  options: {
    search?: string;
    status?: PersonStatus | "all";
    page?: number;
  } = {},
): Promise<PeoplePage> {
  await requireSession();
  const query = buildPeopleQuery(options);
  const data = await dynamicRead<ApiPerson>("pessoa", query);

  return {
    people: data.result.map(toPerson),
    total: data.total,
    page: Math.floor((query.offset ?? 0) / PEOPLE_PAGE_SIZE) + 1,
    pageSize: PEOPLE_PAGE_SIZE,
  };
}

export async function getPerson(id: number): Promise<Person> {
  await requireSession();
  const data = await dynamicRead<ApiPerson>("pessoa", {
    select: PERSON_COLUMNS,
    where: {
      logic: "AND",
      conditions: [{ column: "id", operator: "=", value: id }],
    },
    limit: 1,
  });

  if (!data.result.length) throw new ApiError("Pessoa não encontrada.", 404);
  return toPerson(data.result[0]);
}

export async function savePerson(value: unknown, id?: number): Promise<void> {
  await requireSession();

  if (!isPersonInput(value))
    throw new ApiError("Confira os campos do cadastro.", 400);

  const input = {
    ...value,
    name: value.name.trim(),
    email: value.email.trim(),
  };
  const fields = validatePerson(input);

  if (Object.keys(fields).length)
    throw new ApiError("Confira os campos destacados.", 422, fields);

  const genders = await getGenders();
  if (!genders.some((gender) => gender.id === input.genderId)) {
    throw new ApiError("Confira os campos destacados.", 422, {
      genderId: "Selecione um gênero válido.",
    });
  }

  if (id) await getPerson(id);

  const payload = buildPersonPayload(input);
  const existing = await dynamicRead<{ id: number }>("pessoa", {
    select: ["id"],
    where: {
      logic: "AND",
      conditions: [{ column: "cpf", operator: "=", value: payload.cpf }],
    },
    limit: 2,
  });

  if (existing.result.some((record) => Number(record.id) !== id)) {
    throw new ApiError("Este CPF já está cadastrado.", 409, {
      cpf: "Este CPF já está cadastrado.",
    });
  }

  await dynamicRequest(
    id ? "update" : "create",
    "pessoa",
    id ? { id, ...payload } : payload,
  );
}

export async function deletePerson(id: number): Promise<void> {
  await requireSession();
  await getPerson(id);
  await dynamicRequest("delete", "pessoa", { id });
}

export async function getDashboardData(): Promise<DashboardData> {
  await requireSession();
  const { monthStart, recentStart } = getReportingDates();
  const completeConditions: ApiCondition[] = [
    "nome_completo",
    "cpf",
    "email",
    "telefone",
    "data_nascimento",
  ].map((column) => ({ column, operator: "is not null" }));

  completeConditions.push(
    ...["nome_completo", "cpf", "email", "telefone"].map((column) => ({
      column,
      operator: "!=",
      value: "",
    })),
  );

  const [all, month, recent, complete] = await Promise.all([
    dynamicRead<ApiPerson>("pessoa", {
      select: PERSON_COLUMNS,
      order_by: [
        { column: "criado_em", direction: "DESC" },
        { column: "id", direction: "DESC" },
      ],
      limit: 4,
    }),
    dynamicRead("pessoa", {
      select: ["id"],
      limit: 1,
      where: {
        logic: "AND",
        conditions: [
          { column: "criado_em", operator: ">=", value: monthStart },
        ],
      },
    }),
    dynamicRead("pessoa", {
      select: ["id"],
      limit: 1,
      where: {
        logic: "AND",
        conditions: [
          { column: "criado_em", operator: ">=", value: recentStart },
        ],
      },
    }),
    dynamicRead("pessoa", {
      select: ["id"],
      limit: 1,
      where: { logic: "AND", conditions: completeConditions },
    }),
  ]);

  return {
    total: all.total,
    thisMonth: month.total,
    recent: recent.total,
    completePercentage: all.total
      ? Math.round((complete.total / all.total) * 100)
      : 0,
    people: all.result.map(toPerson),
  };
}
