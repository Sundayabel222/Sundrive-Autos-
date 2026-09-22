import { Icon } from "@/components/ui/icon";

/**
 * Inventory search box.
 *
 * Plain GET form, so it works without JavaScript and every result set has a
 * shareable URL. The current filters ride along as hidden inputs — changing the
 * search term must not silently drop them.
 */
export function InventorySearch({
  defaultValue,
  params,
}: {
  defaultValue?: string;
  /** Every other active filter, preserved across the search. */
  params: Record<string, string>;
}) {
  return (
    <form action="/inventory" className="flex w-full gap-2">
      {Object.entries(params).map(([key, value]) => (
        <input key={key} type="hidden" name={key} value={value} />
      ))}

      <div className="relative flex-1">
        <Icon
          name="search"
          className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-ink-400"
        />
        <input
          type="search"
          name="q"
          defaultValue={defaultValue}
          placeholder="Search by make, model or year…"
          aria-label="Search inventory"
          className="h-12 w-full rounded-xl border border-ink-200 bg-white pr-4 pl-11 text-[0.9375rem] text-ink-900 transition-colors placeholder:text-ink-300 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 focus:outline-none"
        />
      </div>

      <button
        type="submit"
        className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-brand-500 px-6 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
      >
        <span className="hidden sm:inline">Search</span>
        <Icon name="arrowRight" className="h-4 w-4 sm:hidden" />
      </button>
    </form>
  );
}
