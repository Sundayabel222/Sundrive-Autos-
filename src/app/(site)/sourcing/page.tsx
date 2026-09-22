import type { Metadata } from "next";
import Link from "next/link";
import { SourcingForm } from "@/components/forms/sourcing-form";
import { ButtonAnchor } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Section, SectionHeading } from "@/components/ui/section";
import { site, whatsappLink } from "@/lib/config";

export const metadata: Metadata = {
  title: "Vehicle Sourcing & Import",
  description:
    "Can't find the exact car? Tell Sundrive Autos the make, model, year and budget and we'll source or import it for you, with condition reports and full clearing handled.",
  alternates: { canonical: "/sourcing" },
};

const steps = [
  {
    title: "Tell us exactly what you want",
    description:
      "Make, model, year range, budget and any must-have spec. A reference photo helps us match trim and colour.",
  },
  {
    title: "We search our network",
    description:
      "Dealer contacts, auction channels and import routes — we shortlist real cars, not catalogue listings.",
  },
  {
    title: "You get options with proof",
    description:
      "Condition reports, mileage verification and landed-cost pricing for each candidate, so you can compare properly.",
  },
  {
    title: "We handle the logistics",
    description:
      "Purchase, shipping, clearing, registration and delivery to your door. One point of contact throughout.",
  },
];

const advantages = [
  { icon: "verified" as const, label: "Pre-purchase inspection", detail: "Every sourced unit is inspected before money changes hands." },
  { icon: "tag" as const, label: "Transparent landed cost", detail: "Vehicle, shipping, duty and clearing quoted as one figure." },
  { icon: "clock" as const, label: "Weekly updates", detail: "Progress photos and status updates while the car is in transit." },
  { icon: "truck" as const, label: "Nationwide delivery", detail: "Delivered and handed over wherever you are in the country." },
];

export default function SourcingPage() {
  return (
    <>
      <section className="surface-dark texture-grid relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 right-0 h-[30rem] w-[30rem] rounded-full bg-brand-500/25 blur-[130px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-40 -left-24 h-[24rem] w-[24rem] rounded-full bg-brand-700/25 blur-[130px]"
        />

        <div className="container-page relative py-12 lg:py-16">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-white/50">
            <Link href="/" className="transition-colors hover:text-white">
              Home
            </Link>
            <Icon name="chevronRight" className="h-3.5 w-3.5" />
            <span className="text-white/80">Vehicle Sourcing</span>
          </nav>

          <div className="mt-5 grid items-end gap-10 lg:grid-cols-[1.3fr_0.7fr]">
            <div className="max-w-2xl">
              <span className="eyebrow text-brand-400">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
                Vehicle Sourcing
              </span>
              <h1 className="mt-3 text-3xl font-bold text-white sm:text-4xl lg:text-[2.75rem]">
                Can&apos;t find your dream car?
              </h1>
              <p className="mt-4 text-base leading-relaxed text-white/60">
                Give us the exact spec and budget and we&apos;ll find it — through our dealer
                network or by importing to order. You only commit once you&apos;ve seen real options
                with condition reports attached.
              </p>
            </div>

            <div className="flex flex-col gap-2.5 lg:items-end">
              <ButtonAnchor
                href={whatsappLink(
                  `Hi ${site.name}, I'd like help sourcing a specific vehicle over WhatsApp.`,
                )}
                target="_blank"
                rel="noopener noreferrer"
                variant="whatsapp"
                size="lg"
                className="w-full sm:w-auto"
              >
                <Icon name="whatsapp" className="h-4 w-4" />
                Send specs on WhatsApp
              </ButtonAnchor>
              <p className="text-xs text-white/45 lg:text-right">
                Prefer to talk it through? We answer within minutes.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Section tone="surface" className="py-12 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:gap-14">
          <div className="rounded-3xl border border-ink-100 bg-white p-6 shadow-[var(--shadow-card)] sm:p-8 lg:p-10">
            <h2 className="font-display text-2xl font-bold text-ink-900">Request a vehicle</h2>
            <p className="mt-2 text-sm text-ink-500">
              The more detail you give us, the sharper our shortlist. Everything here is optional
              except the basics.
            </p>
            <div className="mt-7">
              <SourcingForm />
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="rounded-3xl border border-ink-100 bg-white p-6 sm:p-7">
              <h2 className="font-display text-lg font-bold text-ink-900">How sourcing works</h2>
              <ol className="mt-6 flex flex-col gap-6">
                {steps.map((step, index) => (
                  <li key={step.title} className="flex gap-4">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-500 font-display text-sm font-bold text-white">
                      {index + 1}
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-ink-900">{step.title}</span>
                      <span className="mt-1 block text-sm leading-relaxed text-ink-500">
                        {step.description}
                      </span>
                    </span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="rounded-3xl bg-ink-900 p-6 sm:p-7">
              <h2 className="font-display text-lg font-bold text-white">What&apos;s included</h2>
              <ul className="mt-5 flex flex-col gap-4">
                {advantages.map((item) => (
                  <li key={item.label} className="flex gap-3.5">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/10 text-brand-400">
                      <Icon name={item.icon} className="h-4.5 w-4.5" />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-white">{item.label}</span>
                      <span className="mt-0.5 block text-xs leading-relaxed text-white/55">
                        {item.detail}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Section>

      {/* Reassurance band */}
      <Section>
        <SectionHeading
          align="center"
          eyebrow="No obligation"
          title="You only pay once you've approved the car"
          subtitle="Sourcing is free to request. We present options with inspection reports and a full landed cost, and nothing moves until you say yes."
        />

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {[
            { value: "24h", label: "Typical first response" },
            { value: "3–10 days", label: "Local sourcing timeline" },
            { value: "4–8 weeks", label: "Import timeline, end to end" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-ink-100 bg-white p-7 text-center shadow-[var(--shadow-card)]"
            >
              <p className="font-display text-3xl font-bold text-brand-600">{stat.value}</p>
              <p className="mt-2 text-sm text-ink-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
