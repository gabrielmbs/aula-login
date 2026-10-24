"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Bell,
  BellOff,
  House,
  LoaderCircle,
  LogOut,
  Menu,
  UsersRound,
  X,
} from "lucide-react";
import { Brand } from "@/components/Brand";
import { Button } from "@/components/ui/button";
import { getInitials } from "@/lib/people";
import type { SessionUser } from "@/types/auth.types";

export function AppShell({
  user,
  dateLabel,
  greeting,
  children,
}: {
  user: SessionUser;
  dateLabel: string;
  greeting: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  const isPeople = pathname.startsWith("/dashboard/pessoas");
  const isForm = isPeople && pathname !== "/dashboard/pessoas";
  const title = isForm
    ? pathname.endsWith("/nova")
      ? "Nova pessoa"
      : "Editar pessoa"
    : isPeople
      ? "Pessoas"
      : `${greeting}, ${user.name.trim().split(/\s+/)[0]}`;

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setMenuOpen(false);
      const notifications = document.getElementById("notifications");

      if (notifications?.matches(":popover-open")) {
        notifications.hidePopover();
        document
          .querySelector<HTMLButtonElement>('[popovertarget="notifications"]')
          ?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  async function logout() {
    if (loggingOut) return;
    setLoggingOut(true);
    setLogoutError("");

    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) throw new Error();
      router.replace("/login");
      router.refresh();
    } catch {
      setLogoutError("Não foi possível sair. Tente novamente.");
      setLoggingOut(false);
    }
  }

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Ir para o conteúdo
      </a>
      {menuOpen && (
        <button
          className="sidebar-backdrop"
          aria-label="Fechar menu"
          onClick={() => setMenuOpen(false)}
        />
      )}
      <aside
        id="app-sidebar"
        className={`sidebar${menuOpen ? " sidebar--open" : ""}`}
        aria-label="Menu principal"
      >
        <div className="sidebar-brand">
          <Brand />
        </div>
        <nav className="sidebar-nav" aria-label="Navegação">
          <Link
            className={`nav-link${!isPeople ? " nav-link--active" : ""}`}
            href="/dashboard"
            aria-current={!isPeople ? "page" : undefined}
            onClick={() => setMenuOpen(false)}
          >
            <House size={18} strokeWidth={1.8} />
            <span>Visão geral</span>
          </Link>
          <Link
            className={`nav-link${isPeople ? " nav-link--active" : ""}`}
            href="/dashboard/pessoas"
            aria-current={isPeople ? "page" : undefined}
            onClick={() => setMenuOpen(false)}
          >
            <UsersRound size={18} strokeWidth={1.8} />
            <span>Pessoas</span>
          </Link>
        </nav>
        <div className="sidebar-footer">
          {logoutError && (
            <p className="sidebar-error" role="alert">
              {logoutError}
            </p>
          )}
          <div className="profile">
            <span className="profile-avatar" aria-hidden="true">
              {getInitials(user.name)}
            </span>
            <div className="profile-details">
              <strong title={user.name}>{user.name}</strong>
              <span>{user.role}</span>
            </div>
            <button
              className="logout-button"
              onClick={logout}
              disabled={loggingOut}
              title="Sair da conta"
              aria-label="Sair da conta"
            >
              {loggingOut ? (
                <LoaderCircle className="spin" size={19} />
              ) : (
                <LogOut size={19} />
              )}
            </button>
          </div>
        </div>
      </aside>
      <div className="app-workspace">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="mobile-menu-button icon-button"
              aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
              aria-expanded={menuOpen}
              aria-controls="app-sidebar"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="topbar-titles">
              <span>
                {isForm
                  ? "CADASTROS / PESSOAS"
                  : isPeople
                    ? "CADASTROS"
                    : dateLabel}
              </span>
              <strong>{title}</strong>
            </div>
          </div>
          <Button
            variant="outline"
            size="icon"
            className="notification-button"
            popoverTarget="notifications"
            aria-label="Notificações"
            title="Notificações"
          >
            <Bell size={17} strokeWidth={1.6} />
          </Button>
          <div
            id="notifications"
            popover="auto"
            className="notifications-popover"
          >
            <h2>Notificações</h2>
            <BellOff size={25} strokeWidth={1.4} />
            <strong>Você está em dia</strong>
            <p>Nenhuma nova notificação por aqui.</p>
          </div>
        </header>
        <main id="main-content" className="page-content" tabIndex={-1}>
          {children}
        </main>
      </div>
    </div>
  );
}
