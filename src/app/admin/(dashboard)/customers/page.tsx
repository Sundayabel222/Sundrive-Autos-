import Link from "next/link";
import { AdminPagination, AdminSearchForm } from "@/components/admin/list-controls";
import { AdminPageHeader, EmptyState, Panel } from "@/components/admin/page-parts";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { customerWhatsAppHref, listAdminCustomers, paramPage, paramText } from "@/lib/admin";
import { formatDateTime, formatNumber, timeAgo } from "@/lib/format";

export const metadata = { title: "Customers" };

const BASE = "/admin/customers";

export default async function AdminCustomersPage(props: PageProps<"/admin/customers">) {
  const searchParams = await props.searchParams;

  const q = paramText(searchParams.q);
  const page = paramPage(searchParams.page);

  const results = await listAdminCustomers({ q, page });

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Customers"
        description="Everyone who has booked an inspection, requested a vehicle or sent an enquiry — consolidated by email address."
      />

      <Panel bodyClassName="p-5">
        <AdminSearchForm
          action={BASE}
          defaultValue={q}
          placeholder="Search by name, email or phone…"
        />
      </Panel>

      {results.items.length > 0 ? (
        <>
          <Panel bodyClassName="p-0">
            <ul className="divide-y divide-ink-100">
              {results.items.map((customer) => {
                const whatsapp = customerWhatsAppHref(
                  customer.phone,
                  `Hi ${customer.name}, this is Sundrive Autos.`,
                );
                const total =
                  customer._count.inspections + customer._count.sourcing + customer._count.messages;

                return (
                  <li key={customer.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand-50 text-sm font-bold text-brand-600">
                      {customer.name
                        .split(" ")
                        .map((part) => part.charAt(0))
                        .slice(0, 2)
                        .join("")
                        .toUpperCase()}
                    </span>

                    <div className="min-w-[14rem] flex-1">
                      <Link
                        href={`${BASE}/${customer.id}`}
                        className="font-semibold text-ink-900 transition-colors hover:text-brand-600"
                      >
                        {customer.name}
                      </Link>
                      <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-400">
                        <a
                          href={`mailto:${customer.email}`}
                          className="transition-colors hover:text-brand-600"
                        >
                          {customer.email}
                        </a>
                        {customer.phone && (
                          <a
                            href={`tel:${customer.phone}`}
                            className="transition-colors hover:text-brand-600"
                          >
                            {customer.phone}
                          </a>
                        )}
                        {whatsapp && (
                          <a
                            href={whatsapp}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-[#128C7E] hover:underline"
                          >
                            WhatsApp
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone="blue">{customer._count.inspections} inspections</Badge>
                      <Badge tone="amber">{customer._count.sourcing} sourcing</Badge>
                      <Badge tone="gray">{customer._count.messages} messages</Badge>
                    </div>

                    <div className="w-32 shrink-0 text-right text-xs text-ink-400">
                      <p>{total} interaction{total === 1 ? "" : "s"}</p>
                      <p className="mt-0.5">updated {timeAgo(customer.updatedAt)}</p>
                    </div>

                    <Link
                      href={`${BASE}/${customer.id}`}
                      className="inline-flex h-9 shrink-0 items-center gap-2 rounded-full border border-ink-200 px-4 text-sm font-semibold text-ink-700 transition-colors hover:border-ink-900"
                    >
                      Open
                      <Icon name="arrowRight" className="h-3.5 w-3.5" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </Panel>

          <AdminPagination
            base={BASE}
            page={results.page}
            totalPages={results.totalPages}
            params={{ q }}
          />

          <p className="text-xs text-ink-400">
            {formatNumber(results.total)} customer{results.total === 1 ? "" : "s"} in this view.
          </p>
        </>
      ) : (
        <EmptyState
          icon="users"
          title={q ? "No customers match that search" : "No customers yet"}
          description="Customer records are created automatically the first time someone submits a form."
        />
      )}

      <p className="text-xs text-ink-400">
        Last updated {formatDateTime(new Date())} · records are matched on email address.
      </p>
    </div>
  );
}
