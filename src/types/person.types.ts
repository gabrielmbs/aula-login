export type PersonStatus = "active" | "inactive";

export interface PersonInput {
  name: string;
  cpf: string;
  birthDate: string;
  email: string;
  phone: string;
  status: PersonStatus;
  genderId: number | null;
  disability: boolean | null;
  disabilityDescription: string;
  shirtSize: string;
}

export interface Person extends PersonInput {
  id: number;
  createdAt: string | null;
}

export type PersonErrors = Partial<Record<keyof PersonInput, string>>;

export interface ApiPerson {
  id: number;
  nome_completo: string;
  cpf: string | null;
  data_nascimento: string | null;
  email: string | null;
  telefone: string | null;
  id_situacao_cadastro: number;
  criado_em: string | null;
  id_genero: number | null;
  deficiencia: number | null;
  deficiencia_descricao: string | null;
  tamanho_camisa: string | null;
}

export interface Gender {
  id: number;
  descricao: string;
}

export interface PeoplePage {
  people: Person[];
  total: number;
  page: number;
  pageSize: number;
}

export interface DashboardData {
  total: number;
  thisMonth: number;
  recent: number;
  completePercentage: number;
  people: Person[];
}
