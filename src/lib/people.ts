import type { ApiCondition, ApiReadOptions } from "../types/api.types";
import type {
  ApiPerson,
  Person,
  PersonErrors,
  PersonInput,
  PersonStatus,
} from "../types/person.types";

export const PEOPLE_PAGE_SIZE = 5;

export const PERSON_COLUMNS = [
  "id",
  "nome_completo",
  "cpf",
  "data_nascimento",
  "email",
  "telefone",
  "id_situacao_cadastro",
  "criado_em",
  "id_genero",
  "deficiencia",
  "deficiencia_descricao",
  "tamanho_camisa",
];

export function getInitials(name: string): string {
  const names = name.trim().split(/\s+/).filter(Boolean);

  if (!names.length) return "?";
  if (names.length === 1) return names[0].slice(0, 2).toUpperCase();

  return `${names[0][0]}${names.at(-1)?.[0] ?? ""}`.toUpperCase();
}

export function formatCpf(value: string): string {
  return value
    .replace(/\D/g, "")
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);

  if (!digits) return "";
  if (digits.length <= 2) return `(${digits}`;

  const local = digits.slice(2);
  const splitAt = local.length > 8 ? 5 : 4;
  const number =
    local.length > splitAt
      ? `${local.slice(0, splitAt)}-${local.slice(splitAt)}`
      : local;

  return `(${digits.slice(0, 2)}) ${number}`;
}

function isValidCpf(value: string): boolean {
  const digits = value.replace(/\D/g, "");

  if (!/^\d{11}$/.test(digits) || /^(\d)\1{10}$/.test(digits)) return false;

  for (const length of [9, 10]) {
    let sum = 0;

    for (let index = 0; index < length; index++) {
      sum += Number(digits[index]) * (length + 1 - index);
    }

    const remainder = (sum * 10) % 11;
    if ((remainder === 10 ? 0 : remainder) !== Number(digits[length]))
      return false;
  }

  return true;
}

export function validatePerson(person: PersonInput): PersonErrors {
  const errors: PersonErrors = {};

  if (person.name.trim().length < 3 || person.name.trim().length > 150) {
    errors.name = "Informe o nome completo, com 3 a 150 caracteres.";
  }

  if (!isValidCpf(person.cpf)) errors.cpf = "Informe um CPF válido.";

  const emailParts = person.email.split("@");
  const domainParts = emailParts[1]?.split(".") ?? [];
  const localPart = emailParts[0];
  const validDomainLabel = /^[a-z\d](?:[a-z\d-]{0,61}[a-z\d])?$/i;

  if (
    person.email.length > 254 ||
    emailParts.length !== 2 ||
    !localPart ||
    localPart.length > 64 ||
    !/^[a-z\d!#$%&'*+/=?^_`{|}~.-]+$/i.test(localPart) ||
    localPart.startsWith(".") ||
    localPart.endsWith(".") ||
    localPart.includes("..") ||
    domainParts.length < 2 ||
    domainParts.some((part) => !validDomainLabel.test(part))
  ) {
    errors.email = "Informe um e-mail válido.";
  }

  if (person.phone && !/^\d{10,11}$/.test(person.phone.replace(/\D/g, ""))) {
    errors.phone = "Informe um telefone com DDD.";
  }

  if (person.birthDate) {
    const date = new Date(`${person.birthDate}T00:00:00Z`);
    const { today } = getReportingDates();

    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(person.birthDate) ||
      Number.isNaN(date.getTime()) ||
      date.toISOString().slice(0, 10) !== person.birthDate ||
      person.birthDate > today ||
      person.birthDate < "1900-01-01"
    ) {
      errors.birthDate = "Informe uma data de nascimento válida.";
    }
  }

  if (person.status !== "active" && person.status !== "inactive") {
    errors.status = "Selecione um status válido.";
  }

  if (
    person.genderId === null ||
    !Number.isSafeInteger(person.genderId) ||
    person.genderId < 1
  ) {
    errors.genderId = "Selecione um gênero.";
  }

  if (typeof person.disability !== "boolean") {
    errors.disability = "Informe se a pessoa possui deficiência.";
  }

  if (person.disability && !person.disabilityDescription.trim()) {
    errors.disabilityDescription = "Descreva a deficiência.";
  }

  if (person.disability && person.disabilityDescription.trim().length > 255) {
    errors.disabilityDescription = "Use no máximo 255 caracteres.";
  }

  if (!/^[a-z\d-]{1,10}$/i.test(person.shirtSize.trim())) {
    errors.shirtSize = "Informe o tamanho da camisa, com até 10 caracteres.";
  }

  return errors;
}

export function toPerson(record: ApiPerson): Person {
  if (!Number.isSafeInteger(Number(record.id)) || Number(record.id) < 1) {
    throw new Error("A API retornou um registro de pessoa inválido.");
  }

  return {
    id: Number(record.id),
    name: String(record.nome_completo ?? ""),
    cpf: formatCpf(String(record.cpf ?? "")),
    birthDate: record.data_nascimento?.slice(0, 10) ?? "",
    email: String(record.email ?? ""),
    phone: formatPhone(String(record.telefone ?? "")),
    status: Number(record.id_situacao_cadastro) === 1 ? "active" : "inactive",
    createdAt: record.criado_em ?? null,
    genderId: record.id_genero == null ? null : Number(record.id_genero),
    disability:
      record.deficiencia == null ? null : Number(record.deficiencia) === 1,
    disabilityDescription: record.deficiencia_descricao ?? "",
    shirtSize: record.tamanho_camisa ?? "",
  };
}

export function buildPeopleQuery({
  search = "",
  status = "all",
  page = 1,
}: {
  search?: string;
  status?: PersonStatus | "all";
  page?: number;
}): ApiReadOptions {
  const conditions: ApiCondition[] = [];
  const term = search
    .trim()
    .slice(0, 100)
    .replace(/[\\%_]/g, "\\$&");
  const currentPage = Number.isSafeInteger(page) && page > 0 ? page : 1;

  if (term) {
    conditions.push({
      logic: "OR",
      conditions: [
        { column: "nome_completo", operator: "LIKE", value: `%${term}%` },
        { column: "email", operator: "LIKE", value: `%${term}%` },
      ],
    });
  }

  if (status !== "all") {
    conditions.push({
      column: "id_situacao_cadastro",
      operator: "=",
      value: status === "active" ? 1 : 2,
    });
  }

  return {
    select: PERSON_COLUMNS,
    where: conditions.length ? { logic: "AND", conditions } : undefined,
    order_by: [
      { column: "criado_em", direction: "DESC" },
      { column: "id", direction: "DESC" },
    ],
    limit: PEOPLE_PAGE_SIZE,
    offset: (currentPage - 1) * PEOPLE_PAGE_SIZE,
  };
}

export function buildPersonPayload(person: PersonInput) {
  return {
    nome_completo: person.name.trim(),
    cpf: person.cpf.replace(/\D/g, ""),
    data_nascimento: person.birthDate || null,
    email: person.email.trim().toLowerCase(),
    telefone: person.phone.replace(/\D/g, "") || null,
    id_situacao_cadastro: person.status === "active" ? 1 : 2,
    id_genero: person.genderId,
    deficiencia: person.disability ? 1 : 0,
    deficiencia_descricao: person.disability
      ? person.disabilityDescription.trim()
      : "",
    tamanho_camisa: person.shirtSize.trim().toUpperCase(),
  };
}

export function isPersonInput(value: unknown): value is PersonInput {
  if (!value || typeof value !== "object") return false;

  const record = value as Record<string, unknown>;
  return (
    [
      "name",
      "cpf",
      "email",
      "phone",
      "birthDate",
      "status",
      "disabilityDescription",
      "shirtSize",
    ].every((field) => typeof record[field] === "string") &&
    (record.genderId === null || typeof record.genderId === "number") &&
    (record.disability === null || typeof record.disability === "boolean")
  );
}

export function formatDate(value: string | null): string {
  if (!value) return "Não informada";

  const date = new Date(value.slice(0, 10) + "T12:00:00Z");
  return Number.isNaN(date.getTime())
    ? "Não informada"
    : new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(date);
}

export function getReportingDates(now = new Date()) {
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
  const recent = new Date(`${today}T12:00:00Z`);
  recent.setUTCDate(recent.getUTCDate() - 6);

  return {
    today,
    monthStart: `${today.slice(0, 7)}-01`,
    recentStart: recent.toISOString().slice(0, 10),
  };
}
