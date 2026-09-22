"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { BODY_TYPES } from "@/lib/constants";

/**
 * Hero quick-search. Deliberately plain GET-style params so the resulting URL
 * is shareable and the inventory page stays the single source of truth for
 * filtering.
 */
export function QuickSearch({
  makes,
  maxPrice,
  locations,
}: {
  makes: string[];
  maxPrice: number;
  locations: string[];
}) {
  const router = useRouter();
  const [make, setMake] = useState("");
  const [bodyType, setBodyType] = useState("");
  const [location, setLocation] = useState("");
  const [priceMax, setPriceMax] = useState("");

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (make) params.set("make", make);
    if (bodyType) params.set("bodyType", bodyType);
    if (location) params.set("location", location);
    if (priceMax) params.set("priceMax", priceMax);
    router.push(`/inventory${params.size > 0 ? `?${params}` : ""}`);
  }

  const selectClass =
    "h-12 w-full cursor-pointer appearance-none rounded-xl border border-white/15 bg-white/10 px-4 text-sm font-medium text-white backdrop-blur-sm transition-colors outline-none hover:bg-white/15 focus:border-brand-400";

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl border border-white/15 bg-white/5 p-3 backdrop-blur-md sm:p-4"
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1.1fr_1fr_1fr_auto]">
        <label className="sr-only" htmlFor="qs-make">
          Brand
        </label>
        <select
          id="qs-make"
          value={make}
          onChange={(e) => setMake(e.target.value)}
          className={selectClass}
        >
          <option value="" className="text-ink-900">
            Any brand
          </option>
          {makes.map((m) => (
            <option key={m} value={m} className="text-ink-900">
              {m}
            </option>
          ))}
        </select>

        <label className="sr-only" htmlFor="qs-body">
          Vehicle type
        </label>
        <select
          id="qs-body"
          value={bodyType}
          onChange={(e) => setBodyType(e.target.value)}
          className={selectClass}
        >
          <option value="" className="text-ink-900">
            Any type
          </option>
          {BODY_TYPES.map((b) => (
            <option key={b} value={b} className="text-ink-900">
              {b}
            </option>
          ))}
        </select>

        <label className="sr-only" htmlFor="qs-price">
          Maximum price
        </label>
        <select
          id="qs-price"
          value={priceMax}
          onChange={(e) => setPriceMax(e.target.value)}
          className={selectClass}
        >
          <option value="" className="text-ink-900">
            Any budget
          </option>
          {[15000000, 25000000, 50000000, 80000000, 120000000].map((amount) => (
            <option key={amount} value={amount} className="text-ink-900">
              Up to {new Intl.NumberFormat("en-NG", { notation: "compact" }).format(amount)}
            </option>
          ))}
          {maxPrice > 120000000 && (
            <option value={maxPrice} className="text-ink-900">
              Up to the top of our range
            </option>
          )}
        </select>

        <button
          type="submit"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-brand-500 px-7 text-sm font-semibold text-white shadow-[0_12px_28px_-12px_rgba(0,153,255,0.9)] transition-colors hover:bg-brand-600"
        >
          <Icon name="search" className="h-4 w-4" />
          Search
        </button>
      </div>

      {locations.length > 1 && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-xs text-white/45">Popular:</span>
          {locations.slice(0, 4).map((loc) => (
            <button
              key={loc}
              type="button"
              onClick={() => router.push(`/inventory?location=${encodeURIComponent(loc)}`)}
              className="rounded-full border border-white/15 px-3 py-1 text-xs text-white/70 transition-colors hover:border-brand-400 hover:text-white"
            >
              {loc}
            </button>
          ))}
        </div>
      )}
    </form>
  );
}
