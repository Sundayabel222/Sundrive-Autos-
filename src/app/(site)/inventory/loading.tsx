import { VehicleCardSkeleton } from "@/components/site/vehicle-card";

/** Streamed while the next result set is fetched, so filtering feels instant. */
export default function InventoryLoading() {
  return (
    <section className="bg-ink-50 py-10 lg:py-14">
      <div className="container-page">
        <div className="h-12 w-full animate-pulse rounded-xl bg-ink-100" />
        <div className="mt-8 grid gap-8 lg:grid-cols-[17rem_1fr] lg:gap-10">
          <div className="hidden h-[32rem] animate-pulse rounded-2xl bg-ink-100 lg:block" />
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <VehicleCardSkeleton key={index} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
