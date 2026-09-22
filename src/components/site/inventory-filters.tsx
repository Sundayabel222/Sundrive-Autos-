import { Icon } from "@/components/ui/icon";
import { BODY_TYPES, CONDITIONS, FUEL_TYPES, TRANSMISSIONS } from "@/lib/constants";
import { formatPrice } from "@/lib/format";
import type { InventoryFilters } from "@/lib/validation";

type Facets = {
  makes: string[];
  locations: string[];
  priceMin: number;
  priceMax: number;
  yearMin: number;
  yearMax: number;
};

const controlClass =
  "h-11 w-full cursor-pointer appearance-none rounded-xl border border-ink-200 bg-white px-3.5 text-sm text-ink-800 transition-colors hover:border-ink-300 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 focus:outline-none";

function FilterField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold tracking-wide text-ink-500 uppercase">{label}</span>
      {children}
    </label>
  );
}

/** Dropdown of allowed values, or the facet's own list for make/location. */
function FilterSelect({
  name,
  label,
  value,
  options,
  anyLabel,
}: {
  name: string;
  label: string;
  value?: string;
  options: readonly string[];
  anyLabel: string;
}) {
  return (
    <FilterField label={label}>
      <div className="relative">
        <select name={name} defaultValue={value ?? ""} className={`${controlClass} pr-9`}>
          <option value="">{anyLabel}</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <Icon
          name="chevronDown"
          className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-ink-400"
        />
      </div>
    </FilterField>
  );
}

/**
 * Inventory filters (PRD §6).
 *
 * A single GET form — no JavaScript required, and the resulting URL is exactly
 * what the visitor can bookmark or share. `q` and `sort` are carried through as
 * hidden inputs so applying a filter never discards the rest of the query.
 */
export function InventoryFiltersPanel({
  facets,
  filters,
  params,
}: {
  facets: Facets;
  filters: InventoryFilters;
  /** Params owned outside this form (search term, sort). */
  params: Record<string, string>;
}) {
  const activeCount = [
    filters.make,
    filters.bodyType,
    filters.fuelType,
    filters.transmission,
    filters.condition,
    filters.location,
    filters.priceMin,
    filters.priceMax,
    filters.yearMin,
    filters.yearMax,
  ].filter((value) => value !== undefined && value !== "").length;

  return (
    <div>
      {/* Checkbox + peer selectors give a JS-free disclosure on mobile. */}
      <input type="checkbox" id="inventory-filters-toggle" className="peer sr-only" />

      <label
        htmlFor="inventory-filters-toggle"
        className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm font-semibold text-ink-700 transition-colors hover:border-brand-300 lg:hidden"
      >
        <Icon name="filter" className="h-4 w-4 text-brand-500" />
        Filters
        {activeCount > 0 && (
          <span className="rounded-full bg-brand-500 px-2 py-0.5 text-xs text-white">
            {activeCount}
          </span>
        )}
      </label>

      <form
        action="/inventory"
        className="mt-4 hidden rounded-2xl border border-ink-100 bg-white p-6 shadow-[var(--shadow-card)] peer-checked:block lg:mt-0 lg:block"
      >
        {Object.entries(params).map(([key, value]) => (
          <input key={key} type="hidden" name={key} value={value} />
        ))}

        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-base font-bold text-ink-900">Refine results</h2>
          {activeCount > 0 && (
            <a
              href="/inventory"
              className="text-xs font-semibold text-brand-600 transition-colors hover:text-brand-700"
            >
              Clear all
            </a>
          )}
        </div>

        <div className="mt-5 flex flex-col gap-4">
          <FilterSelect
            name="make"
            label="Brand"
            value={filters.make}
            options={facets.makes}
            anyLabel="Any brand"
          />

          <FilterSelect
            name="bodyType"
            label="Vehicle type"
            value={filters.bodyType}
            options={BODY_TYPES}
            anyLabel="Any type"
          />

          <FilterSelect
            name="transmission"
            label="Transmission"
            value={filters.transmission}
            options={TRANSMISSIONS}
            anyLabel="Any transmission"
          />

          <FilterSelect
            name="fuelType"
            label="Fuel type"
            value={filters.fuelType}
            options={FUEL_TYPES}
            anyLabel="Any fuel"
          />

          <FilterSelect
            name="condition"
            label="Condition"
            value={filters.condition}
            options={CONDITIONS}
            anyLabel="Any condition"
          />

          <FilterSelect
            name="location"
            label="Location"
            value={filters.location}
            options={facets.locations}
            anyLabel="Any location"
          />

          <fieldset className="border-t border-ink-100 pt-5">
            <legend className="text-xs font-semibold tracking-wide text-ink-500 uppercase">
              Price range
            </legend>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <input
                type="number"
                name="priceMin"
                inputMode="numeric"
                min={0}
                step={100000}
                defaultValue={filters.priceMin ?? ""}
                placeholder={String(facets.priceMin)}
                aria-label="Minimum price"
                className={controlClass}
              />
              <input
                type="number"
                name="priceMax"
                inputMode="numeric"
                min={0}
                step={100000}
                defaultValue={filters.priceMax ?? ""}
                placeholder={String(facets.priceMax)}
                aria-label="Maximum price"
                className={controlClass}
              />
            </div>
            <p className="mt-2 text-xs text-ink-400">
              Our range runs {formatPrice(facets.priceMin)} – {formatPrice(facets.priceMax)}
            </p>
          </fieldset>

          <fieldset>
            <legend className="text-xs font-semibold tracking-wide text-ink-500 uppercase">
              Year
            </legend>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <input
                type="number"
                name="yearMin"
                inputMode="numeric"
                min={facets.yearMin}
                max={facets.yearMax}
                defaultValue={filters.yearMin ?? ""}
                placeholder={String(facets.yearMin)}
                aria-label="From year"
                className={controlClass}
              />
              <input
                type="number"
                name="yearMax"
                inputMode="numeric"
                min={facets.yearMin}
                max={facets.yearMax}
                defaultValue={filters.yearMax ?? ""}
                placeholder={String(facets.yearMax)}
                aria-label="To year"
                className={controlClass}
              />
            </div>
          </fieldset>
        </div>

        <button
          type="submit"
          className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-brand-500 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
        >
          <Icon name="check" className="h-4 w-4" />
          Apply filters
        </button>
      </form>
    </div>
  );
}
