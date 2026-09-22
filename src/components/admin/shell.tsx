"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { logout } from "@/actions/auth";
import { Logo } from "@/components/site/logo";
import { Icon, type IconName } from "@/components/ui/icon";
import { cn } from "@/lib/cn";

/**
 * Admin console chrome: persistent sidebar on desktop, off-canvas drawer on
 * mobile, plus the staff/logout bar. A client component because it owns the
 * drawer state and highlights the active route — the pages it wraps stay
 * server-rendered and are passed straight through as children.
 */

export type AdminCounts = {
  pendingInspections: number;
  newSourcing: number;
  newMessages: number;
};

type NavItem = {
  label: string;
  href: string;
  icon: IconName;
  badge?: keyof AdminCounts;
  /** Overview must match exactly, or it would light up on every child route. */
  exact?: boolean;
};

const NAV: NavItem[] = [
  { label: "Overview", href: "/admin", icon: "dashboard", exact: true },
  { label: "Inventory", href: "/admin/inventory", icon: "car" },
  { label: "Inspections", href: "/admin/inspections", icon: "calendar", badge: "pendingInspections" },
  { label: "Sourcing", href: "/admin/sourcing", icon: "search", badge: "newSourcing" },
  { label: "Messages", href: "/admin/messages", icon: "inbox", badge: "newMessages" },
  { label: "Customers", href: "/admin/customers", icon: "users" },
  { label: "Analytics", href: "/admin/analytics", icon: "gauge" },
];

export function AdminShell({
  session,
  counts,
  children,
}: {
  session: { name: string; email: string; role: string };
  counts: AdminCounts;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // The drawer is closed from the link's own click handler rather than an effect
  // on `pathname`, so navigating never triggers a cascading re-render.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const isActive = (item: NavItem) =>
    item.exact
      ? pathname === item.href
      : pathname === item.href || pathname.startsWith(`${item.href}/`);

  const current = NAV.find(isActive);
  const initials = session.name
    .split(" ")
    .map((part) => part.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen bg-ink-50">
      {/* Mobile bar */}
      <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-ink-100 bg-white px-4 lg:hidden">
        <Logo size="sm" />
        <span className="rounded-full bg-ink-100 px-2.5 py-1 text-xs font-semibold text-ink-600">
          Admin
        </span>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open dashboard menu"
          className="ml-auto grid h-10 w-10 place-items-center rounded-lg border border-ink-100 text-ink-700 transition-colors hover:bg-ink-50"
        >
          <Icon name="menu" />
        </button>
      </header>

      {/* Sidebar */}
      <aside
        aria-label="Dashboard"
        className={cn(
          "surface-dark fixed inset-y-0 left-0 z-50 flex w-64 flex-col overflow-y-auto transition-transform duration-300 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-white/10 px-5 lg:h-[4.5rem]">
          <Logo size="sm" tone="light" />
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close dashboard menu"
            className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-white/70 transition-colors hover:bg-white/10 lg:hidden"
          >
            <Icon name="close" className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-5">
          <p className="px-3 text-[0.65rem] font-semibold tracking-[0.18em] text-white/35 uppercase">
            Console
          </p>

          <ul className="mt-3 flex flex-col gap-1">
            {NAV.map((item) => {
              const active = isActive(item);
              const count = item.badge ? counts[item.badge] : 0;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                      active
                        ? "bg-brand-500 text-white shadow-[0_10px_24px_-12px_rgba(0,153,255,0.9)]"
                        : "text-white/65 hover:bg-white/8 hover:text-white",
                    )}
                  >
                    <Icon name={item.icon} className="h-[1.15rem] w-[1.15rem]" />
                    <span className="flex-1">{item.label}</span>
                    {count > 0 && (
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-xs font-bold",
                          active ? "bg-white/20 text-white" : "bg-brand-500 text-white",
                        )}
                      >
                        {count}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="mt-6 border-t border-white/10 pt-5">
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/65 transition-colors hover:bg-white/8 hover:text-white"
            >
              <Icon name="arrowUpRight" className="h-[1.15rem] w-[1.15rem]" />
              View live site
            </Link>
          </div>
        </nav>

        <div className="shrink-0 border-t border-white/10 p-4">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-500/20 text-xs font-bold text-brand-300">
              {initials || "SA"}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-white">{session.name}</span>
              <span className="block truncate text-xs text-white/45">{session.email}</span>
            </span>
          </div>

          <form action={logout} className="mt-3">
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/12 px-3 py-2.5 text-sm font-semibold text-white/75 transition-colors hover:border-white/25 hover:bg-white/8 hover:text-white"
            >
              <Icon name="logout" className="h-4 w-4" />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {open && (
        <button
          type="button"
          aria-label="Close dashboard menu"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-ink-950/60 lg:hidden"
        />
      )}

      {/* Content */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 hidden h-[4.5rem] items-center gap-4 border-b border-ink-100 bg-white/90 px-6 backdrop-blur-xl lg:flex">
          <div>
            <p className="text-[0.65rem] font-semibold tracking-[0.18em] text-ink-400 uppercase">
              {session.role === "ADMIN" ? "Administrator" : "Sales"}
            </p>
            <h1 className="font-display text-lg font-bold text-ink-900">
              {current?.label ?? "Dashboard"}
            </h1>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <span className="text-xs text-ink-400">
              Signed in as <span className="font-semibold text-ink-700">{session.email}</span>
            </span>
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-ink-200 px-4 py-2 text-xs font-semibold text-ink-700 transition-colors hover:border-ink-900"
            >
              View site
            </Link>
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
