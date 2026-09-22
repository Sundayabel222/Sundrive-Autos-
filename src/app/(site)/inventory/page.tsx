import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { logInventorySearch } from "@/actions/leads";
import { InventoryFiltersPanel } from "@/components/site/inventory-filters";
import { InventorySearch } from "@/components/site/inventory-search";
import { SortSelect } from "@/components/site/sort-select";
import { VehicleCard } from "@/components/site/vehicle-card";
import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { getInventoryFacets, isSortKey, listVehicles } from "@/lib/queries";
import { formatNumber } from "@/lib/format";
import { inventoryHref } from "@/lib/inventory";
import { inventoryFilterSchema, searchParamsToObject } from "@/lib/validation";
import { site } from "@/lib/config";

export const metadata: Metadata = {
  title: "Vehicle Inventory",
  description:
    "Browse the full Sundrive Autos inventory — premium SUVs, sedans and coupes with transparent pricing, verified condition and nationwide delivery.",
  alternates: { canonical: "/inventory" },
};

export default async function InventoryPage(props: PageProps<"/inventory">) {
  const searchParams = await props.searchParams;

  // Invalid values fall back to an unfiltered listing rather than erroring.
  const parsed = inventoryFilterSchema.safeParse(searchParamsToObject(searchParams));
  const filters = parsed.success ? parsed.data : {};

  const sort = isSortKey(filters.sort) ? filters.sort : "newest";

  const [facets, results] = await Promise.all([
    getInventoryFacets(),
    listVehicles({ ...filters, sort }),
  ]);

  const { items, total, page, totalPages, pageSize } = results;
  const term = filters.q?.trim();

  // Links and forms each carry every filter *except* the one they set themselves,
  // so no control ever emits a duplicate key (the search box must not preserve
  // `q`, and the sort select must not preserve `sort`).
  const termParam: Record<string, string> = term ? { q: term } : {};
  const sortParam: Record<string, string> = sort !== "newest" ? { sort } : {};
  const filterFormParams: Record<string, string> = { ...termParam, ...sortParam };
  const searchFormParams: Record<string, string> = { ...sortParam };
  const sortSelectParams: Record<string, string> = { ...termParam };

  // A hand-edited or stale page number would otherwise render an empty grid, so
  // send the visitor back to the last page that actually has results.
  if (page > totalPages) {
    redirect(inventoryHref({ ...filterFormParams, page: totalPages }));
  }

  // Analytics (PRD §18). `after` keeps this off the response path, and the page
  // is dynamic, so it runs once per request rather than at build time.
  if (term) {
    after(() => logInventorySearch({ term, resultCount: total }));
  }

  const firstResult = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const lastResult = Math.min(page * pageSize, total);

  return (
    <>
      {/* Page head */}
      <section className="surface-dark texture-grid relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 right-0 h-[26rem] w-[26rem] rounded-full bg-brand-500/20 blur-[120px]"
        />
        <div className="container-page relative py-12 lg:py-16">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-white/50">
            <Link href="/" className="transition-colors hover:text-white">
              Home
            </Link>
            <Icon name="chevronRight" className="h-3.5 w-3.5" />
            <span className="text-white/80">Inventory</span>
          </nav>

          <div className="mt-5 flex flex-wrap items-end justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-white sm:text-4xl">Vehicle Inventory</h1>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/60 sm:text-base">
                Every vehicle below is physically inspected before it goes on the floor. Filter by
                budget, body type or location — or tell us what&apos;s missing and we&apos;ll source
                it.
              </p>
            </div>

            <dl className="flex gap-8">
              <div>
                <dt className="text-xs text-white/45">In stock</dt>
                <dd className="font-display text-2xl font-bold text-white">{formatNumber(total)}</dd>
              </div>
              <div>
                <dt className="text-xs text-white/45">Brands</dt>
                <dd className="font-display text-2xl font-bold text-white">{facets.makes.length}</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <section className="bg-ink-50 py-10 lg:py-14">
        <div className="container-page">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <InventorySearch defaultValue={term} params={searchFormParams} />
            <SortSelect value={sort} params={sortSelectParams} />
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-[17rem_1fr] lg:gap-10">
            {/* Filters */}
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <InventoryFiltersPanel
                facets={facets}
                filters={filters}
                params={filterFormParams}
              />
            </aside>

            {/* Results */}
            <div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-ink-500">
                  {total === 0 ? (
                    "No vehicles match your filters"
                  ) : (
                    <>
                      Showing <strong className="font-semibold text-ink-900">{firstResult}</strong>–
                      <strong className="font-semibold text-ink-900">{lastResult}</strong> of{" "}
                      <strong className="font-semibold text-ink-900">{formatNumber(total)}</strong>{" "}
                      vehicles
                      {term ? (
                        <>
                          {" "}
                          for <span className="font-semibold text-brand-600">“{term}”</span>
                        </>
                      ) : null}
                    </>
                  )}
                </p>

                {term && (
                  <Link
                    href="/inventory"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-500 transition-colors hover:text-brand-600"
                  >
                    <Icon name="close" className="h-3.5 w-3.5" />
                    Clear search
                  </Link>
                )}
              </div>

              {items.length > 0 ? (
                <div className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {items.map((vehicle, index) => (
                    <VehicleCard
                      key={vehicle.id}
                      vehicle={vehicle}
                      priority={index < 3}
                      className="animate-fade-up"
                    />
                  ))}
                </div>
              ) : (
                <div className="mt-6 rounded-2xl border border-dashed border-ink-200 bg-white p-10 text-center lg:p-14">
                  <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-600">
                    <Icon name="search" className="h-6 w-6" />
                  </span>
                  <h2 className="mt-5 font-display text-xl font-bold text-ink-900">
                    Nothing matched that search
                  </h2>
                  <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-500">
                    Try widening your budget or dropping a filter. If you&apos;re after something
                    specific, our sourcing team can import or locate it for you.
                  </p>
                  <div className="mt-7 flex flex-wrap justify-center gap-3">
                    <ButtonLink href="/inventory" variant="outline">
                      Reset filters
                    </ButtonLink>
                    <ButtonLink href="/sourcing">
                      Request a vehicle
                      <Icon name="arrowRight" className="h-4 w-4" />
                    </ButtonLink>
                  </div>
                </div>
              )}

              {totalPages > 1 && (
                <Pagination page={page} totalPages={totalPages} params={filterFormParams} />
              )}

              {/* Sourcing prompt doubles as the fallback when a search comes up empty. */}
              {items.length > 0 && (
                <div className="mt-12 overflow-hidden rounded-2xl bg-ink-900 p-8 sm:flex sm:items-center sm:justify-between sm:gap-8 lg:p-10">
                  <div>
                    <h2 className="font-display text-xl font-bold text-white">
                      Looking for a vehicle we don&apos;t stock?
                    </h2>
                    <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/60">
                      {site.name} sources and imports to order. Send us the spec and budget and
                      we&apos;ll come back with real options.
                    </p>
                  </div>
                  <ButtonLink href="/sourcing" size="lg" className="mt-6 shrink-0 sm:mt-0">
                    Request Vehicle
                    <Icon name="arrowRight" className="h-4 w-4" />
                  </ButtonLink>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

/** Numbered pagination that carries the full filter set into every link. */
function Pagination({
  page,
  totalPages,
  params,
}: {
  page: number;
  totalPages: number;
  params: Record<string, string>;
}) {
  // Show a window of 5 pages around the current one, plus first/last.
  const windowSize = 5;
  const start = Math.max(1, Math.min(page - Math.floor(windowSize / 2), totalPages - windowSize + 1));
  const end = Math.min(totalPages, start + windowSize - 1);
  const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i);

  const href = (target: number) => inventoryHref({ ...params, page: target });

  const linkClass =
    "grid h-10 min-w-10 place-items-center rounded-xl border px-3 text-sm font-semibold transition-colors";

  return (
    <nav aria-label="Inventory pagination" className="mt-10 flex flex-wrap items-center justify-center gap-2">
      {page > 1 ? (
        <Link href={href(page - 1)} rel="prev" className={`${linkClass} border-ink-200 bg-white text-ink-700 hover:border-brand-300`}>
          <Icon name="chevronLeft" className="h-4 w-4" />
        </Link>
      ) : (
        <span aria-disabled className={`${linkClass} border-ink-100 bg-ink-50 text-ink-300`}>
          <Icon name="chevronLeft" className="h-4 w-4" />
        </span>
      )}

      {pages[0] > 1 && (
        <>
          <Link href={href(1)} className={`${linkClass} border-ink-200 bg-white text-ink-700 hover:border-brand-300`}>
            1
          </Link>
          {pages[0] > 2 && <span className="px-1 text-ink-400">…</span>}
        </>
      )}

      {pages.map((target) =>
        target === page ? (
          <span
            key={target}
            aria-current="page"
            className={`${linkClass} border-brand-500 bg-brand-500 text-white`}
          >
            {target}
          </span>
        ) : (
          <Link
            key={target}
            href={href(target)}
            className={`${linkClass} border-ink-200 bg-white text-ink-700 hover:border-brand-300`}
          >
            {target}
          </Link>
        ),
      )}

      {pages[pages.length - 1] < totalPages && (
        <>
          {pages[pages.length - 1] < totalPages - 1 && <span className="px-1 text-ink-400">…</span>}
          <Link
            href={href(totalPages)}
            className={`${linkClass} border-ink-200 bg-white text-ink-700 hover:border-brand-300`}
          >
            {totalPages}
          </Link>
        </>
      )}

      {page < totalPages ? (
        <Link href={href(page + 1)} rel="next" className={`${linkClass} border-ink-200 bg-white text-ink-700 hover:border-brand-300`}>
          <Icon name="chevronRight" className="h-4 w-4" />
        </Link>
      ) : (
        <span aria-disabled className={`${linkClass} border-ink-100 bg-ink-50 text-ink-300`}>
          <Icon name="chevronRight" className="h-4 w-4" />
        </span>
      )}
    </nav>
  );
}
