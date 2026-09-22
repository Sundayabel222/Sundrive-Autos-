import Link from "next/link";
import { VehicleForm } from "@/components/admin/vehicle-form";
import { AdminPageHeader } from "@/components/admin/page-parts";
import { Icon } from "@/components/ui/icon";

export const metadata = { title: "Add vehicle" };

export default function NewVehiclePage() {
  return (
    <div className="flex flex-col gap-6">
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-ink-400">
        <Link href="/admin/inventory" className="transition-colors hover:text-brand-600">
          Inventory
        </Link>
        <Icon name="chevronRight" className="h-3.5 w-3.5" />
        <span className="text-ink-600">Add vehicle</span>
      </nav>

      <AdminPageHeader
        title="Add a vehicle"
        description="Publish a new listing. Photos upload straight to your media host; the listing goes live as soon as you save it."
      />

      <VehicleForm />
    </div>
  );
}
