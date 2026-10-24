import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUp, Check, Clock3, UsersRound } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataError } from "@/components/ui/DataError";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDate, getInitials } from "@/lib/people";
import { ApiError } from "@/lib/server/api";
import { getDashboardData } from "@/lib/server/people";
import { requirePageSession } from "@/lib/server/session";
import type { DashboardData } from "@/types/person.types";

export const metadata: Metadata = { title: "Visão geral" };

export default async function Dashboard() {
  await requirePageSession();
  let data: DashboardData;

  try {
    data = await getDashboardData();
  } catch (error) {
    return (
      <>
        <PageHeader
          title="Visão geral"
          description="Acompanhe os principais dados do sistema."
          showCreate
        />
        <DataError
          message={
            error instanceof ApiError
              ? error.message
              : "Tente novamente em alguns instantes."
          }
        />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Visão geral"
        description="Acompanhe os principais dados do sistema."
        showCreate
      />
      <div className="stats-grid">
        <article className="stat-card">
          <span className="stat-icon stat-icon--blue">
            <UsersRound size={21} strokeWidth={1.5} />
          </span>
          <div>
            <h2>Pessoas cadastradas</h2>
            <strong>{data.total.toLocaleString("pt-BR")}</strong>
            <p className="stat-trend">
              <ArrowUp size={13} />
              {data.thisMonth.toLocaleString("pt-BR")} neste mês
            </p>
          </div>
        </article>
        <article className="stat-card">
          <span className="stat-icon stat-icon--amber">
            <Clock3 size={22} strokeWidth={1.5} />
          </span>
          <div>
            <h2>Cadastros recentes</h2>
            <strong>{data.recent.toLocaleString("pt-BR")}</strong>
            <p>Últimos 7 dias</p>
          </div>
        </article>
        <article className="stat-card">
          <span className="stat-icon stat-icon--green">
            <Check size={23} strokeWidth={1.8} />
          </span>
          <div>
            <h2>Cadastros completos</h2>
            <strong>{data.completePercentage}%</strong>
            <p>Dados pessoais e contato</p>
          </div>
        </article>
      </div>
      <section className="recent-panel" aria-labelledby="recent-heading">
        <div className="panel-heading">
          <div>
            <h2 id="recent-heading">Cadastros recentes</h2>
            <p>Últimas pessoas adicionadas.</p>
          </div>
          <Link className="text-link" href="/dashboard/pessoas">
            Ver todos
            <ArrowRight size={16} />
          </Link>
        </div>
        {data.people.length ? (
          <ul className="recent-list">
            {data.people.map((person) => (
              <li key={person.id}>
                <Link
                  className="recent-person"
                  href={`/dashboard/pessoas/${person.id}/editar`}
                >
                  <span className="person-avatar" aria-hidden="true">
                    {getInitials(person.name)}
                  </span>
                  <span className="recent-person-details">
                    <strong>{person.name || "Nome não informado"}</strong>
                    <span>{person.email || "E-mail não informado"}</span>
                  </span>
                </Link>
                <time
                  className="recent-date"
                  dateTime={person.createdAt?.slice(0, 10)}
                >
                  {formatDate(person.createdAt)}
                </time>
                <StatusBadge status={person.status} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="data-state">
            <UsersRound size={29} />
            <h2>Nenhuma pessoa cadastrada</h2>
            <p>Os novos cadastros aparecerão aqui.</p>
            <Link href="/dashboard/pessoas/nova" className="text-link">
              Cadastrar pessoa
              <ArrowRight size={16} />
            </Link>
          </div>
        )}
      </section>
    </>
  );
}
