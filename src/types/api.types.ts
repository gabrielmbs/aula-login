export type ApiCondition =
  | { column: string; operator: string; value?: string | number | null }
  | { logic: "AND" | "OR"; conditions: ApiCondition[] };

export interface ApiReadOptions {
  select?: string[];
  where?: { logic: "AND" | "OR"; conditions: ApiCondition[] };
  order_by?: { column: string; direction: "ASC" | "DESC" }[];
  limit?: number;
  offset?: number;
}

export interface ApiReadResult<T> {
  result: T[];
  total: number;
}
