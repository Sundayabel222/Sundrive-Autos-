import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { ButtonAnchor, ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Section, SectionHeading } from "@/components/ui/section";
import { VehicleCard } from "@/components/site/vehicle-card";
import { VehicleGallery } from "@/components/site/vehicle-gallery";
import { VehicleViewTracker } from "@/components/site/vehicle-view-tracker";
import { contact, site, whatsappLink } from "@/lib/config";
import { VehicleStatus } from "@/lib/constants";
import { formatDate, formatMileage, formatNumber, formatPrice, truncate } from "@/lib/format";
import { getSimilarVehicles, getVehicleBySlug } from "@/lib/queries";
import { prisma } from "@/lib/prisma";
import { primaryImage, specsOf, vehicleFeatures, vehicleImages, vehicleTitle } from "@/lib/vehicle";

/**
 * Detail pages are statically generated and revalidated, so the showroom stays
 * fast without going stale when the admin edits inventory (which calls
 * `revalidatePath('/cars/…')`).
 */
export const revalidate = 300;

export async function generateStaticParams() {
  const vehicles = await prisma.vehicle.findMany({
    where: { status: { in: [VehicleStatus.AVAILABLE, VehicleStatus.RESERVED] } },
    select: { slug: true },
    take: 200,
  });

  return vehicles.map((vehicle) => ({ slug: vehicle.slug }));
}

export async function generateMetadata(
  props: PageProps<"/cars/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const vehicle = await getVehicleBySlug(slug);

  if (!vehicle) return { title: "Vehicle not found" };

  const title = vehicleTitle(vehicle);
  const description = truncate(
    `${title} for sale at ${site.name} — ${formatMileage(vehicle.mileage)}, ${vehicle.transmission}, ${vehicle.fuelType}, located in ${vehicle.location}. ${vehicle.description}`,
    160,
  );

  return {
    title: `${title} — ${formatPrice(vehicle.price)}`,
    description,
    alternates: { canonical: `/cars/${vehicle.slug}` },
    openGraph: {
      type: "website",
      title: `${title} — ${formatPrice(vehicle.price)}`,
      description,
      url: `/cars/${vehicle.slug}`,
      images: [{ url: primaryImage(vehicle), alt: title }],
    },
  };
}

export default async function VehicleDetailPage(props: PageProps<"/cars/[slug]">) {
  const { slug } = await props.params;
  const vehicle = await getVehicleBySlug(slug);

  if (!vehicle) notFound();

  const [similar] = await Promise.all([getSimilarVehicles(vehicle, 3)]);

  const title = vehicleTitle(vehicle);
  const images = vehicleImages(vehicle);
  const features = vehicleFeatures(vehicle);
  const specs = specsOf(vehicle);
  const sold = vehicle.status === VehicleStatus.SOLD;

  const enquiryMessage = `Hi ${site.name}, I'd like to know more about the ${title} (${formatPrice(
    vehicle.price,
  )}) listed on your website.`;
  const financingSubject = `Financing enquiry — ${title}`;

  /** Vehicle + offer structured data so listings can surface as rich results. */
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Car",
    name: title,
    brand: { "@type": "Brand", name: vehicle.make },
    model: vehicle.model,
    vehicleModelDate: String(vehicle.year),
    bodyType: vehicle.bodyType,
    color: vehicle.exteriorColor,
    fuelType: vehicle.fuelType,
    vehicleTransmission: vehicle.transmission,
    vehicleIdentificationNumber: vehicle.vin ?? undefined,
    mileageFromOdometer: { "@type": "QuantitativeValue", value: vehicle.mileage, unitCode: "KMT" },
    numberOfPreviousOwners: undefined,
    itemCondition: vehicle.condition === "Brand New" ? "https://schema.org/NewCondition" : "https://schema.org/UsedCondition",
    image: images.map((image) => new URL(image, site.url).toString()),
    description: vehicle.description,
    url: `${site.url}/cars/${vehicle.slug}`,
    offers: {
      "@type": "Offer",
      price: vehicle.price,
      priceCurrency: "NGN",
      availability: sold
        ? "https://schema.org/SoldOut"
        : vehicle.status === VehicleStatus.RESERVED
          ? "https://schema.org/LimitedAvailability"
          : "https://schema.org/InStock",
      seller: { "@type": "AutoDealer", name: site.name, telephone: contact.phone },
    },
  };

  return (
    <>
      <VehicleViewTracker vehicleId={vehicle.id} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* Breadcrumb + title bar */}
      <section className="border-b border-ink-100 bg-white">
        <div className="container-page py-6 lg:py-8">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs text-ink-400">
            <Link href="/" className="transition-colors hover:text-brand-600">
              Home
            </Link>
            <Icon name="chevronRight" className="h-3.5 w-3.5" />
            <Link href="/inventory" className="transition-colors hover:text-brand-600">
              Inventory
            </Link>
            <Icon name="chevronRight" className="h-3.5 w-3.5" />
            <span className="text-ink-700">{title}</span>
          </nav>

          <div className="mt-5 flex flex-wrap items-start justify-between gap-5">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                {vehicle.featured && !sold && <Badge tone="dark">Featured</Badge>}
                <StatusBadge status={vehicle.status} />
                <Badge tone="gray">{vehicle.condition}</Badge>
              </div>

              <h1 className="mt-3 text-2xl font-bold text-ink-900 sm:text-3xl lg:text-4xl">
                {title}
              </h1>

              <p className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-ink-500">
                <span className="flex items-center gap-1.5">
                  <Icon name="mapPin" className="h-4 w-4 text-ink-300" />
                  {vehicle.location}
                </span>
                <span className="flex items-center gap-1.5">
                  <Icon name="gauge" className="h-4 w-4 text-ink-300" />
                  {formatMileage(vehicle.mileage)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Icon name="eye" className="h-4 w-4 text-ink-300" />
                  {formatNumber(vehicle.views)} views
                </span>
                <span className="flex items-center gap-1.5">
                  <Icon name="calendar" className="h-4 w-4 text-ink-300" />
                  Listed {formatDate(vehicle.createdAt)}
                </span>
              </p>
            </div>

            <div className="text-right">
              <p className="text-xs font-medium tracking-wider text-ink-400 uppercase">Price</p>
              <p className="font-display text-3xl font-bold text-ink-900">
                {formatPrice(vehicle.price)}
              </p>
              <p className="mt-1 text-xs text-ink-400">Duty &amp; registration included</p>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery + purchase panel */}
      <Section tone="surface" className="py-10 sm:py-12 lg:py-14">
        <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr] lg:gap-12">
          <div>
            <VehicleGallery images={images} alt={title} />

            {vehicle.videoUrl && (
              <a
                href={vehicle.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm font-semibold text-ink-700 transition-colors hover:border-brand-300 hover:text-brand-600"
              >
                <Icon name="eye" className="h-4 w-4" />
                Watch video walkaround
              </a>
            )}

            {/* Description */}
            <div className="mt-10 rounded-2xl border border-ink-100 bg-white p-6 shadow-[var(--shadow-card)] lg:p-8">
              <h2 className="font-display text-xl font-bold text-ink-900">About this vehicle</h2>
              <p className="mt-4 text-[0.9375rem] leading-relaxed whitespace-pre-line text-ink-600">
                {vehicle.description}
              </p>

              {features.length > 0 && (
                <>
                  <h3 className="mt-8 font-display text-base font-bold text-ink-900">
                    Features &amp; equipment
                  </h3>
                  <ul className="mt-4 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                    {features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5 text-sm text-ink-600">
                        <span className="mt-0.5 grid h-4.5 w-4.5 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-600">
                          <Icon name="check" className="h-3 w-3" />
                        </span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>

            {/* Specification table */}
            <div className="mt-6 rounded-2xl border border-ink-100 bg-white p-6 shadow-[var(--shadow-card)] lg:p-8">
              <h2 className="font-display text-xl font-bold text-ink-900">Specifications</h2>
              <dl className="mt-5 grid gap-x-8 gap-y-0 sm:grid-cols-2">
                {specs.map((spec) => (
                  <div
                    key={spec.label}
                    className="flex items-center justify-between gap-4 border-b border-ink-100 py-3 text-sm last:border-b-0"
                  >
                    <dt className="text-ink-400">{spec.label}</dt>
                    <dd className="text-right font-semibold text-ink-900">{spec.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          {/* Sticky enquiry panel */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-ink-100 bg-white p-6 shadow-[var(--shadow-lift)]">
              <p className="font-display text-2xl font-bold text-ink-900">
                {formatPrice(vehicle.price)}
              </p>
              <p className="mt-1 text-xs text-ink-400">
                {sold ? "This vehicle has been sold" : "Price negotiable on inspection"}
              </p>

              <div className="mt-6 flex flex-col gap-2.5">
                {!sold && (
                  <ButtonLink href={`/inspection?vehicle=${vehicle.slug}`} size="lg">
                    <Icon name="calendar" className="h-4 w-4" />
                    Book Inspection
                  </ButtonLink>
                )}

                <ButtonAnchor href={`tel:${contact.phone}`} variant="dark" size="lg">
                  <Icon name="phone" className="h-4 w-4" />
                  Call Dealer
                </ButtonAnchor>

                <ButtonAnchor
                  href={whatsappLink(enquiryMessage)}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="whatsapp"
                  size="lg"
                >
                  <Icon name="whatsapp" className="h-4 w-4" />
                  WhatsApp Dealer
                </ButtonAnchor>

                <ButtonLink
                  href={`/contact?subject=${encodeURIComponent(financingSubject)}`}
                  variant="outline"
                  size="lg"
                >
                  <Icon name="card" className="h-4 w-4" />
                  Request Financing
                </ButtonLink>
              </div>

              <div className="mt-6 space-y-3 border-t border-ink-100 pt-6">
                {[
                  { icon: "verified" as const, text: "Independently inspected & history checked" },
                  { icon: "truck" as const, text: "Nationwide delivery available" },
                  { icon: "shield" as const, text: "Full documentation and papers on handover" },
                ].map((item) => (
                  <p key={item.text} className="flex items-start gap-2.5 text-xs leading-relaxed text-ink-500">
                    <Icon name={item.icon} className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
                    {item.text}
                  </p>
                ))}
              </div>

              <p className="mt-6 rounded-xl bg-ink-50 px-4 py-3 text-center text-xs text-ink-500">
                Prefer to see it first?{" "}
                <Link href="/inspection" className="font-semibold text-brand-600 hover:text-brand-700">
                  Book an inspection slot
                </Link>
              </p>
            </div>
          </aside>
        </div>
      </Section>

      {/* Similar cars */}
      {similar.length > 0 && (
        <Section>
          <SectionHeading
            eyebrow="You may also like"
            title="Similar vehicles in stock"
            subtitle={`Other ${vehicle.bodyType.toLowerCase()}s and ${vehicle.make} models currently available in our showroom.`}
          />

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {similar.map((item) => (
              <VehicleCard key={item.id} vehicle={item} />
            ))}
          </div>

          <div className="mt-10 flex justify-center">
            <ButtonLink href="/inventory" variant="outline">
              Browse the full inventory
              <Icon name="arrowRight" className="h-4 w-4" />
            </ButtonLink>
          </div>
        </Section>
      )}
    </>
  );
}
