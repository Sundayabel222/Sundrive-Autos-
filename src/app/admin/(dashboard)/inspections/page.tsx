import Link from "next/link";
import { ActionSubmitButton } from "@/components/admin/action-submit-button";
import { AdminPagination, AdminSearchForm, StatusTabs } from "@/components/admin/list-controls";
import { AdminPageHeader, EmptyState, Panel } from "@/components/admin/page-parts";
import { StatusBadge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { Input, Select } from "@/components/ui/field";
import { deleteInspection, updateInspection } from "@/actions/admin";
import {
  customerWhatsAppHref,
  getInspectionStatusCounts,
  listAdminInspections,
  paramPage,
  paramText,
} from "@/lib/admin";
import { InspectionStatus } from "@/lib/constants";
import { formatDate, formatNumber, timeAgo, toDateInputValue } from "@/lib/format";
import { vehicleShortTitle } from "@/lib/vehicle";

export const metadata = { title: "Inspections" };

const BASE = "/admin/inspections";

export default async function AdminInspectionsPage(props: PageProps<"/admin/inspections">) {
  const searchParams = await props.searchParams;

  const q = paramText(searchParams.q);
  const status = paramText(searchParams.status);
  const page = paramPage(searchParams.page);

  const [results, counts] = await Promise.all([
    listAdminInspections({ q, status, page }),
    getInspectionStatusCounts(),
  ]);

  const tabs = [
    { value: "", label: "All", count: counts.total },
    { value: InspectionStatus.PENDING, label: "Pending", count: counts.counts.PENDING ?? 0 },
    { value: InspectionStatus.APPROVED, label: "Approved", count: counts.counts.APPROVED ?? 0 },
    {
      value: InspectionStatus.RESCHEDULED,
      label: "Rescheduled",
      count: counts.counts.RESCHEDULED ?? 0,
    },
    { value: InspectionStatus.COMPLETED, label: "Completed", count: counts.counts.COMPLETED ?? 0 },
    { value: InspectionStatus.REJECTED, label: "Rejected", count: counts.counts.REJECTED ?? 0 },
  ];

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Inspection bookings"
        description="Approve, reschedule or close inspection requests. Customers are notified by phone or WhatsApp — the console records the decision."
      />

      <Panel bodyClassName="p-5">
        <div className="flex flex-col gap-4">
          <AdminSearchForm
            action={BASE}
            defaultValue={q}
            placeholder="Search by customer, email, phone or vehicle…"
            params={{ status }}
          />
          <StatusTabs base={BASE} tabs={tabs} active={status} params={{ q }} />
        </div>
      </Panel>

      {results.items.length > 0 ? (
        <>
          <ul className="flex flex-col gap-4">
            {results.items.map((booking) => {
              const whatsapp = customerWhatsAppHref(
                booking.phone,
                `Hi ${booking.customerName}, this is Sundrive Autos about your inspection booking for the ${booking.vehicleLabel}.`,
              );

              return (
                <li key={booking.id}>
                  <Panel bodyClassName="p-5">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <h3 className="font-display text-base font-bold text-ink-900">
                            {booking.customerName}
                          </h3>
                          <StatusBadge status={booking.status} />
                          <span className="text-xs text-ink-400">
                            requested {timeAgo(booking.createdAt)}
                          </span>
                        </div>

                        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-ink-500">
                          <a
                            href={`tel:${booking.phone}`}
                            className="inline-flex items-center gap-1.5 transition-colors hover:text-brand-600"
                          >
                            <Icon name="phone" className="h-3.5 w-3.5 text-ink-300" />
                            {booking.phone}
                          </a>
                          <a
                            href={`mailto:${booking.email}`}
                            className="inline-flex items-center gap-1.5 transition-colors hover:text-brand-600"
                          >
                            <Icon name="mail" className="h-3.5 w-3.5 text-ink-300" />
                            {booking.email}
                          </a>
                          {whatsapp && (
                            <a
                              href={whatsapp}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 font-medium text-[#128C7E] transition-colors hover:underline"
                            >
                              <Icon name="whatsapp" className="h-3.5 w-3.5" />
                              WhatsApp
                            </a>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-xs tracking-wide text-ink-400 uppercase">Preferred slot</p>
                        <p className="font-display text-base font-bold text-ink-900">
                          {formatDate(booking.preferredDate)}
                        </p>
                        <p className="text-sm text-ink-500">{booking.preferredTime}</p>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 rounded-xl border border-ink-100 bg-ink-50/60 px-4 py-3 sm:grid-cols-2">
                      <div>
                        <p className="text-xs tracking-wide text-ink-400 uppercase">Vehicle</p>
                        <p className="mt-0.5 text-sm font-semibold text-ink-800">
                          {booking.vehicle ? (
                            <Link
                              href={`/cars/${booking.vehicle.slug}`}
                              target="_blank"
                              className="transition-colors hover:text-brand-600"
                            >
                              {vehicleShortTitle(booking.vehicle)}
                            </Link>
                          ) : (
                            booking.vehicleLabel
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs tracking-wide text-ink-400 uppercase">Customer notes</p>
                        <p className="mt-0.5 text-sm text-ink-600">
                          {booking.message ?? "—"}
                        </p>
                      </div>
                    </div>

                    {booking.adminNotes && (
                      <p className="mt-3 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-800">
                        <span className="font-semibold">Internal note: </span>
                        {booking.adminNotes}
                      </p>
                    )}

                    {/* Decision form */}
                    <form action={updateInspection} className="mt-5 border-t border-ink-100 pt-5">
                      <input type="hidden" name="id" value={booking.id} />

                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <label className="flex flex-col gap-1.5">
                          <span className="text-xs font-semibold text-ink-500">Status</span>
                          <Select name="status" defaultValue={booking.status} aria-label="Status">
                            {Object.values(InspectionStatus).map((option) => (
                              <option key={option} value={option}>
                                {option.charAt(0) + option.slice(1).toLowerCase()}
                              </option>
                            ))}
                          </Select>
                        </label>

                        <label className="flex flex-col gap-1.5">
                          <span className="text-xs font-semibold text-ink-500">Reschedule date</span>
                          <Input
                            type="date"
                            name="preferredDate"
                            defaultValue={toDateInputValue(booking.preferredDate)}
                            aria-label="Preferred date"
                          />
                        </label>

                        <label className="flex flex-col gap-1.5">
                          <span className="text-xs font-semibold text-ink-500">Time</span>
                          <Input
                            type="time"
                            name="preferredTime"
                            defaultValue={booking.preferredTime}
                            aria-label="Preferred time"
                          />
                        </label>

                        <label className="flex flex-col gap-1.5">
                          <span className="text-xs font-semibold text-ink-500">Internal note</span>
                          <Input
                            name="adminNotes"
                            defaultValue={booking.adminNotes ?? ""}
                            placeholder="Confirmed on WhatsApp…"
                            aria-label="Internal note"
                          />
                        </label>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        <ActionSubmitButton
                          icon="check"
                          variant="primary"
                          size="sm"
                          pendingLabel="Saving…"
                        >
                          Save decision
                        </ActionSubmitButton>

                        <span className="ml-auto flex items-center gap-2">
                          <a
                            href={`mailto:${booking.email}?subject=${encodeURIComponent(
                              `Your inspection booking — ${booking.vehicleLabel}`,
                            )}`}
                            className="inline-flex h-9 items-center gap-2 rounded-full border border-ink-200 px-4 text-sm font-semibold text-ink-700 transition-colors hover:border-ink-900"
                          >
                            <Icon name="mail" className="h-3.5 w-3.5" />
                            Email customer
                          </a>
                        </span>
                      </div>
                    </form>

                    <form action={deleteInspection} className="mt-3 flex justify-end">
                      <input type="hidden" name="id" value={booking.id} />
                      <ActionSubmitButton
                        icon="trash"
                        confirmMessage={`Delete the booking from ${booking.customerName}?`}
                        pendingLabel="Deleting…"
                        className="border-red-200 text-red-600 hover:border-red-400 hover:bg-red-50"
                      >
                        Delete booking
                      </ActionSubmitButton>
                    </form>
                  </Panel>
                </li>
              );
            })}
          </ul>

          <AdminPagination
            base={BASE}
            page={results.page}
            totalPages={results.totalPages}
            params={{ q, status }}
          />
        </>
      ) : (
        <EmptyState
          icon="calendar"
          title={q || status ? "No bookings match those filters" : "No inspection bookings yet"}
          description="Bookings made through the website land here automatically."
        />
      )}

      <p className="text-xs text-ink-400">
        {formatNumber(results.total)} booking{results.total === 1 ? "" : "s"} shown in this view.
      </p>
    </div>
  );
}
