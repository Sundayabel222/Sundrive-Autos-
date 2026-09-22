import Image from "next/image";
import Link from "next/link";
import { ActionSubmitButton } from "@/components/admin/action-submit-button";
import { AdminPagination, AdminSearchForm, StatusTabs } from "@/components/admin/list-controls";
import { AdminPageHeader, EmptyState, Panel } from "@/components/admin/page-parts";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { toggleVehicleFeatured, deleteVehicle, setVehicleStatus } from "@/actions/vehicles";
import { getVehicleStatusCounts, listAdminVehicles, paramPage, paramText } from "@/lib/admin";
import { VehicleStatus } from "@/lib/constants";
import { formatMileage, formatNumber, formatPrice, timeAgo } from "@/lib/format";
import { primaryImage, vehicleTitle } from "@/lib/vehicle";

export const metadata = { title: "Inventory" };

const BASE = "/admin/inventory";

export default async function AdminInventoryPage(props: PageProps<"/admin/inventory">) {
  const searchParams = await props.searchParams;

  const q = paramText(searchParams.q);
  const status = paramText(searchParams.status);
  const page = paramPage(searchParams.page);
  const created = paramText(searchParams.created);
  const updated = paramText(searchParams.updated);

  const [results, statusCounts] = await Promise.all([
    listAdminVehicles({ q, status, page }),
    getVehicleStatusCounts(),
  ]);

  const { items, total, totalPages } = results;

  const tabs = [
    { value: "", label: "All", count: statusCounts.total },
    { value: VehicleStatus.AVAILABLE, label: "Available", count: statusCounts.counts.AVAILABLE },
    { value: VehicleStatus.RESERVED, label: "Reserved", count: statusCounts.counts.RESERVED },
    { value: VehicleStatus.SOLD, label: "Sold", count: statusCounts.counts.SOLD },
  ];

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Inventory"
        description="Add, update and retire listings. Changes go live on the showroom immediately."
      >
        <ButtonLink href={`${BASE}/new`} size="sm">
          <Icon name="plus" className="h-4 w-4" />
          Add vehicle
        </ButtonLink>
        <ButtonLink href="/inventory" variant="outline" size="sm" target="_blank" rel="noopener noreferrer">
          <Icon name="eye" className="h-4 w-4" />
          View showroom
        </ButtonLink>
      </AdminPageHeader>

      {created && (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-800">
          <Icon name="check" className="h-4 w-4" />
          <span className="font-semibold">Vehicle published.</span>
          <Link href={`/cars/${created}`} target="_blank" className="font-semibold underline">
            View the listing
          </Link>
        </div>
      )}

      {updated && (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-brand-200 bg-brand-50 px-5 py-4 text-sm text-brand-800">
          <Icon name="check" className="h-4 w-4" />
          <span className="font-semibold">Changes saved.</span>
          <Link href={`/cars/${updated}`} target="_blank" className="font-semibold underline">
            View the listing
          </Link>
        </div>
      )}

      <Panel bodyClassName="p-5">
        <div className="flex flex-col gap-4">
          <AdminSearchForm
            action={BASE}
            defaultValue={q}
            placeholder="Search by make, model, VIN, slug or location…"
            params={{ status }}
          />
          <StatusTabs base={BASE} tabs={tabs} active={status} params={{ q }} />
        </div>
      </Panel>

      <Panel
        title={`${formatNumber(total)} vehicle${total === 1 ? "" : "s"}`}
        description={q ? `Filtered by “${q}”.` : "Newest listings first."}
        bodyClassName="p-0"
      >
        {items.length > 0 ? (
          <>
            <ul className="divide-y divide-ink-100">
              {items.map((vehicle) => (
                <li key={vehicle.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
                  {/* Cover */}
                  <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-xl border border-ink-100 bg-ink-50">
                    <Image
                      src={primaryImage(vehicle)}
                      alt={vehicleTitle(vehicle)}
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  </div>

                  {/* Identity */}
                  <div className="min-w-[14rem] flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`${BASE}/${vehicle.id}/edit`}
                        className="font-semibold text-ink-900 transition-colors hover:text-brand-600"
                      >
                        {vehicleTitle(vehicle)}
                      </Link>
                      {vehicle.featured && <Badge tone="dark">Featured</Badge>}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-400">
                      <span>{formatMileage(vehicle.mileage)}</span>
                      <span>{vehicle.location}</span>
                      <span>Updated {timeAgo(vehicle.updatedAt)}</span>
                      <span className="inline-flex items-center gap-1">
                        <Icon name="eye" className="h-3.5 w-3.5" />
                        {formatNumber(vehicle.views)}
                      </span>
                    </div>
                  </div>

                  {/* Price + status */}
                  <div className="w-36 shrink-0">
                    <p className="font-display text-base font-bold text-ink-900">
                      {formatPrice(vehicle.price)}
                    </p>
                    <p className="mt-1">
                      <StatusBadge status={vehicle.status} />
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2">
                    <form action={setVehicleStatus} className="flex items-center gap-1.5">
                      <input type="hidden" name="id" value={vehicle.id} />
                      <select
                        name="status"
                        defaultValue={vehicle.status}
                        aria-label={`Status for ${vehicleTitle(vehicle)}`}
                        className="h-9 cursor-pointer rounded-full border border-ink-200 bg-white px-3 text-xs font-semibold text-ink-700 transition-colors hover:border-ink-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 focus:outline-none"
                      >
                        {Object.values(VehicleStatus).map((option) => (
                          <option key={option} value={option}>
                            {option.charAt(0) + option.slice(1).toLowerCase()}
                          </option>
                        ))}
                      </select>
                      <ActionSubmitButton pendingLabel="…">Set</ActionSubmitButton>
                    </form>

                    <form action={toggleVehicleFeatured}>
                      <input type="hidden" name="id" value={vehicle.id} />
                      <ActionSubmitButton
                        icon="sparkle"
                        pendingLabel="…"
                        title={vehicle.featured ? "Remove from featured" : "Feature on homepage"}
                      >
                        {vehicle.featured ? "Unfeature" : "Feature"}
                      </ActionSubmitButton>
                    </form>

                    <ButtonLink
                      href={`${BASE}/${vehicle.id}/edit`}
                      variant="outline"
                      size="sm"
                    >
                      <Icon name="edit" className="h-3.5 w-3.5" />
                      Edit
                    </ButtonLink>

                    <form action={deleteVehicle}>
                      <input type="hidden" name="id" value={vehicle.id} />
                      <ActionSubmitButton
                        icon="trash"
                        confirmMessage={`Delete ${vehicleTitle(vehicle)}? This cannot be undone.`}
                        pendingLabel="Deleting…"
                        className="border-red-200 text-red-600 hover:border-red-400 hover:bg-red-50"
                      >
                        Delete
                      </ActionSubmitButton>
                    </form>
                  </div>
                </li>
              ))}
            </ul>

            <div className="px-5 pb-5">
              <AdminPagination
                base={BASE}
                page={results.page}
                totalPages={totalPages}
                params={{ q, status }}
              />
            </div>
          </>
        ) : (
          <div className="p-5">
            <EmptyState
              icon="car"
              title={q || status ? "No vehicles match those filters" : "No vehicles yet"}
              description={
                q || status
                  ? "Try a different search term or clear the status filter."
                  : "Add your first vehicle to publish it to the showroom."
              }
            >
              <ButtonLink href={`${BASE}/new`}>
                <Icon name="plus" className="h-4 w-4" />
                Add vehicle
              </ButtonLink>
            </EmptyState>
          </div>
        )}
      </Panel>
    </div>
  );
}
