import Image from "next/image";
import { ActionSubmitButton } from "@/components/admin/action-submit-button";
import { AdminPagination, AdminSearchForm, StatusTabs } from "@/components/admin/list-controls";
import { AdminPageHeader, EmptyState, Panel } from "@/components/admin/page-parts";
import { StatusBadge } from "@/components/ui/badge";
import { Input, Select } from "@/components/ui/field";
import { Icon } from "@/components/ui/icon";
import { deleteSourcingRequest, updateSourcingRequest } from "@/actions/admin";
import {
  customerWhatsAppHref,
  getSourcingStatusCounts,
  listAdminSourcing,
  paramPage,
  paramText,
} from "@/lib/admin";
import { SourcingStatus } from "@/lib/constants";
import { formatNumber, formatPrice, timeAgo } from "@/lib/format";

export const metadata = { title: "Sourcing requests" };

const BASE = "/admin/sourcing";

export default async function AdminSourcingPage(props: PageProps<"/admin/sourcing">) {
  const searchParams = await props.searchParams;

  const q = paramText(searchParams.q);
  const status = paramText(searchParams.status);
  const page = paramPage(searchParams.page);

  const [results, counts] = await Promise.all([
    listAdminSourcing({ q, status, page }),
    getSourcingStatusCounts(),
  ]);

  const tabs = [
    { value: "", label: "All", count: counts.total },
    { value: SourcingStatus.NEW, label: "New", count: counts.counts.NEW ?? 0 },
    { value: SourcingStatus.IN_PROGRESS, label: "In progress", count: counts.counts.IN_PROGRESS ?? 0 },
    { value: SourcingStatus.SOURCED, label: "Sourced", count: counts.counts.SOURCED ?? 0 },
    { value: SourcingStatus.CLOSED, label: "Closed", count: counts.counts.CLOSED ?? 0 },
  ];

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Vehicle sourcing requests"
        description="Buyers asking us to import or locate a specific vehicle. Move each request through the pipeline as you work your dealer network."
      />

      <Panel bodyClassName="p-5">
        <div className="flex flex-col gap-4">
          <AdminSearchForm
            action={BASE}
            defaultValue={q}
            placeholder="Search by customer, make, model or location…"
            params={{ status }}
          />
          <StatusTabs base={BASE} tabs={tabs} active={status} params={{ q }} />
        </div>
      </Panel>

      {results.items.length > 0 ? (
        <>
          <ul className="grid gap-4 lg:grid-cols-2">
            {results.items.map((request) => {
              const whatsapp = customerWhatsAppHref(
                request.phone,
                `Hi ${request.customerName}, an update on the ${request.make} ${request.model} you asked us to source.`,
              );
              const yearRange =
                request.yearFrom && request.yearTo
                  ? `${request.yearFrom}–${request.yearTo}`
                  : request.yearFrom
                    ? `${request.yearFrom} or newer`
                    : request.yearTo
                      ? `up to ${request.yearTo}`
                      : "Any year";

              return (
                <li key={request.id}>
                  <Panel bodyClassName="flex h-full flex-col p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2.5">
                          <h3 className="font-display text-base font-bold text-ink-900">
                            {request.make} {request.model}
                          </h3>
                          <StatusBadge status={request.status} />
                        </div>
                        <p className="mt-1 text-xs text-ink-400">
                          {request.customerName} · {timeAgo(request.createdAt)}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-xs tracking-wide text-ink-400 uppercase">Budget</p>
                        <p className="font-display text-base font-bold text-ink-900">
                          {formatPrice(request.budget)}
                        </p>
                      </div>
                    </div>

                    <dl className="mt-4 grid grid-cols-2 gap-3 rounded-xl border border-ink-100 bg-ink-50/60 px-4 py-3 text-sm">
                      <div>
                        <dt className="text-xs tracking-wide text-ink-400 uppercase">Year range</dt>
                        <dd className="mt-0.5 font-medium text-ink-800">{yearRange}</dd>
                      </div>
                      <div>
                        <dt className="text-xs tracking-wide text-ink-400 uppercase">Deliver to</dt>
                        <dd className="mt-0.5 font-medium text-ink-800">{request.location}</dd>
                      </div>
                    </dl>

                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                      <a
                        href={`tel:${request.phone}`}
                        className="inline-flex items-center gap-1.5 text-ink-500 transition-colors hover:text-brand-600"
                      >
                        <Icon name="phone" className="h-3.5 w-3.5 text-ink-300" />
                        {request.phone}
                      </a>
                      <a
                        href={`mailto:${request.email}?subject=${encodeURIComponent(
                          `Sourcing update — ${request.make} ${request.model}`,
                        )}`}
                        className="inline-flex items-center gap-1.5 text-ink-500 transition-colors hover:text-brand-600"
                      >
                        <Icon name="mail" className="h-3.5 w-3.5 text-ink-300" />
                        {request.email}
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

                    {request.notes && (
                      <p className="mt-3 rounded-xl border border-ink-100 px-4 py-3 text-sm text-ink-600">
                        {request.notes}
                      </p>
                    )}

                    {request.referenceImage && (
                      <a
                        href={request.referenceImage}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-flex items-center gap-3 rounded-xl border border-ink-100 p-2 transition-colors hover:border-brand-300"
                      >
                        <span className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-ink-50">
                          <Image
                            src={request.referenceImage}
                            alt="Customer reference photo"
                            fill
                            sizes="80px"
                            className="object-cover"
                          />
                        </span>
                        <span className="text-xs font-semibold text-ink-600">
                          Reference photo
                          <span className="mt-0.5 block font-normal text-ink-400">
                            Click to open full size
                          </span>
                        </span>
                      </a>
                    )}

                    {request.adminNotes && (
                      <p className="mt-3 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-800">
                        <span className="font-semibold">Internal note: </span>
                        {request.adminNotes}
                      </p>
                    )}

                    <form
                      action={updateSourcingRequest}
                      className="mt-4 flex flex-col gap-3 border-t border-ink-100 pt-4"
                    >
                      <input type="hidden" name="id" value={request.id} />

                      <div className="grid gap-3 sm:grid-cols-2">
                        <label className="flex flex-col gap-1.5">
                          <span className="text-xs font-semibold text-ink-500">Status</span>
                          <Select name="status" defaultValue={request.status} aria-label="Status">
                            {Object.values(SourcingStatus).map((option) => (
                              <option key={option} value={option}>
                                {option === "IN_PROGRESS"
                                  ? "In progress"
                                  : option.charAt(0) + option.slice(1).toLowerCase()}
                              </option>
                            ))}
                          </Select>
                        </label>

                        <label className="flex flex-col gap-1.5">
                          <span className="text-xs font-semibold text-ink-500">Internal note</span>
                          <Input
                            name="adminNotes"
                            defaultValue={request.adminNotes ?? ""}
                            placeholder="Two units at auction…"
                            aria-label="Internal note"
                          />
                        </label>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <ActionSubmitButton
                          icon="check"
                          variant="primary"
                          size="sm"
                          pendingLabel="Saving…"
                        >
                          Update request
                        </ActionSubmitButton>
                      </div>
                    </form>

                    <form action={deleteSourcingRequest} className="mt-auto flex justify-end pt-3">
                      <input type="hidden" name="id" value={request.id} />
                      <ActionSubmitButton
                        icon="trash"
                        confirmMessage={`Delete the sourcing request from ${request.customerName}?`}
                        pendingLabel="Deleting…"
                        className="border-red-200 text-red-600 hover:border-red-400 hover:bg-red-50"
                      >
                        Delete
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
          icon="search"
          title={q || status ? "No requests match those filters" : "No sourcing requests yet"}
          description="Requests submitted through the sourcing form appear here."
        />
      )}

      <p className="text-xs text-ink-400">
        {formatNumber(results.total)} request{results.total === 1 ? "" : "s"} in this view.
      </p>
    </div>
  );
}
