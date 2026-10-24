"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  LoaderCircle,
  Pencil,
  RotateCcw,
  Search,
  Trash2,
  UsersRound,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataError } from "@/components/ui/DataError";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { usePeople } from "@/hooks/usePeople";
import { formatDate } from "@/lib/people";
import type { PeoplePage, Person, PersonStatus } from "@/types/person.types";
import { DeletePersonDialog } from "./DeletePersonDialog";

export function PeopleList({
  initialData,
  initialError,
  initialNotice = "",
}: {
  initialData: PeoplePage | null;
  initialError?: string;
  initialNotice?: string;
}) {
  const router = useRouter();
  const { data, error, isLoading, filters, updateFilters, reload } = usePeople(
    initialData,
    initialError,
  );
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [notice, setNotice] = useState(initialNotice);
  const totalPages = Math.max(
    1,
    Math.ceil((data?.total ?? 0) / (data?.pageSize ?? 5)),
  );
  const firstPage = Math.max(1, Math.min(filters.page - 1, totalPages - 2));
  const pages = Array.from(
    { length: Math.min(3, totalPages) },
    (_, index) => firstPage + index,
  );

  return (
    <>
      {notice && (
        <div className="success-notice" role="status">
          <CheckCircle2 size={18} />
          <span>{notice}</span>
          <button
            aria-label="Fechar aviso"
            title="Fechar aviso"
            onClick={() => {
              setNotice("");
              if (initialNotice)
                router.replace("/dashboard/pessoas", { scroll: false });
            }}
          >
            <X size={17} />
          </button>
        </div>
      )}
      <section className="people-panel" aria-label="Lista de pessoas">
        <div className="people-filters">
          <div className="search-field">
            <Search size={17} strokeWidth={1.7} aria-hidden="true" />
            <Input
              type="search"
              aria-label="Buscar por nome ou e-mail"
              placeholder="Buscar por nome ou e-mail"
              maxLength={100}
              value={filters.search}
              onChange={(event) =>
                updateFilters({ search: event.target.value, page: 1 })
              }
            />
            {isLoading && (
              <LoaderCircle
                size={16}
                className="search-loading spin"
                aria-label="Buscando"
              />
            )}
          </div>
          <div className="select-wrap">
            <select
              className="select-field"
              aria-label="Filtrar por status"
              value={filters.status}
              onChange={(event) =>
                updateFilters({
                  status: event.target.value as PersonStatus | "all",
                  page: 1,
                })
              }
            >
              <option value="all">Todos os status</option>
              <option value="active">Ativo</option>
              <option value="inactive">Inativo</option>
            </select>
            <ChevronDown size={16} aria-hidden="true" />
          </div>
          <Button
            variant="outline"
            className="clear-filters"
            onClick={() =>
              updateFilters({ search: "", status: "all", page: 1 })
            }
          >
            <RotateCcw size={15} />
            Limpar filtros
          </Button>
        </div>
        {error ? (
          <DataError message={error} onRetry={reload} />
        ) : data?.people.length ? (
          <>
            <div
              className={`table-scroll${isLoading ? " table-scroll--loading" : ""}`}
              role="region"
              aria-label="Pessoas cadastradas"
              tabIndex={0}
              aria-busy={isLoading}
            >
              <table className="people-table">
                <thead>
                  <tr>
                    <th scope="col">NOME</th>
                    <th scope="col">CONTATO</th>
                    <th scope="col">DOCUMENTO</th>
                    <th scope="col">STATUS</th>
                    <th scope="col">CADASTRO</th>
                    <th scope="col">
                      <span className="sr-only">Ações</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.people.map((person) => (
                    <tr key={person.id}>
                      <td>
                        <strong className="person-name">
                          {person.name || "Nome não informado"}
                        </strong>
                        <span className="record-id">
                          #{String(person.id).padStart(4, "0")}
                        </span>
                      </td>
                      <td className="contact-cell">
                        <span title={person.email}>
                          {person.email || "E-mail não informado"}
                        </span>
                        <small>
                          {person.phone || "Telefone não informado"}
                        </small>
                      </td>
                      <td className="document-cell">
                        {person.cpf || "Não informado"}
                      </td>
                      <td>
                        <StatusBadge status={person.status} />
                      </td>
                      <td className="date-cell">
                        {formatDate(person.createdAt)}
                      </td>
                      <td className="row-actions">
                        <Link
                          className="row-action"
                          href={`/dashboard/pessoas/${person.id}/editar`}
                          aria-label={`Editar ${person.name}`}
                        >
                          <Pencil size={13} />
                          Editar
                        </Link>
                        <button
                          className="row-action row-action--delete"
                          disabled={isLoading}
                          onClick={() => setSelectedPerson(person)}
                          aria-label={`Excluir ${person.name}`}
                        >
                          <Trash2 size={13} />
                          Excluir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="table-footer">
              <p>
                Mostrando {(data.page - 1) * data.pageSize + 1} a{" "}
                {Math.min(data.page * data.pageSize, data.total)} de{" "}
                {data.total.toLocaleString("pt-BR")} registros
              </p>
              <nav className="pagination" aria-label="Paginação de pessoas">
                <button
                  className="page-button"
                  aria-label="Página anterior"
                  title="Página anterior"
                  disabled={filters.page <= 1 || isLoading}
                  onClick={() => updateFilters({ page: filters.page - 1 })}
                >
                  <ChevronLeft size={15} />
                </button>
                {pages.map((page) => (
                  <button
                    key={page}
                    className={`page-button${page === filters.page ? " page-button--active" : ""}`}
                    aria-label={`Página ${page}`}
                    aria-current={page === filters.page ? "page" : undefined}
                    disabled={isLoading}
                    onClick={() => {
                      if (page !== filters.page) updateFilters({ page });
                    }}
                  >
                    {page}
                  </button>
                ))}
                <button
                  className="page-button"
                  aria-label="Próxima página"
                  title="Próxima página"
                  disabled={filters.page >= totalPages || isLoading}
                  onClick={() => updateFilters({ page: filters.page + 1 })}
                >
                  <ChevronRight size={15} />
                </button>
              </nav>
            </div>
          </>
        ) : isLoading ? (
          <div className="table-loading" role="status">
            <LoaderCircle size={24} className="spin" />
            <span>Carregando pessoas...</span>
          </div>
        ) : (
          <div className="data-state">
            <UsersRound size={30} strokeWidth={1.5} />
            <h2>
              {filters.search || filters.status !== "all"
                ? "Nenhuma pessoa encontrada"
                : "Nenhuma pessoa cadastrada"}
            </h2>
            <p>
              {filters.search || filters.status !== "all"
                ? "Não há registros para os filtros selecionados."
                : "Os cadastros aparecerão aqui."}
            </p>
            {filters.search || filters.status !== "all" ? (
              <Button
                variant="outline"
                onClick={() =>
                  updateFilters({ search: "", status: "all", page: 1 })
                }
              >
                <RotateCcw size={16} />
                Limpar filtros
              </Button>
            ) : (
              <Link href="/dashboard/pessoas/nova" className="text-link">
                Cadastrar primeira pessoa
                <ChevronRight size={16} />
              </Link>
            )}
          </div>
        )}
      </section>
      {selectedPerson && (
        <DeletePersonDialog
          person={selectedPerson}
          onClose={() => setSelectedPerson(null)}
          onDeleted={() => {
            setSelectedPerson(null);
            setNotice("Pessoa excluída com sucesso.");
            reload();
            router.refresh();
          }}
        />
      )}
    </>
  );
}
