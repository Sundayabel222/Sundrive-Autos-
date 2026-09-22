import Link from "next/link";
import { notFound } from "next/navigation";
import { VehicleForm } from "@/components/admin/vehicle-form";
import { AdminPageHeader, DetailRow, Panel } from "@/components/admin/page-parts";
import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { getVehicleForAdmin } from "@/lib/admin";
import { formatDateTime, formatNumber } from "@/lib/format";
import { vehicleTitle } from "@/lib/vehicle";

export async function generateMetadata(props: PageProps<"/admin/inventory/[id]/edit">) {
  const { id } = await props.params;
  const vehicle = await getVehicleForAdmin(id);
  return { title: vehicle ? `Edit ${vehicleTitle(vehicle)}` : "Vehicle not found" };
}

export default async function EditVehiclePage(props: PageProps<"/admin/inventory/[id]/edit">) {
  const { id } = await props.params;
  const vehicle = await getVehicleForAdmin(id);

  if (!vehicle) notFound();

  return (
    <div className="flex flex-col gap-6">
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-ink-400">
        <Link href="/admin/inventory" className="transition-colors hover:text-brand-600">
          Inventory
        </Link>
        <Icon name="chevronRight" className="h-3.5 w-3.5" />
        <span className="truncate text-ink-600">{vehicleTitle(vehicle)}</span>
      </nav>

      <AdminPageHeader
        title={vehicleTitle(vehicle)}
        description="Edit the listing. Saving pushes the change to the showroom and the detail page immediately."
      >
        <ButtonLink
          href={`/cars/${vehicle.slug}`}
          variant="outline"
          size="sm"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Icon name="eye" className="h-4 w-4" />
          View listing
        </ButtonLink>
      </AdminPageHeader>

      <div className="grid gap-6 xl:grid-cols-[1fr_18rem]">
        <VehicleForm vehicle={vehicle} />

        {/* Publishing facts the editor should not have to guess at. */}
        <aside className="flex flex-col gap-6">
          <Panel title="Listing facts">
            <dl className="flex flex-col gap-3.5">
              <DetailRow label="Public URL">
                <Link
                  href={`/cars/${vehicle.slug}`}
                  target="_blank"
                  className="text-brand-600 hover:underline"
                >
                  /cars/{vehicle.slug}
                </Link>
              </DetailRow>
              <DetailRow label="Page views">{formatNumber(vehicle.views)}</DetailRow>
              <DetailRow label="Created">{formatDateTime(vehicle.createdAt)}</DetailRow>
              <DetailRow label="Last updated">{formatDateTime(vehicle.updatedAt)}</DetailRow>
            </dl>
          </Panel>

          <Panel title="Publishing tips">
            <ul className="flex flex-col gap-3 text-sm text-ink-500">
              <li className="flex gap-2.5">
                <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
                Set the status to <strong className="font-semibold text-ink-700">Sold</strong> rather
                than deleting, so the sale stays in your analytics.
              </li>
              <li className="flex gap-2.5">
                <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
                The first photo is the cover shown on cards, search results and social shares.
              </li>
              <li className="flex gap-2.5">
                <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
                Changing make, model, trim or year also changes the page URL — share the new link
                rather than the old one.
              </li>
            </ul>
          </Panel>
        </aside>
      </div>
    </div>
  );
}
