import Image from "next/image";
import Link from "next/link";
import { Reveal, StaggerItem, StaggerList } from "@/components/motion/reveal";
import { QuickSearch } from "@/components/site/quick-search";
import { VehicleCard } from "@/components/site/vehicle-card";
import { Badge } from "@/components/ui/badge";
import { ButtonAnchor, ButtonLink } from "@/components/ui/button";
import { Icon, type IconName } from "@/components/ui/icon";
import { Section, SectionHeading } from "@/components/ui/section";
import { businessClaims, contact, mapEmbedSrc, site, whatsappLink } from "@/lib/config";
import { whyChooseUs } from "@/lib/constants";
import { formatNumber, formatPrice } from "@/lib/format";
import {
  getFeaturedVehicles,
  getInventoryFacets,
  getRecentVehicles,
  listVehicles,
} from "@/lib/queries";
import { prisma } from "@/lib/prisma";
import { primaryImage, vehicleTitle, vehicleShortTitle } from "@/lib/vehicle";
import { Button } from "@/components/ui/button";

export const revalidate = 300;

export default async function HomePage() {
  const [featured, recent, facets, testimonials, inventoryCount, brandCount, spotlightPage] =
    await Promise.all([
      getFeaturedVehicles(6),
      getRecentVehicles(3),
      getInventoryFacets(),
      prisma.testimonial.findMany({
        where: { published: true },
        orderBy: { createdAt: "desc" },
        take: 6,
      }),
      prisma.vehicle.count({ where: { status: { in: ["AVAILABLE", "RESERVED"] } } }),
      prisma.vehicle.findMany({ distinct: ["make"], select: { make: true } }),
      listVehicles({ sort: "price-desc" }, { publicOnly: true, pageSize: 1 }),
    ]);

  const spotlight = spotlightPage.items[0] ?? featured[0] ?? null;
  const yearsTrading = Math.max(1, new Date().getFullYear() - site.established);

  const stats = [
    { value: `${formatNumber(inventoryCount)}+`, label: "Cars in stock" },
    { value: `${brandCount.length}`, label: "Premium brands" },
    { value: `${yearsTrading}+`, label: "Years trading" },
    { value: `${formatNumber(businessClaims.vehiclesDelivered)}+`, label: "Cars delivered" },
  ];

  return (
    <>
      {/* ------------------------------------------------------------------ */}
      {/* Hero                                                                */}
      {/* ------------------------------------------------------------------ */}
      <section className="surface-dark texture-grid relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 -right-32 h-[38rem] w-[38rem] rounded-full bg-brand-500/20 blur-[130px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-52 -left-32 h-[32rem] w-[32rem] rounded-full bg-brand-700/25 blur-[130px]"
        />

        <div className="container-page relative py-16 lg:py-24">
          <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
            {/* Copy */}
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-white/75 backdrop-blur-sm">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-400" />
                Trusted by {formatNumber(businessClaims.vehiclesDelivered)}+ drivers nationwide
              </span>

              <h1 className="mt-6 text-4xl leading-[1.08] font-extrabold text-white sm:text-5xl lg:text-[3.5rem]">
                Your Trusted Destination For{" "}
                <span className="bg-gradient-to-r from-brand-400 to-brand-200 bg-clip-text text-transparent">
                  Premium Cars
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-base leading-relaxed text-white/65 sm:text-lg">
                Hand-picked high-end vehicles and imports — every unit inspected, priced
                transparently, and delivered anywhere in the country. Browse the showroom, book an
                inspection, or ask us to source something specific.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <ButtonLink href="/inventory" size="lg">
                  View Inventory
                  <Icon name="arrowRight" className="h-4 w-4" />
                </ButtonLink>
                <ButtonLink
                  href="/inspection"
                  variant="white"
                  size="lg"
                  className="border-white/25 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
                >
                  Book Inspection
                </ButtonLink>
              </div>

              <dl className="mt-12 grid max-w-lg grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4">
                {stats.map((stat) => (
                  <div key={stat.label}>
                    <dt className="font-display text-2xl font-bold text-white">{stat.value}</dt>
                    <dd className="mt-0.5 text-xs text-white/45">{stat.label}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Spotlight vehicle */}
            <div className="relative">
              {spotlight ? (
                <Link
                  href={`/cars/${spotlight.slug}`}
                  className="group block overflow-hidden rounded-3xl border border-white/12 bg-white/5 p-2 backdrop-blur-sm transition-colors hover:border-brand-400/60"
                >
                  <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-ink-800">
                    <Image
                      src={primaryImage(spotlight)}
                      alt={vehicleTitle(spotlight)}
                      fill
                      priority
                      sizes="(max-width: 1024px) 100vw, 45vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-ink-950/90 to-transparent" />

                    <div className="absolute top-4 left-4 flex gap-2">
                      <Badge tone="blue">Top of the range</Badge>
                    </div>

                    <div className="absolute inset-x-4 bottom-4">
                      <p className="text-xs font-medium tracking-wider text-white/60 uppercase">
                        Available now
                      </p>
                      <h2 className="mt-1 font-display text-xl font-bold text-white sm:text-2xl">
                        {vehicleTitle(spotlight)}
                      </h2>
                      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/70">
                        <span className="font-display text-lg font-bold text-brand-400">
                          {formatPrice(spotlight.price)}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Icon name="gauge" className="h-4 w-4" />
                          {formatNumber(spotlight.mileage)} km
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Icon name="mapPin" className="h-4 w-4" />
                          {spotlight.location}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ) : (
                <div className="grid aspect-[4/3] place-items-center rounded-3xl border border-white/12 bg-white/5 text-white/50">
                  Inventory coming soon
                </div>
              )}
            </div>
          </div>

          {/* Quick search */}
          <div className="mt-14">
            <QuickSearch
              makes={facets.makes}
              maxPrice={facets.priceMax}
              locations={facets.locations}
            />
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Featured cars                                                       */}
      {/* ------------------------------------------------------------------ */}
      <Section>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            eyebrow="Featured Inventory"
            title="Hand-picked vehicles from our showroom"
            subtitle="A rotating selection of our best-presented stock, each one inspected before it goes on the floor."
          />
          <ButtonLink href="/inventory" variant="outline" className="shrink-0">
            View all {formatNumber(inventoryCount)} cars
            <Icon name="arrowRight" className="h-4 w-4" />
          </ButtonLink>
        </div>

        <StaggerList className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.length > 0 ? (
            featured.slice(0, 6).map((vehicle, index) => (
              <StaggerItem key={vehicle.id} className="h-full">
                <VehicleCard vehicle={vehicle} priority={index < 3} className="h-full" />
              </StaggerItem>
            ))
          ) : (
            <p className="col-span-full rounded-2xl border border-dashed border-ink-200 p-10 text-center text-ink-500">
              No featured vehicles yet.{" "}
              <Link href="/inventory" className="font-semibold text-brand-600">
                Browse the full inventory
              </Link>
              .
            </p>
          )}
        </StaggerList>
      </Section>

      {/* ------------------------------------------------------------------ */}
      {/* Why choose us                                                       */}
      {/* ------------------------------------------------------------------ */}
      <Section tone="surface">
        <SectionHeading
          align="center"
          eyebrow="Why Choose Sundrive Autos"
          title="Buying a car should feel straightforward"
          subtitle="We built our process around the things buyers actually worry about: condition, price and paperwork."
        />

        <StaggerList className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {whyChooseUs.map((item) => (
            <StaggerItem key={item.title} className="h-full">
              <div className="group h-full rounded-2xl border border-ink-100 bg-white p-7 shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-[var(--shadow-lift)]">
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-500 group-hover:text-white">
                  <Icon name={item.icon as IconName} className="h-6 w-6" />
                </span>
                <h3 className="mt-5 font-display text-lg font-bold text-ink-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-500">{item.description}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerList>
      </Section>

      {/* ------------------------------------------------------------------ */}
      {/* Recently added                                                      */}
      {/* ------------------------------------------------------------------ */}
      {recent.length > 0 && (
        <Section>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading
              eyebrow="Just Landed"
              title="Recently added to the lot"
              subtitle="Fresh arrivals, updated automatically as new stock is added to the showroom."
            />
            <ButtonLink href="/inventory?sort=newest" variant="outline" className="shrink-0">
              See newest first
              <Icon name="arrowRight" className="h-4 w-4" />
            </ButtonLink>
          </div>

          <StaggerList className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recent.map((vehicle) => (
              <StaggerItem key={vehicle.id} className="h-full">
                <VehicleCard vehicle={vehicle} className="h-full" />
              </StaggerItem>
            ))}
          </StaggerList>
        </Section>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Testimonials                                                        */}
      {/* ------------------------------------------------------------------ */}
      {testimonials.length > 0 && (
        <Section tone="surface">
          <SectionHeading
            align="center"
            eyebrow="Customer Testimonials"
            title="What our buyers say"
            subtitle="Real feedback from customers who found their car with Sundrive Autos."
          />

          <StaggerList className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((t) => (
              <StaggerItem key={t.id} className="h-full">
                <figure className="flex h-full flex-col rounded-2xl border border-ink-100 bg-white p-7 shadow-[var(--shadow-card)]">
                  <div className="flex gap-0.5" aria-label={`${t.rating} out of 5 stars`}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Icon
                        key={i}
                        name="star"
                        className={i < t.rating ? "h-4 w-4 text-amber-400" : "h-4 w-4 text-ink-200"}
                      />
                    ))}
                  </div>

                  <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-ink-600">
                    “{t.message}”
                  </blockquote>

                  <figcaption className="mt-6 border-t border-ink-100 pt-5">
                    <p className="font-semibold text-ink-900">{t.name}</p>
                    <p className="text-xs text-ink-400">
                      {t.location}
                      {t.vehicle ? ` · ${t.vehicle}` : ""}
                    </p>
                  </figcaption>
                </figure>
              </StaggerItem>
            ))}
          </StaggerList>
        </Section>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Sourcing banner                                                     */}
      {/* ------------------------------------------------------------------ */}
      <section className="relative overflow-hidden bg-ink-900">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-brand-700/35 via-brand-500/10 to-transparent"
        />
        <div className="container-page relative py-16 lg:py-20">
          <div className="grid items-center gap-10 lg:grid-cols-[1.3fr_0.7fr]">
            <Reveal>
              <span className="eyebrow text-brand-400">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
                Vehicle Sourcing
              </span>
              <h2 className="mt-3 text-3xl leading-tight font-bold text-white sm:text-4xl">
                Can&apos;t find your dream car?
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/60">
                Tell us the exact make, model, year and budget you&apos;re after. We&apos;ll search
                our dealer network and import channels, then come back with real options —
                condition reports included.
              </p>

              <ul className="mt-7 grid gap-3 sm:grid-cols-3">
                {["No obligation quote", "Import & clearing handled", "Weekly progress updates"].map(
                  (point) => (
                    <li key={point} className="flex items-center gap-2.5 text-sm text-white/75">
                      <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand-500/20 text-brand-300">
                        <Icon name="check" className="h-3 w-3" />
                      </span>
                      {point}
                    </li>
                  ),
                )}
              </ul>
            </Reveal>

            <Reveal delay={0.1} className="lg:justify-self-end">
              <div className="flex flex-col gap-3">
                <ButtonLink href="/sourcing" size="lg">
                  Request Vehicle
                  <Icon name="arrowRight" className="h-4 w-4" />
                </ButtonLink>
                <ButtonAnchor
                  href={whatsappLink("Hi Sundrive Autos, I'd like help sourcing a specific vehicle.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="outline"
                  size="lg"
                  className="border-white/20 bg-transparent text-white hover:border-white/40 hover:bg-white/10"
                >
                  <Icon name="whatsapp" className="h-4 w-4" />
                  Ask on WhatsApp
                </ButtonAnchor>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Contact + map                                                       */}
      {/* ------------------------------------------------------------------ */}
      <Section id="contact">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <SectionHeading
              eyebrow="Visit Us"
              title="Come and see the cars in person"
              subtitle="Our showroom is open six days a week. Walk in, or book a slot so a specialist is free when you arrive."
            />

            <div className="mt-9 space-y-4">
              <ContactRow
                icon="phone"
                label="Call us"
                value={contact.phoneDisplay}
                href={`tel:${contact.phone}`}
              />
              <ContactRow
                icon="mail"
                label="Email"
                value={contact.email}
                href={`mailto:${contact.email}`}
              />
              <ContactRow
                icon="whatsapp"
                label="WhatsApp"
                value="Chat with a specialist"
                href={whatsappLink()}
                external
                iconClassName="text-[#25D366]"
              />
              <ContactRow
                icon="mapPin"
                label="Showroom"
                value={contact.addressLines.join(", ")}
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contact.address)}`}
                external
              />
            </div>

            <div className="mt-9 flex flex-wrap gap-3">
              <ButtonLink href="/contact">Send a message</ButtonLink>
              <ButtonLink href="/inspection" variant="outline">
                Book an inspection
              </ButtonLink>
            </div>

            <div className="mt-9 grid gap-3 border-t border-ink-100 pt-7 sm:grid-cols-3">
              {contact.hours.map((h) => (
                <div key={h.days}>
                  <p className="text-xs font-semibold tracking-wide text-ink-400 uppercase">
                    {h.days}
                  </p>
                  <p className="mt-1 text-sm font-medium text-ink-800">{h.time}</p>
                </div>
              ))}
            </div>
          </div>

          <Reveal className="lg:pt-4">
            <div className="overflow-hidden rounded-3xl border border-ink-100 shadow-[var(--shadow-card)]">
              <iframe
                title={`Map showing ${site.name}`}
                src={mapEmbedSrc}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-[26rem] w-full lg:h-full lg:min-h-[32rem]"
              />
            </div>
          </Reveal>
        </div>
      </Section>
    </>
  );
}

function ContactRow({
  icon,
  label,
  value,
  href,
  external,
  iconClassName,
}: {
  icon: IconName;
  label: string;
  value: string;
  href: string;
  external?: boolean;
  iconClassName?: string;
}) {
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="group flex items-center gap-4 rounded-2xl border border-ink-100 bg-white p-4 transition-all hover:border-brand-200 hover:shadow-[var(--shadow-card)]"
    >
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-ink-50 text-ink-500 transition-colors group-hover:bg-brand-50 group-hover:text-brand-600">
        <Icon name={icon} className={`h-5 w-5 ${iconClassName ?? ""}`} />
      </span>
      <span className="min-w-0">
        <span className="block text-xs font-medium tracking-wide text-ink-400 uppercase">
          {label}
        </span>
        <span className="block truncate text-sm font-semibold text-ink-900">{value}</span>
      </span>
      <Icon
        name="arrowUpRight"
        className="ml-auto h-4 w-4 shrink-0 text-ink-300 transition-colors group-hover:text-brand-500"
      />
    </a>
  );
}
