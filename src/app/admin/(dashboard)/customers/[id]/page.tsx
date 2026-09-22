import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminPageHeader, DetailRow, EmptyState, Panel, StatCard } from "@/components/admin/page-parts";
import { StatusBadge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { customerWhatsAppHref, getCustomerDetail } from "@/lib/admin";
import { formatDateTime, formatNumber, formatPrice, timeAgo } from "@/lib/format";
import { vehicleShortTitle } from "@/lib/vehicle";

export async function generateMetadata(props: PageProps<"/admin/customers/[id]">) {
  const { id } = await props.params;
  const detail = await getCustomerDetail(id);
  return { title: detail ? detail.customer.name : "Customer not found" };
}

export default async function AdminCustomerPage(props: PageProps<"/admin/customers/[id]">) {
  const { id } = await props.params;
  const detail = await getCustomerDetail(id);

  if (!detail) notFound();

  const { customer, counts, lastSeen } = detail;
  const whatsapp = customerWhatsAppHref(customer.phone, `Hi ${customer.name}, this is Sundrive Autos.`);

  return (
    <div className="flex flex-col gap-6">
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-ink-400">
        <Link href="/admin/customers" className="transition-colors hover:text-brand-600">
          Customers
        </Link>
        <Icon name="chevronRight" className="h-3.5 w-3.5" />
        <span className="text-ink-600">{customer.name}</span>
      </nav>

      <AdminPageHeader
        title={customer.name}
        description={`Customer since ${formatDateTime(customer.createdAt)}${
          lastSeen ? ` · last activity ${timeAgo(lastSeen)}` : ""
        }.`}
      >
        <a
          href={`mailto:${customer.email}`}
          className="inline-flex h-9 items-center gap-2 rounded-full bg-brand-500 px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
        >
          <Icon name="mail" className="h-4 w-4" />
          Email
        </a>
        {customer.phone && (
          <a
            href={`tel:${customer.phone}`}
            className="inline-flex h-9 items-center gap-2 rounded-full border border-ink-200 px-4 text-sm font-semibold text-ink-700 transition-colors hover:border-ink-900"
          >
            <Icon name="phone" className="h-4 w-4" />
            Call
          </a>
        )}
        {whatsapp && (
          <a
            href={whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-9 items-center gap-2 rounded-full border border-ink-200 px-4 text-sm font-semibold text-ink-700 transition-colors hover:border-ink-900"
          >
            <Icon name="whatsapp" className="h-4 w-4 text-[#25D366]" />
            WhatsApp
          </a>
        )}
      </AdminPageHeader>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon="calendar"
          label="Inspections"
          value={formatNumber(counts.inspections)}
          href={`/admin/inspections?q=${encodeURIComponent(customer.email)}`}
        />
        <StatCard
          icon="search"
          label="Sourcing requests"
          value={formatNumber(counts.sourcing)}
          tone="amber"
          href={`/admin/sourcing?q=${encodeURIComponent(customer.email)}`}
        />
        <StatCard
          icon="inbox"
          label="Messages"
          value={formatNumber(counts.messages)}
          tone="gray"
          href={`/admin/messages?q=${encodeURIComponent(customer.email)}`}
        />
        <StatCard
          icon="phone"
          label="Phone"
          value={customer.phone ?? "—"}
          tone="green"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_20rem]">
        {/* History */}
        <div className="flex flex-col gap-6">
          <Panel
            title="Inspection bookings"
            action={
              <Link
                href={`/admin/inspections?q=${encodeURIComponent(customer.email)}`}
                className="text-xs font-semibold text-brand-600 hover:text-brand-700"
              >
                Open queue
              </Link>
            }
            bodyClassName="p-0"
          >
            {customer.inspections.length > 0 ? (
              <ul className="divide-y divide-ink-100">
                {customer.inspections.map((booking) => (
                  <li key={booking.id} className="flex flex-wrap items-center gap-3 px-5 py-3.5">
                    <div className="min-w-[12rem] flex-1">
                      <p className="text-sm font-semibold text-ink-900">
                        {booking.vehicle ? vehicleShortTitle(booking.vehicle) : booking.vehicleLabel}
                      </p>
                      <p className="mt-0.5 text-xs text-ink-400">
                        {formatDateTime(booking.preferredDate)} · {booking.preferredTime}
                      </p>
                    </div>
                    <StatusBadge status={booking.status} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="p-5 text-sm text-ink-400">No inspection bookings yet.</p>
            )}
          </Panel>

          <Panel title="Sourcing requests" bodyClassName="p-0">
            {customer.sourcing.length > 0 ? (
              <ul className="divide-y divide-ink-100">
                {customer.sourcing.map((request) => (
                  <li key={request.id} className="flex flex-wrap items-center gap-3 px-5 py-3.5">
                    <div className="min-w-[12rem] flex-1">
                      <p className="text-sm font-semibold text-ink-900">
                        {request.make} {request.model}
                      </p>
                      <p className="mt-0.5 text-xs text-ink-400">
                        {formatPrice(request.budget)} · {request.location} ·{" "}
                        {timeAgo(request.createdAt)}
                      </p>
                    </div>
                    <StatusBadge status={request.status} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="p-5 text-sm text-ink-400">No sourcing requests yet.</p>
            )}
          </Panel>

          <Panel title="Message history" bodyClassName="p-0">
            {customer.messages.length > 0 ? (
              <ul className="divide-y divide-ink-100">
                {customer.messages.map((message) => (
                  <li key={message.id} className="px-5 py-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-ink-900">
                        {message.subject ?? "General enquiry"}
                      </p>
                      <span className="flex items-center gap-2">
                        <StatusBadge status={message.status} />
                        <span className="text-xs text-ink-400">{timeAgo(message.createdAt)}</span>
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed whitespace-pre-line text-ink-600">
                      {message.message}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="p-5 text-sm text-ink-400">No messages yet.</p>
            )}
          </Panel>

          {counts.inspections + counts.sourcing + counts.messages === 0 && (
            <EmptyState
              icon="users"
              title="Nothing recorded for this customer"
              description="This record was created from a form submission but has no linked activity yet."
            />
          )}
        </div>

        {/* Profile */}
        <aside className="flex flex-col gap-6">
          <Panel title="Profile">
            <dl className="flex flex-col gap-3.5">
              <DetailRow label="Email">
                <a
                  href={`mailto:${customer.email}`}
                  className="break-all text-brand-600 hover:underline"
                >
                  {customer.email}
                </a>
              </DetailRow>
              <DetailRow label="Phone">{customer.phone ?? "—"}</DetailRow>
              <DetailRow label="Created">{formatDateTime(customer.createdAt)}</DetailRow>
              <DetailRow label="Updated">{formatDateTime(customer.updatedAt)}</DetailRow>
            </dl>

            {customer.notes && (
              <p className="mt-4 rounded-xl border border-ink-100 bg-ink-50 px-4 py-3 text-sm text-ink-600">
                {customer.notes}
              </p>
            )}
          </Panel>

          <Panel title="Follow up">
            <p className="text-sm leading-relaxed text-ink-500">
              Reach out on the channel they used. Quoting their recent request usually gets the
              fastest reply.
            </p>
            <div className="mt-4 flex flex-col gap-2">
              <a
                href={`mailto:${customer.email}`}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-brand-500 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
              >
                <Icon name="mail" className="h-4 w-4" />
                Send an email
              </a>
              {whatsapp && (
                <a
                  href={whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-[#25D366] text-sm font-semibold text-white transition-colors hover:bg-[#1FB855]"
                >
                  <Icon name="whatsapp" className="h-4 w-4" />
                  Message on WhatsApp
                </a>
              )}
            </div>
          </Panel>
        </aside>
      </div>
    </div>
  );
}
