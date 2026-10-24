import type {
  PeoplePage,
  PersonErrors,
  PersonInput,
  PersonStatus,
} from "@/types/person.types";

export class ServiceError extends Error {
  status: number;
  fields?: PersonErrors;

  constructor(message: string, status: number, fields?: PersonErrors) {
    super(message);
    this.name = "ServiceError";
    this.status = status;
    this.fields = fields;
  }
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, { cache: "no-store", ...options });
  const data = await response.json().catch(() => null);

  if (!response.ok || !data) {
    throw new ServiceError(
      data?.message || "Não foi possível concluir a operação. Tente novamente.",
      response.status,
      data?.fields,
    );
  }

  return data as T;
}

export class PeopleService {
  static list(
    filters: { search: string; status: PersonStatus | "all"; page: number },
    signal?: AbortSignal,
  ) {
    const params = new URLSearchParams({
      ...filters,
      page: String(filters.page),
    });
    return request<PeoplePage>(`/api/people?${params}`, { signal });
  }

  static save(person: PersonInput, id?: number) {
    return request<{ message: string }>(
      id ? `/api/people/${id}` : "/api/people",
      {
        method: id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(person),
      },
    );
  }

  static delete(id: number) {
    return request<{ message: string }>(`/api/people/${id}`, {
      method: "DELETE",
    });
  }
}
