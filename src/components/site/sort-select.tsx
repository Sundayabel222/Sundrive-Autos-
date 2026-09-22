"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Icon } from "@/components/ui/icon";
import { INVENTORY_SORTS } from "@/lib/constants";

/**
 * Sort control. Applying a sort immediately (rather than on submit) matches how
 * people expect a listing page to behave, and `page` is dropped so the visitor
 * doesn't land on an empty page 4 with the new ordering.
 */
export function SortSelect({
  value,
  params,
}: {
  value: string;
  params: Record<string, string>;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function onChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const next = new URLSearchParams(params);
    const sort = event.target.value;

    if (sort && sort !== "newest") {
      next.set("sort", sort);
    } else {
      next.delete("sort");
    }
    next.delete("page");

    const query = next.toString();
    startTransition(() => router.push(query ? `/inventory?${query}` : "/inventory"));
  }

  return (
    <div className="relative shrink-0">
      <Icon
        name="filter"
        className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-ink-400"
      />
      <select
        value={value}
        onChange={onChange}
        aria-label="Sort vehicles"
        disabled={pending}
        className="h-12 cursor-pointer appearance-none rounded-xl border border-ink-200 bg-white pr-10 pl-10 text-sm font-medium text-ink-700 transition-colors hover:border-ink-300 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 focus:outline-none disabled:opacity-60"
      >
        {INVENTORY_SORTS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <Icon
        name="chevronDown"
        className="pointer-events-none absolute top-1/2 right-3.5 h-4 w-4 -translate-y-1/2 text-ink-400"
      />
    </div>
  );
}
