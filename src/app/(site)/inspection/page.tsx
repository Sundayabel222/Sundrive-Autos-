import type { Metadata } from "next";
import Link from "next/link";
import { InspectionForm } from "@/components/forms/inspection-form";
import { Badge } from "@/components/ui/badge";
import { ButtonAnchor, ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Section } from "@/components/ui/section";
import { contact, site, whatsappLink } from "@/lib/config";
import { formatMileage, formatPrice } from "@/lib/format";
import { getVehicleBySlug } from "@/lib/queries";
import { vehicleTitle } from "@/lib/vehicle";

export const metadata: Metadata = {
  title: "Book a Vehicle Inspection",
  description:
    "Book an inspection slot at Sundrive Autos. Pick a date and time, tell us which vehicle to prepare, and inspect it yourself before you commit.",
  alternates: { canonical: "/inspection" },
};

const expectations = [
  {
    icon: "clipboard" as const,
    title: "We prepare the vehicle",
    description:
      "The car is washed, fuelled and moved to a bay before you arrive, with its inspection report and documents ready.",
  },
  {
    icon: "shield" as const,
    title: "You inspect it yourself",
    description:
      "Bring a mechanic if you like. We show you everything — including any faults we already know about.",
  },
  {
    icon: "truck" as const,
    title: "Test drive & delivery",
    description:
      "Take it out on the road. If you're happy, we handle the paperwork and arrange delivery anywhere in the country.",
  },
];

export default async function InspectionPage(props: PageProps<"/inspection">) {
  const searchParams = await props.searchParams;

  // Arriving from a listing prefills the vehicle so the customer never retypes it.
  const requested = typeof searchParams.vehicle === "string" ? searchParams.vehicle : undefined;
  const vehicle = requested ? await getVehicleBySlug(requested) : null;

  return (
    <>
      <section className="surface-dark texture-grid relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 right-0 h-[26rem] w-[26rem] rounded-full bg-brand-500/20 blur-[120px]"
        />
        <div className="container-page relative py-12 lg:py-16">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-white/50">
            <Link href="/" className="transition-colors hover:text-white">
              Home
            </Link>
            <Icon name="chevronRight" className="h-3.5 w-3.5" />
            <span className="text-white/80">Book Inspection</span>
          </nav>

          <div className="mt-5 max-w-2xl">
            <span className="eyebrow text-brand-400">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
              Book Inspection
            </span>
            <h1 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
              See the car for yourself before you commit
            </h1>
            <p className="mt-4 text-base leading-relaxed text-white/60">
              Choose a slot that suits you and we&apos;ll have the vehicle ready. No deposit, no
              pressure — just a straight look at the car with a specialist on hand.
            </p>
          </div>
        </div>
      </section>

      <Section tone="surface" className="py-12 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.25fr_1fr] lg:gap-14">
          {/* Form */}
          <div className="rounded-3xl border border-ink-100 bg-white p-6 shadow-[var(--shadow-card)] sm:p-8 lg:p-10">
            <h2 className="font-display text-2xl font-bold text-ink-900">Request your slot</h2>
            <p className="mt-2 text-sm text-ink-500">
              Fields marked with <span className="text-brand-500">*</span> are required.
            </p>

            {vehicle && (
              <div className="mt-6 flex flex-wrap items-center gap-3 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3">
                <Badge tone="blue">Selected vehicle</Badge>
                <span className="text-sm font-semibold text-brand-900">{vehicleTitle(vehicle)}</span>
                <span className="text-sm text-brand-700">
                  {formatPrice(vehicle.price)} · {formatMileage(vehicle.mileage)}
                </span>
              </div>
            )}

            <div className="mt-7">
              <InspectionForm
                vehicleId={vehicle?.id}
                vehicleLabel={vehicle ? vehicleTitle(vehicle) : undefined}
              />
            </div>
          </div>

          {/* Supporting rail */}
          <div className="flex flex-col gap-6">
            <div className="rounded-3xl border border-ink-100 bg-white p-6 sm:p-7">
              <h2 className="font-display text-lg font-bold text-ink-900">What to expect</h2>
              <ul className="mt-5 flex flex-col gap-5">
                {expectations.map((item) => (
                  <li key={item.title} className="flex gap-4">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
                      <Icon name={item.icon} className="h-5 w-5" />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-ink-900">{item.title}</span>
                      <span className="mt-1 block text-sm leading-relaxed text-ink-500">
                        {item.description}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl bg-ink-900 p-6 sm:p-7">
              <h2 className="font-display text-lg font-bold text-white">Rather just talk to us?</h2>
              <p className="mt-2 text-sm leading-relaxed text-white/60">
                Call or WhatsApp the showroom and we&apos;ll find a slot that works around your
                schedule — including weekends.
              </p>

              <div className="mt-5 flex flex-col gap-2.5">
                <ButtonAnchor
                  href={whatsappLink(
                    `Hi ${site.name}, I'd like to book an inspection for a vehicle.`,
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="whatsapp"
                >
                  <Icon name="whatsapp" className="h-4 w-4" />
                  WhatsApp us
                </ButtonAnchor>
                <ButtonAnchor
                  href={`tel:${contact.phone}`}
                  variant="outline"
                  className="border-white/20 bg-transparent text-white hover:border-white/40 hover:bg-white/10"
                >
                  <Icon name="phone" className="h-4 w-4" />
                  {contact.phoneDisplay}
                </ButtonAnchor>
              </div>

              <div className="mt-6 space-y-3 border-t border-white/10 pt-6">
                {contact.hours.map((slot) => (
                  <div key={slot.days} className="flex items-center justify-between text-sm">
                    <span className="text-white/50">{slot.days}</span>
                    <span className="font-medium text-white/85">{slot.time}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-ink-100 bg-white p-6 sm:p-7">
              <h2 className="font-display text-lg font-bold text-ink-900">Where to find us</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-500">
                {contact.addressLines.join(", ")}
              </p>
              <ButtonLink href="/contact" variant="outline" className="mt-4">
                <Icon name="mapPin" className="h-4 w-4" />
                Showroom details
              </ButtonLink>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
