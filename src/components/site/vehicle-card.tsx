import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/cn";
import { VehicleStatus } from "@/lib/constants";
import { formatMileage, formatPrice } from "@/lib/format";
import { primaryImage, vehicleTitle } from "@/lib/vehicle";
import type { Vehicle } from "@/generated/prisma/client";

export function VehicleCard({
  vehicle,
  priority = false,
  className,
}: {
  vehicle: Vehicle;
  priority?: boolean;
  className?: string;
}) {
  const sold = vehicle.status === VehicleStatus.SOLD;

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-[var(--shadow-lift)]",
        className,
      )}
    >
      <Link href={`/cars/${vehicle.slug}`} className="flex h-full flex-col">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-ink-50">
          <Image
            src={primaryImage(vehicle)}
            alt={vehicleTitle(vehicle)}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority={priority}
            className={cn(
              "object-cover transition-transform duration-500 group-hover:scale-[1.04]",
              sold && "opacity-70 grayscale-[0.5]",
            )}
          />

          <div className="absolute top-3 left-3 flex flex-wrap gap-2">
            {vehicle.featured && !sold && <Badge tone="dark">Featured</Badge>}
            {vehicle.status === VehicleStatus.RESERVED && <Badge tone="amber">Reserved</Badge>}
            {sold && <Badge tone="red">Sold</Badge>}
          </div>

          {vehicle.condition === "Brand New" && (
            <div className="absolute top-3 right-3">
              <Badge tone="blue">Brand New</Badge>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col p-5">
          <h3 className="font-display text-lg leading-snug font-bold text-ink-900 transition-colors group-hover:text-brand-600">
            {vehicleTitle(vehicle)}
          </h3>

          <p className="mt-1 flex items-center gap-1.5 text-xs text-ink-400">
            <Icon name="mapPin" className="h-3.5 w-3.5" />
            {vehicle.location}
          </p>

          {/* Spec chips */}
          <div className="mt-4 grid grid-cols-3 gap-2 border-y border-ink-100 py-3 text-xs text-ink-500">
            <Spec icon="calendar" label={String(vehicle.year)} />
            <Spec icon="gauge" label={formatMileage(vehicle.mileage)} />
            <Spec icon="gear" label={vehicle.transmission} />
          </div>

          <div className="mt-auto flex items-end justify-between gap-3 pt-5">
            <div>
              <p className="text-[0.7rem] font-medium tracking-wider text-ink-400 uppercase">
                Price
              </p>
              <p className="font-display text-xl font-bold text-ink-900">
                {formatPrice(vehicle.price)}
              </p>
            </div>

            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600">
              View Details
              <Icon
                name="arrowRight"
                className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
              />
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}

function Spec({ icon, label }: { icon: "calendar" | "gauge" | "gear"; label: string }) {
  return (
    <span className="flex min-w-0 items-center gap-1.5">
      <Icon name={icon} className="h-3.5 w-3.5 shrink-0 text-ink-300" />
      <span className="truncate">{label}</span>
    </span>
  );
}

/** Skeleton shown while `VehicleCard` grids stream in. */
export function VehicleCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-ink-100 bg-white">
      <div className="shimmer relative aspect-[4/3] bg-ink-50">
        <div className="shimmer-bar" />
      </div>
      <div className="space-y-4 p-5">
        <div className="h-5 w-3/4 rounded bg-ink-100" />
        <div className="h-3 w-1/3 rounded bg-ink-100" />
        <div className="h-14 rounded bg-ink-50" />
        <div className="flex justify-between">
          <div className="h-6 w-28 rounded bg-ink-100" />
          <div className="h-4 w-24 rounded bg-ink-100" />
        </div>
      </div>
    </div>
  );
}
