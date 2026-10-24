import type { PersonStatus } from "@/types/person.types";

export function StatusBadge({ status }: { status: PersonStatus }) {
  return (
    <span className={`status-badge status-badge--${status}`}>
      {status === "active" ? "Ativo" : "Inativo"}
    </span>
  );
}
