import Link from "next/link";
import {
  AdminPageHeader,
  DetailRow,
  EmptyState,
  Panel,
  StatCard,
} from "@/components/admin/page-parts";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Icon, type IconName } from "@/components/ui/icon";
import { getDashboard, statusLabel } from "@/lib/admin";
import { formatDate, formatNumber, formatPrice, timeAgo } from "@/lib/format";
import { vehicleShortTitle } from "@/lib/vehicle";

export const metadata = { title: "Overview" };

const LEAD_KIND = {
  inspection: { label: "Inspection", icon: "calendar", tone: "blue" },
  sourcing: { label: "Sourcing", icon: "search", tone: "amber" },
  message: { label: "Enquiry", icon: "mail", tone: "gray" },
} as const;

export default async function AdminOverviewPage() {
  const data = await getDashboard();
  const { inventory, sales, leads, feed, upcomingInspections, topViewed, makeMix } = data;

  const maxMake = Math.max(1, ...makeMix.map((row) => row.count));

  return (
    <div className="flex flex-col gap-7">
      <AdminPageHeader
        title="Dashboard overview"
        description={`Inventory, leads and sales at a glance — ${new Date().toLocaleDateString("en-GB", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        })}.`}
      >
        <ButtonLink href="/admin/inventory/new" size="sm">
          <Icon name="plus" className="h-4 w-4" />
          Add vehicle
        </ButtonLink>
        <ButtonLink href="/admin/inspections" variant="outline" size="sm">
          <Icon name="calendar" className="h-4 w-4" />
          Bookings
        </ButtonLink>
      </AdminPageHeader>

      {/* Headline numbers (PRD §12) */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          icon="car"
          label="Total vehicles"
          value={formatNumber(inventory.total)}
          hint={`${inventory.available} available · ${inventory.reserved} reserved`}
          href="/admin/inventory"
        />
        <StatCard
          icon="tag"
          label="Active listings"
          value={formatNumber(inventory.available + inventory.reserved)}
          hint={`Worth ${formatPrice(inventory.listedValue, { compact: true })}`}
          tone="green"
          href="/admin/inventory"
        />
        <StatCard
          icon="calendar"
          label="Pending inspections"
          value={formatNumber(leads.pendingInspections)}
          hint={`${leads.inspections} bookings all time`}
          tone="amber"
          href="/admin/inspections?status=PENDING"
        />
        <StatCard
          icon="search"
          label="Sourcing requests"
          value={formatNumber(leads.newSourcing)}
          hint={`${leads.openSourcing} still open · ${leads.sourcing} all time`}
          tone="blue"
          href="/admin/sourcing?status=NEW"
        />
        <StatCard
          icon="inbox"
          label="New messages"
          value={formatNumber(leads.newMessages)}
          hint={`${leads.messages} enquiries all time`}
          tone="red"
          href="/admin/messages?status=NEW"
        />
        <StatCard
          icon="gauge"
          label="Vehicles sold"
          value={formatNumber(sales.soldTotal)}
          hint={`${formatPrice(sales.soldValue, { compact: true })} lifetime`}
          tone="gray"
          href="/admin/inventory?status=SOLD"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        {/* Latest leads across all three queues */}
        <Panel
          title="Latest leads"
          description="Bookings, sourcing requests and enquiries as they arrive."
          action={
            <Link
              href="/admin/customers"
              className="text-xs font-semibold text-brand-600 transition-colors hover:text-brand-700"
            >
              All customers
            </Link>
          }
          bodyClassName="p-0"
        >
          {feed.length > 0 ? (
            <ul className="divide-y divide-ink-100">
              {feed.map((item) => {
                const kind = LEAD_KIND[item.kind];

                return (
                  <li key={`${item.kind}-${item.id}`}>
                    <Link
                      href={item.href}
                      className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-4 transition-colors hover:bg-ink-50"
                    >
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
                        <Icon name={kind.icon} className="h-4 w-4" />
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="truncate text-sm font-semibold text-ink-900">
                            {item.name}
                          </span>
                          <Badge tone={kind.tone}>{kind.label}</Badge>
                        </span>
                        <span className="mt-0.5 block truncate text-xs text-ink-500">
                          {item.label} · {item.email}
                        </span>
                      </span>

                      <span className="flex shrink-0 items-center gap-3">
                        <StatusBadge status={item.status} />
                        <span className="w-16 text-right text-xs text-ink-400">
                          {timeAgo(item.createdAt)}
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="p-5">
              <EmptyState
                icon="inbox"
                title="No leads yet"
                description="Once customers start booking inspections or requesting vehicles, they'll appear here."
              />
            </div>
          )}
        </Panel>

        {/* Upcoming inspections */}
        <Panel
          title="Next inspections"
          description="Confirmed and pending slots, soonest first."
          action={
            <Link
              href="/admin/inspections"
              className="text-xs font-semibold text-brand-600 transition-colors hover:text-brand-700"
            >
              Manage
            </Link>
          }
          bodyClassName="p-5"
        >
          {upcomingInspections.length > 0 ? (
            <ul className="flex flex-col gap-4">
              {upcomingInspections.map((booking) => (
                <li key={booking.id} className="flex gap-3">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-ink-100 bg-ink-50 text-center">
                    <span className="block font-display text-sm leading-none font-bold text-ink-900">
                      {new Date(booking.preferredDate).getDate()}
                    </span>
                    <span className="mt-0.5 block text-[0.6rem] tracking-wide text-ink-400 uppercase">
                      {new Date(booking.preferredDate).toLocaleDateString("en-GB", {
                        month: "short",
                      })}
                    </span>
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-ink-900">
                      {booking.customerName}
                    </span>
                    <span className="block truncate text-xs text-ink-500">
                      {booking.vehicleLabel}
                    </span>
                    <span className="mt-1.5 flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-xs text-ink-400">
                        <Icon name="clock" className="h-3.5 w-3.5" />
                        {booking.preferredTime}
                      </span>
                      <StatusBadge status={booking.status} />
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-4 text-center text-sm text-ink-400">
              No inspections scheduled. Bookings appear here automatically.
            </p>
          )}
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr_1.2fr]">
        {/* Sales statistics */}
        <Panel title="Sales statistics" description="Recorded against listings marked sold.">
          <dl className="flex flex-col gap-3.5">
            <DetailRow label="Inventory value">{formatPrice(inventory.listedValue)}</DetailRow>
            <DetailRow label="Sold value (lifetime)">{formatPrice(sales.soldValue)}</DetailRow>
            <DetailRow label="Average sold price">
              {sales.averageSoldPrice > 0 ? formatPrice(sales.averageSoldPrice) : "—"}
            </DetailRow>
            <DetailRow label="Sold this month">
              {sales.soldThisMonth} · {formatPrice(sales.soldThisMonthValue, { compact: true })}
            </DetailRow>
            <DetailRow label="Featured listings">{formatNumber(inventory.featured)}</DetailRow>
            <DetailRow label="Customers">{formatNumber(leads.customers)}</DetailRow>
          </dl>

          <Link
            href="/admin/analytics"
            className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 transition-colors hover:text-brand-700"
          >
            Open analytics
            <Icon name="arrowRight" className="h-3.5 w-3.5" />
          </Link>
        </Panel>

        {/* Inventory mix */}
        <Panel title="Inventory by make" description="Where your stock is concentrated.">
          {makeMix.length > 0 ? (
            <ul className="flex flex-col gap-3">
              {makeMix.map((row) => (
                <li key={row.make}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="truncate font-medium text-ink-800">{row.make}</span>
                    <span className="tabular-nums text-ink-500">{row.count}</span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-ink-100">
                    <div
                      className="h-full rounded-full bg-brand-500"
                      style={{ width: `${Math.round((row.count / maxMake) * 100)}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-4 text-center text-sm text-ink-400">No inventory yet.</p>
          )}
        </Panel>

        {/* Most viewed */}
        <Panel
          title="Most viewed vehicles"
          description="Interest recorded on detail pages."
          action={
            <Link
              href="/admin/analytics"
              className="text-xs font-semibold text-brand-600 transition-colors hover:text-brand-700"
            >
              Analytics
            </Link>
          }
          bodyClassName="p-0"
        >
          {topViewed.length > 0 ? (
            <ul className="divide-y divide-ink-100">
              {topViewed.map((vehicle, index) => (
                <li key={vehicle.id} className="flex items-center gap-3 px-5 py-3">
                  <span className="w-4 shrink-0 text-xs font-bold text-ink-300">{index + 1}</span>
                  <span className="min-w-0 flex-1">
                    <Link
                      href={`/admin/inventory/${vehicle.id}/edit`}
                      className="block truncate text-sm font-semibold text-ink-900 hover:text-brand-600"
                    >
                      {vehicleShortTitle(vehicle)}
                    </Link>
                    <span className="block text-xs text-ink-400">
                      {formatPrice(vehicle.price)} · {statusLabel(vehicle.status)}
                    </span>
                  </span>
                  <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-ink-500">
                    <Icon name="eye" className="h-3.5 w-3.5 text-ink-300" />
                    {formatNumber(vehicle.views)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="p-5 text-center text-sm text-ink-400">No views recorded yet.</p>
          )}
        </Panel>
      </div>

      {/* Today at a glance */}
      <Panel title="Today" description="What needs attention right now.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <TodayRow
            icon="calendar"
            label="Inspections to confirm"
            value={leads.pendingInspections}
            href="/admin/inspections?status=PENDING"
          />
          <TodayRow
            icon="search"
            label="Sourcing awaiting triage"
            value={leads.newSourcing}
            href="/admin/sourcing?status=NEW"
          />
          <TodayRow
            icon="inbox"
            label="Unread enquiries"
            value={leads.newMessages}
            href="/admin/messages?status=NEW"
          />
          <TodayRow
            icon="car"
            label="Reserved, awaiting sale"
            value={inventory.reserved}
            href="/admin/inventory?status=RESERVED"
          />
        </div>

        <p className="mt-5 border-t border-ink-100 pt-4 text-xs text-ink-400">
          Next booking: {upcomingInspections[0]
            ? `${formatDate(upcomingInspections[0].preferredDate)} at ${
                upcomingInspections[0].preferredTime
              } — ${upcomingInspections[0].customerName}`
            : "nothing scheduled yet"}
          .
        </p>
      </Panel>
    </div>
  );
}

function TodayRow({
  icon,
  label,
  value,
  href,
}: {
  icon: IconName;
  label: string;
  value: number;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-xl border border-ink-100 px-4 py-3 transition-colors hover:border-brand-300 hover:bg-brand-50/30"
    >
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-ink-50 text-ink-500">
        <Icon name={icon} className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-xs text-ink-400">{label}</span>
        <span className="block font-display text-lg font-bold text-ink-900">{value}</span>
      </span>
      <Icon name="arrowRight" className="h-4 w-4 shrink-0 text-ink-300" />
    </Link>
  );
}
