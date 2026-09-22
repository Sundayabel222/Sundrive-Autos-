import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/cn";
import { listHref } from "@/lib/admin";

/**
 * Server-rendered list controls for the admin queues.
 *
 * Everything is a plain GET form or link carrying the other parameters through,
 * so filtering and paging work without JavaScript and every view is a shareable
 * URL.
 */

/** Search box that preserves whatever filters are already applied. */
export function AdminSearchForm({
  action,
  defaultValue,
  placeholder,
  params = {},
  label = "Search",
}: {
  action: string;
  defaultValue?: string;
  placeholder?: string;
  /** Params to carry into the submission (status, etc.). */
  params?: Record<string, string | undefined>;
  label?: string;
}) {
  return (
    <form action={action} className="flex min-w-0 flex-1 items-center gap-2">
      {Object.entries(params).map(([key, value]) =>
        value ? <input key={key} type="hidden" name={key} value={value} /> : null,
      )}

      <div className="relative min-w-0 flex-1">
        <Icon
          name="search"
          className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-ink-400"
        />
        <input
          type="search"
          name="q"
          defaultValue={defaultValue}
          placeholder={placeholder}
          aria-label={label}
          className="h-11 w-full rounded-xl border border-ink-200 bg-white pr-4 pl-10 text-sm text-ink-900 transition-colors placeholder:text-ink-300 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 focus:outline-none"
        />
      </div>

      <button
        type="submit"
        className="h-11 shrink-0 rounded-xl border border-ink-200 bg-white px-4 text-sm font-semibold text-ink-700 transition-colors hover:border-ink-900"
      >
        {label}
      </button>

      {defaultValue && (
        <Link
          href={listHref(action, params)}
          className="h-11 shrink-0 rounded-xl px-3 text-sm font-medium leading-[2.75rem] text-ink-500 transition-colors hover:text-brand-600"
        >
          Clear
        </Link>
      )}
    </form>
  );
}

export type StatusTab = { value: string; label: string; count?: number };

/** Filter chips for a status column. The empty value is "everything". */
export function StatusTabs({
  base,
  tabs,
  active,
  params = {},
}: {
  base: string;
  tabs: readonly StatusTab[];
  active?: string;
  params?: Record<string, string | undefined>;
}) {
  return (
    <nav aria-label="Filter by status" className="flex flex-wrap items-center gap-2">
      {tabs.map((tab) => {
        const isActive = (active ?? "") === tab.value;
        const value = tab.value || undefined;

        return (
          <Link
            key={tab.value || "all"}
            href={listHref(base, { ...params, status: value })}
            aria-current={isActive ? "true" : undefined}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-semibold transition-colors",
              isActive
                ? "border-ink-900 bg-ink-900 text-white"
                : "border-ink-200 bg-white text-ink-600 hover:border-ink-400",
            )}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[0.65rem] font-bold",
                  isActive ? "bg-white/20 text-white" : "bg-ink-100 text-ink-500",
                )}
              >
                {tab.count}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

/** Prev/next pager. Emits nothing when everything fits on one page. */
export function AdminPagination({
  base,
  page,
  totalPages,
  params = {},
}: {
  base: string;
  page: number;
  totalPages: number;
  params?: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) return null;

  const linkClass =
    "inline-flex h-10 items-center gap-2 rounded-xl border px-4 text-sm font-semibold transition-colors";
  const enabled = "border-ink-200 bg-white text-ink-700 hover:border-brand-300";
  const disabled = "border-ink-100 bg-ink-50 text-ink-300";

  return (
    <nav
      aria-label="Pagination"
      className="mt-6 flex items-center justify-between gap-4 border-t border-ink-100 pt-5"
    >
      {page > 1 ? (
        <Link href={listHref(base, { ...params, page: page - 1 })} rel="prev" className={cn(linkClass, enabled)}>
          <Icon name="chevronLeft" className="h-4 w-4" />
          Previous
        </Link>
      ) : (
        <span aria-disabled className={cn(linkClass, disabled)}>
          <Icon name="chevronLeft" className="h-4 w-4" />
          Previous
        </span>
      )}

      <span className="text-xs font-medium text-ink-500">
        Page <strong className="text-ink-900">{page}</strong> of {totalPages}
      </span>

      {page < totalPages ? (
        <Link href={listHref(base, { ...params, page: page + 1 })} rel="next" className={cn(linkClass, enabled)}>
          Next
          <Icon name="chevronRight" className="h-4 w-4" />
        </Link>
      ) : (
        <span aria-disabled className={cn(linkClass, disabled)}>
          Next
          <Icon name="chevronRight" className="h-4 w-4" />
        </span>
      )}
    </nav>
  );
}
