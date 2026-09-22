import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/forms/contact-form";
import { ButtonAnchor, ButtonLink } from "@/components/ui/button";
import { Icon, type IconName } from "@/components/ui/icon";
import { Section } from "@/components/ui/section";
import {
  contact,
  mapDirectionsUrl,
  mapEmbedSrc,
  site,
  socials,
  whatsappLink,
} from "@/lib/config";

export const metadata: Metadata = {
  title: "Contact Us",
  description: `Speak to ${site.name} by phone, email or WhatsApp, or visit our showroom. Send a message and we'll reply within one business day.`,
  alternates: { canonical: "/contact" },
};

export default async function ContactPage(props: PageProps<"/contact">) {
  const searchParams = await props.searchParams;

  // "Request Financing" on a vehicle page links here with a subject prefilled.
  const subject = typeof searchParams.subject === "string" ? searchParams.subject : undefined;

  const methods: Array<{
    icon: IconName;
    label: string;
    value: string;
    href: string;
    external?: boolean;
    hint: string;
    iconClassName?: string;
  }> = [
    {
      icon: "phone",
      label: "Call the showroom",
      value: contact.phoneDisplay,
      href: `tel:${contact.phone}`,
      hint: "Fastest answer during opening hours",
    },
    {
      icon: "whatsapp",
      label: "WhatsApp",
      value: "Chat with a specialist",
      href: whatsappLink(),
      external: true,
      hint: "Send photos, specs or questions",
      iconClassName: "text-[#25D366]",
    },
    {
      icon: "mail",
      label: "Email",
      value: contact.email,
      href: `mailto:${contact.email}`,
      hint: "For financing and documentation",
    },
    {
      icon: "mapPin",
      label: "Visit us",
      value: contact.addressLines.join(", "),
      href: mapDirectionsUrl,
      external: true,
      hint: "Open six days a week",
    },
  ];

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
            <span className="text-white/80">Contact</span>
          </nav>

          <div className="mt-5 max-w-2xl">
            <span className="eyebrow text-brand-400">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
              Get In Touch
            </span>
            <h1 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
              Talk to the team at {site.name}
            </h1>
            <p className="mt-4 text-base leading-relaxed text-white/60">
              Questions about a listing, financing, delivery or paperwork? Pick whichever channel
              suits you — a real person answers every one of them.
            </p>
          </div>
        </div>
      </section>

      {/* Contact methods */}
      <Section className="py-12 lg:py-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {methods.map((method) => (
            <a
              key={method.label}
              href={method.href}
              {...(method.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="group flex flex-col rounded-2xl border border-ink-100 bg-white p-6 shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-[var(--shadow-lift)]"
            >
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-500 group-hover:text-white">
                <Icon name={method.icon} className={`h-5 w-5 ${method.iconClassName ?? ""}`} />
              </span>
              <span className="mt-4 text-xs font-semibold tracking-wide text-ink-400 uppercase">
                {method.label}
              </span>
              <span className="mt-1 text-sm font-semibold break-words text-ink-900">
                {method.value}
              </span>
              <span className="mt-3 text-xs leading-relaxed text-ink-400">{method.hint}</span>
            </a>
          ))}
        </div>
      </Section>

      <Section tone="surface" className="py-12 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-14">
          <div className="rounded-3xl border border-ink-100 bg-white p-6 shadow-[var(--shadow-card)] sm:p-8 lg:p-10">
            <h2 className="font-display text-2xl font-bold text-ink-900">Send us a message</h2>
            <p className="mt-2 text-sm text-ink-500">
              Tell us what you need and we&apos;ll come back to you within one business day.
            </p>
            <div className="mt-7">
              <ContactForm defaultSubject={subject} />
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="overflow-hidden rounded-3xl border border-ink-100 shadow-[var(--shadow-card)]">
              <iframe
                title={`Map showing ${site.name}`}
                src={mapEmbedSrc}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-72 w-full lg:h-80"
              />
              <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-5">
                <div>
                  <p className="text-sm font-semibold text-ink-900">Showroom</p>
                  {contact.addressLines.map((line) => (
                    <p key={line} className="text-xs text-ink-500">
                      {line}
                    </p>
                  ))}
                </div>
                <ButtonAnchor
                  href={mapDirectionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="outline"
                  size="sm"
                >
                  <Icon name="mapPin" className="h-3.5 w-3.5" />
                  Directions
                </ButtonAnchor>
              </div>
            </div>

            <div className="rounded-3xl border border-ink-100 bg-white p-6 sm:p-7">
              <h2 className="font-display text-lg font-bold text-ink-900">Opening hours</h2>
              <dl className="mt-5 flex flex-col gap-3">
                {contact.hours.map((slot) => (
                  <div
                    key={slot.days}
                    className="flex items-center justify-between border-b border-ink-100 pb-3 text-sm last:border-b-0 last:pb-0"
                  >
                    <dt className="text-ink-500">{slot.days}</dt>
                    <dd className="font-semibold text-ink-900">{slot.time}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="rounded-3xl border border-ink-100 bg-white p-6 sm:p-7">
              <h2 className="font-display text-lg font-bold text-ink-900">Follow the showroom</h2>
              <p className="mt-2 text-sm text-ink-500">
                New arrivals and walkaround videos go up on our socials first.
              </p>
              <div className="mt-5 grid grid-cols-2 gap-2.5">
                {socials.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 rounded-xl border border-ink-100 px-4 py-3 text-sm font-medium text-ink-600 transition-colors hover:border-brand-300 hover:text-brand-600"
                  >
                    <Icon name={social.icon as IconName} className="h-4 w-4" />
                    {social.label}
                  </a>
                ))}
              </div>
            </div>

            <div className="rounded-3xl bg-ink-900 p-6 sm:p-7">
              <h2 className="font-display text-lg font-bold text-white">Ready to see a car?</h2>
              <p className="mt-2 text-sm leading-relaxed text-white/60">
                Book an inspection slot and we&apos;ll have the vehicle prepared for you.
              </p>
              <ButtonLink href="/inspection" className="mt-5 w-full sm:w-auto">
                <Icon name="calendar" className="h-4 w-4" />
                Book an inspection
              </ButtonLink>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
