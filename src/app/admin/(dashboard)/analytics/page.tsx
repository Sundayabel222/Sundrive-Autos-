import Link from "next/link";
import { AdminPageHeader, EmptyState, Panel, StatCard } from "@/components/admin/page-parts";
import { Icon } from "@/components/ui/icon";
import { getAnalytics, statusLabel } from "@/lib/admin";
import { formatNumber, formatPrice } from "@/lib/format";
import { vehicleShortTitle } from "@/lib/vehicle";

export const metadata = { title: "Analytics" };

export default async function AdminAnalyticsPage() {
  const data = await getAnalytics();

  const peakDaily = Math.max(1, ...data.viewsByDay.map((day) => day.views));
  const maxSearch = Math.max(1, ...data.topSearches.map((row) => row.searches));
  const sourceTotal = data.sources.reduce(
    (sum, row) => sum + row.inspections + row.sourcing + row.messages,
    0,
  );

  return (
    <div className="flex flex-col gap-7">
      <AdminPageHeader
        title="Analytics"
        description="What buyers look at, what they search for, and where your leads come from. Views count detail-page opens; leads count form submissions."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          icon="eye"
          label="Listing views"
          value={formatNumber(data.lifetimeViews)}
          hint={`${formatNumber(data.viewsLast30)} in the last 30 days`}
        />
        <StatCard
          icon="inbox"
          label="Total leads"
          value={formatNumber(data.leads.total)}
          hint={`${data.leads.inspections} inspections · ${data.leads.sourcing} sourcing · ${data.leads.messages} messages`}
          tone="green"
        />
        <StatCard
          icon="gauge"
          label="Conversion rate"
          value={`${data.leads.perHundredViews}%`}
          hint="Leads per 100 listing views"
          tone="amber"
        />
        <StatCard
          icon="search"
          label="Searches run"
          value={formatNumber(data.searchTotal)}
          hint="Terms typed into the inventory search"
          tone="blue"
        />
        <StatCard
          icon="users"
          label="Customers"
          value={formatNumber(data.leads.customers)}
          hint="Matched on email address"
          tone="gray"
        />
        <StatCard
          icon="tag"
          label="Listed inventory value"
          value={formatPrice(data.listedValue, { compact: true })}
          hint="Available and reserved vehicles"
          tone="green"
        />
      </div>

      {/* Traffic */}
      <Panel
        title="Listing views — last 14 days"
        description="One bar per day, scaled to the busiest day in the window."
      >
        <div className="flex h-40 items-end gap-1.5">
          {data.viewsByDay.map((day) => (
            <div key={day.key} className="group flex h-full flex-1 flex-col justify-end">
              <div
                className="relative w-full rounded-t-md bg-brand-500/85 transition-colors group-hover:bg-brand-600"
                style={{ height: `${Math.max(3, (day.views / peakDaily) * 100)}%` }}
                title={`${day.views} views on ${day.date.toLocaleDateString("en-GB")}`}
              />
              <span className="mt-2 text-center text-[0.6rem] text-ink-400">
                {day.date.getDate()}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-ink-100 pt-4 text-xs text-ink-400">
          <span>
            Peak day: <strong className="text-ink-700">{peakDaily}</strong> views
          </span>
          <span>
            14-day total:{" "}
            <strong className="text-ink-700">
              {formatNumber(data.viewsByDay.reduce((sum, day) => sum + day.views, 0))}
            </strong>
          </span>
        </div>
      </Panel>

      <div className="grid gap-6 xl:grid-cols-2">
        {/* Most viewed */}
        <Panel
          title="Most viewed vehicles"
          description="Lifetime detail-page views."
          bodyClassName="p-0"
        >
          {data.topViewed.length > 0 ? (
            <ul className="divide-y divide-ink-100">
              {data.topViewed.map((vehicle, index) => (
                <li key={vehicle.id} className="flex items-center gap-3 px-5 py-3.5">
                  <span className="w-5 shrink-0 text-xs font-bold text-ink-300">{index + 1}</span>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/admin/inventory/${vehicle.id}/edit`}
                      className="block truncate text-sm font-semibold text-ink-900 hover:text-brand-600"
                    >
                      {vehicleShortTitle(vehicle)}
                    </Link>
                    <p className="mt-0.5 text-xs text-ink-400">
                      {formatPrice(vehicle.price)} · {vehicle.year} · {statusLabel(vehicle.status)}
                    </p>
                  </div>
                  <span className="shrink-0 text-right">
                    <span className="block font-display text-base font-bold text-ink-900">
                      {formatNumber(vehicle.views)}
                    </span>
                    <span className="block text-[0.65rem] tracking-wide text-ink-400 uppercase">
                      views
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="p-5 text-center text-sm text-ink-400">No views recorded yet.</p>
          )}
        </Panel>

        {/* Searches */}
        <Panel
          title="Most searched terms"
          description="What visitors type into the inventory search — demand you may not stock."
          bodyClassName="p-0"
        >
          {data.topSearches.length > 0 ? (
            <ul className="divide-y divide-ink-100">
              {data.topSearches.map((row) => (
                <li key={row.term} className="px-5 py-3.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-ink-900">{row.term}</span>
                    <span className="text-xs text-ink-500">
                      {formatNumber(row.searches)} search{row.searches === 1 ? "" : "es"} ·{" "}
                      {row.averageResults} result{row.averageResults === 1 ? "" : "s"} on average
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink-100">
                    <div
                      className="h-full rounded-full bg-brand-500"
                      style={{ width: `${Math.round((row.searches / maxSearch) * 100)}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="p-5 text-center text-sm text-ink-400">
              No searches logged yet. Search terms are recorded as visitors use the inventory page.
            </p>
          )}
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1.2fr]">
        {/* Lead sources */}
        <Panel title="Lead sources" description="Which channel each lead arrived through." bodyClassName="p-0">
          {data.sources.length > 0 ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-100 text-left text-xs tracking-wide text-ink-400 uppercase">
                  <th className="px-5 py-3 font-semibold">Source</th>
                  <th className="px-3 py-3 text-right font-semibold">Inspections</th>
                  <th className="px-3 py-3 text-right font-semibold">Sourcing</th>
                  <th className="px-3 py-3 text-right font-semibold">Messages</th>
                  <th className="px-5 py-3 text-right font-semibold">Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {data.sources.map((row) => {
                  const rowTotal = row.inspections + row.sourcing + row.messages;
                  const share = sourceTotal > 0 ? Math.round((rowTotal / sourceTotal) * 100) : 0;

                  return (
                    <tr key={row.source}>
                      <td className="px-5 py-3 font-semibold text-ink-900">
                        {statusLabel(row.source)}
                      </td>
                      <td className="px-3 py-3 text-right tabular-nums text-ink-600">
                        {row.inspections}
                      </td>
                      <td className="px-3 py-3 text-right tabular-nums text-ink-600">
                        {row.sourcing}
                      </td>
                      <td className="px-3 py-3 text-right tabular-nums text-ink-600">
                        {row.messages}
                      </td>
                      <td className="px-5 py-3 text-right font-semibold tabular-nums text-ink-900">
                        {share}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <p className="p-5 text-center text-sm text-ink-400">No leads recorded yet.</p>
          )}
        </Panel>

        {/* Inventory mix */}
        <Panel
          title="Inventory by make"
          description="Stock concentration — pair this with search demand to plan buying."
          bodyClassName="p-5"
        >
          {data.makeMix.length > 0 ? (
            <ul className="grid gap-3 sm:grid-cols-2">
              {data.makeMix.map((row) => (
                <li
                  key={row.make}
                  className="flex items-center justify-between gap-3 rounded-xl border border-ink-100 px-4 py-3"
                >
                  <span className="truncate text-sm font-medium text-ink-800">{row.make}</span>
                  <span className="font-display text-base font-bold text-ink-900">{row.count}</span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon="car" title="No inventory yet" />
          )}

          <div className="mt-5 flex flex-wrap gap-4 border-t border-ink-100 pt-5 text-xs text-ink-500">
            <span className="inline-flex items-center gap-1.5">
              <Icon name="eye" className="h-3.5 w-3.5 text-ink-300" />
              Views are recorded when a vehicle detail page is opened.
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Icon name="search" className="h-3.5 w-3.5 text-ink-300" />
              Search terms come from the inventory search box.
            </span>
          </div>
        </Panel>
      </div>
    </div>
  );
}
