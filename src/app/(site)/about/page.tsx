import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ButtonAnchor, ButtonLink } from "@/components/ui/button";
import { Icon, type IconName } from "@/components/ui/icon";
import { Section, SectionHeading } from "@/components/ui/section";
import { StaggerItem, StaggerList } from "@/components/motion/reveal";
import {
  achievements,
  businessClaims,
  contact,
  site,
  socials,
  team,
  whatsappLink,
} from "@/lib/config";
import { coreValues, whyChooseUs } from "@/lib/constants";
import { formatNumber } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "About Us",
  description: `${site.name} has been sourcing, inspecting and delivering premium vehicles and imports since ${site.established}. Meet the team and see how we work.`,
  alternates: { canonical: "/about" },
};

export default async function AboutPage() {
  const [inventoryCount, brandCount, testimonials, delivered] = await Promise.all([
    prisma.vehicle.count({ where: { status: { in: ["AVAILABLE", "RESERVED"] } } }),
    prisma.vehicle.findMany({ distinct: ["make"], select: { make: true } }),
    prisma.testimonial.findMany({ where: { published: true }, select: { rating: true } }),
    prisma.vehicle.count({ where: { status: "SOLD" } }),
  ]);

  const yearsTrading = new Date().getFullYear() - site.established;
  const averageRating =
    testimonials.length > 0
      ? (testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length).toFixed(1)
      : null;

  const stats = [
    { value: `${yearsTrading}+`, label: "Years trading" },
    { value: `${formatNumber(inventoryCount)}`, label: "Cars in stock today" },
    { value: `${brandCount.length}`, label: "Premium brands handled" },
    {
      value: `${formatNumber(businessClaims.vehiclesDelivered)}+`,
      label: "Vehicles delivered",
    },
  ];

  return (
    <>
      {/* Hero */}
      <section className="surface-dark texture-grid relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 right-0 h-[28rem] w-[28rem] rounded-full bg-brand-500/20 blur-[130px]"
        />
        <div className="container-page relative py-12 lg:py-16">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-white/50">
            <Link href="/" className="transition-colors hover:text-white">
              Home
            </Link>
            <Icon name="chevronRight" className="h-3.5 w-3.5" />
            <span className="text-white/80">About</span>
          </nav>

          <div className="mt-5 max-w-2xl">
            <span className="eyebrow text-brand-400">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
              About {site.name}
            </span>
            <h1 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
              A dealership built on transparency, not sales talk
            </h1>
            <p className="mt-4 text-base leading-relaxed text-white/60">
              {site.description}
            </p>
          </div>

          <dl className="mt-12 grid max-w-3xl grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label}>
                <dt className="font-display text-2xl font-bold text-white">{stat.value}</dt>
                <dd className="mt-0.5 text-xs text-white/45">{stat.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Story */}
      <Section>
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <div>
            <SectionHeading
              eyebrow="Our Story"
              title="Started with one import and a spreadsheet"
              subtitle={`What began in ${site.established} as a single imported SUV sold to a friend has become a full showroom, workshop and sourcing operation.`}
            />

            <div className="mt-8 flex flex-col gap-5 text-[0.9375rem] leading-relaxed text-ink-600">
              <p>
                We started because buying a premium car in this market was needlessly stressful.
                Listings were vague, mileage was unverifiable, prices moved between the advert and
                the showroom, and nobody would put a condition report in writing. Customers were
                left to guess — usually after a long drive.
              </p>
              <p>
                So we built the opposite of that. Every vehicle we take on is physically inspected
                and history-checked before it is listed, priced once and left alone, and photographed
                honestly — including the bits that aren&apos;t perfect. If a car isn&apos;t right for
                you, we&apos;d rather say so than close a sale you&apos;ll regret.
              </p>
              <p>
                Today we stock premium SUVs, sedans and performance cars, source and import to order
                through partner dealers and auction channels, and deliver nationwide with the
                paperwork handled. {formatNumber(delivered)}+ vehicles sold and the same approach
                hasn&apos;t changed.
              </p>
            </div>

            <div className="mt-9 flex flex-wrap gap-3">
              <ButtonLink href="/inventory">
                Browse inventory
                <Icon name="arrowRight" className="h-4 w-4" />
              </ButtonLink>
              <ButtonAnchor
                href={whatsappLink(`Hi ${site.name}, I'd like to know more about your dealership.`)}
                target="_blank"
                rel="noopener noreferrer"
                variant="outline"
              >
                <Icon name="whatsapp" className="h-4 w-4 text-[#25D366]" />
                Chat with us
              </ButtonAnchor>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="rounded-3xl border border-ink-100 bg-white p-7 shadow-[var(--shadow-card)]">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-600">
                <Icon name="sparkle" className="h-5 w-5" />
              </span>
              <h2 className="mt-4 font-display text-lg font-bold text-ink-900">Our mission</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-500">
                To make buying a premium vehicle straightforward, honest and low-risk — for every
                customer, on every budget, whether they visit the showroom or buy from another
                state.
              </p>
            </div>

            <div className="rounded-3xl bg-ink-900 p-7">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-white/10 text-brand-400">
                <Icon name="eye" className="h-5 w-5" />
              </span>
              <h2 className="mt-4 font-display text-lg font-bold text-white">Our vision</h2>
              <p className="mt-2 text-sm leading-relaxed text-white/60">
                To be the most trusted name in premium vehicle retail and sourcing across the
                region — the dealership people recommend without hesitation, and the first call
                when a specific car is needed.
              </p>
            </div>

            {averageRating && (
              <div className="rounded-3xl border border-ink-100 bg-white p-7 shadow-[var(--shadow-card)]">
                <div className="flex gap-0.5" aria-label={`${averageRating} out of 5 stars`}>
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Icon
                      key={index}
                      name="star"
                      className={
                        index < Math.round(Number(averageRating))
                          ? "h-4 w-4 text-amber-400"
                          : "h-4 w-4 text-ink-200"
                      }
                    />
                  ))}
                </div>
                <p className="mt-3 font-display text-2xl font-bold text-ink-900">
                  {averageRating} / 5
                </p>
                <p className="mt-1 text-sm text-ink-500">
                  Average rating across {formatNumber(testimonials.length)} published reviews
                </p>
              </div>
            )}
          </div>
        </div>
      </Section>

      {/* Core values */}
      <Section tone="surface">
        <SectionHeading
          align="center"
          eyebrow="Core Values"
          title="What we hold ourselves to"
          subtitle="Four rules that decide how we buy, how we price and how we talk to customers."
        />

        <StaggerList className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {coreValues.map((value, index) => (
            <StaggerItem key={value.title} className="h-full">
              <div className="h-full rounded-2xl border border-ink-100 bg-white p-7 shadow-[var(--shadow-card)]">
                <span className="font-display text-3xl font-extrabold text-brand-100">
                  0{index + 1}
                </span>
                <h3 className="mt-3 font-display text-lg font-bold text-ink-900">{value.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-500">{value.description}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerList>
      </Section>

      {/* Why choose us */}
      <Section>
        <SectionHeading
          eyebrow="Why Choose Us"
          title="Six reasons buyers keep coming back"
          subtitle="The practical things that make the difference between a good experience and a stressful one."
        />

        <StaggerList className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {whyChooseUs.map((item) => (
            <StaggerItem key={item.title} className="h-full">
              <div className="flex h-full gap-4 rounded-2xl border border-ink-100 bg-white p-6 shadow-[var(--shadow-card)]">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
                  <Icon name={item.icon as IconName} className="h-5 w-5" />
                </span>
                <span>
                  <h3 className="font-display text-base font-bold text-ink-900">{item.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-500">{item.description}</p>
                </span>
              </div>
            </StaggerItem>
          ))}
        </StaggerList>
      </Section>

      {/* Team */}
      <Section tone="surface">
        <SectionHeading
          align="center"
          eyebrow="Meet The Team"
          title="The people you'll actually deal with"
          subtitle="No call centre. The same faces from your first enquiry to your handover."
        />

        <StaggerList className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {team.map((member) => (
            <StaggerItem key={member.name} className="h-full">
              <div className="flex h-full flex-col items-center rounded-2xl border border-ink-100 bg-white p-7 text-center shadow-[var(--shadow-card)]">
                {member.photo ? (
                  <span className="relative h-20 w-20 overflow-hidden rounded-full">
                    <Image
                      src={member.photo}
                      alt={member.name}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </span>
                ) : (
                  <span className="grid h-20 w-20 place-items-center rounded-full bg-brand-50 font-display text-xl font-bold text-brand-600">
                    {member.name
                      .split(" ")
                      .map((part) => part[0])
                      .join("")
                      .slice(0, 2)}
                  </span>
                )}

                <h3 className="mt-4 font-display text-base font-bold text-ink-900">
                  {member.name}
                </h3>
                <p className="mt-0.5 text-xs font-semibold tracking-wide text-brand-600 uppercase">
                  {member.role}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-ink-500">{member.bio}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerList>
      </Section>

      {/* Achievements */}
      <Section>
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <SectionHeading
              eyebrow="Achievements"
              title="Where we've got to so far"
              subtitle="Milestones that came from doing the unglamorous work properly."
            />

            <ul className="mt-8 flex flex-col gap-4">
              {achievements.map((item) => (
                <li key={item} className="flex items-start gap-3 text-[0.9375rem] text-ink-600">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-600">
                    <Icon name="check" className="h-3 w-3" />
                  </span>
                  {item}
                </li>
              ))}
              <li className="flex items-start gap-3 text-[0.9375rem] text-ink-600">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-600">
                  <Icon name="check" className="h-3 w-3" />
                </span>
                {formatNumber(businessClaims.vehiclesDelivered)}+ vehicles delivered since{" "}
                {site.established}
              </li>
            </ul>
          </div>

          <div className="rounded-3xl bg-ink-900 p-8 lg:p-10">
            <h2 className="font-display text-2xl font-bold text-white">
              Come and see the cars for yourself
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-white/60">
              {contact.addressLines.join(", ")}. Walk in during opening hours, or book a slot so a
              specialist is free when you arrive.
            </p>

            <div className="mt-7 flex flex-col gap-2.5 sm:flex-row">
              <ButtonLink href="/inspection" size="lg">
                <Icon name="calendar" className="h-4 w-4" />
                Book Inspection
              </ButtonLink>
              <ButtonAnchor
                href={`tel:${contact.phone}`}
                variant="outline"
                size="lg"
                className="border-white/20 bg-transparent text-white hover:border-white/40 hover:bg-white/10"
              >
                <Icon name="phone" className="h-4 w-4" />
                Call us
              </ButtonAnchor>
            </div>

            <div className="mt-8 flex items-center gap-2 border-t border-white/10 pt-7">
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-white/70 transition-colors hover:border-brand-500 hover:bg-brand-500 hover:text-white"
                >
                  <Icon name={social.icon as IconName} className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
