import Link from "next/link";
import { Logo } from "@/components/site/logo";
import { Icon, type IconName } from "@/components/ui/icon";
import { contact, mapDirectionsUrl, site, socials, whatsappLink } from "@/lib/config";
import { mainNav } from "@/lib/constants";

const quickLinks = mainNav.filter((item) => item.href !== "/");

const browseLinks = [
  { label: "All Inventory", href: "/inventory" },
  { label: "SUVs", href: "/inventory?bodyType=SUV" },
  { label: "Sedans", href: "/inventory?bodyType=Sedan" },
  { label: "Brand New", href: "/inventory?condition=Brand+New" },
  { label: "Under Budget", href: "/inventory?priceMax=15000000&sort=price-asc" },
];

export function SiteFooter() {
  return (
    <footer className="surface-dark mt-auto">
      <div className="container-page py-14 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          {/* Brand */}
          <div>
            <Logo size="md" tone="light" />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-white/60">
              {site.description}
            </p>
            <div className="mt-6 flex items-center gap-2">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-white/70 transition-colors hover:border-brand-500 hover:bg-brand-500 hover:text-white"
                >
                  <Icon name={s.icon as IconName} className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Explore */}
          <FooterColumn title="Explore">
            {quickLinks.map((item) => (
              <FooterLink key={item.href} href={item.href}>
                {item.label}
              </FooterLink>
            ))}
          </FooterColumn>

          {/* Browse */}
          <FooterColumn title="Browse Cars">
            {browseLinks.map((item) => (
              <FooterLink key={item.href} href={item.href}>
                {item.label}
              </FooterLink>
            ))}
          </FooterColumn>

          {/* Contact */}
          <FooterColumn title="Get In Touch">
            <li>
              <a
                href={`tel:${contact.phone}`}
                className="flex items-start gap-3 text-sm text-white/60 transition-colors hover:text-white"
              >
                <Icon name="phone" className="mt-0.5 h-4 w-4 text-brand-400" />
                {contact.phoneDisplay}
              </a>
            </li>
            <li>
              <a
                href={`mailto:${contact.email}`}
                className="flex items-start gap-3 text-sm text-white/60 transition-colors hover:text-white"
              >
                <Icon name="mail" className="mt-0.5 h-4 w-4 text-brand-400" />
                {contact.email}
              </a>
            </li>
            <li>
              <a
                href={whatsappLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 text-sm text-white/60 transition-colors hover:text-white"
              >
                <Icon name="whatsapp" className="mt-0.5 h-4 w-4 text-[#25D366]" />
                WhatsApp
              </a>
            </li>
            <li>
              <div className="flex items-start gap-3 text-sm text-white/60">
                <Icon name="mapPin" className="mt-0.5 h-4 w-4 shrink-0 text-brand-400" />
                <span>
                  {contact.addressLines.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </span>
              </div>
            </li>
          </FooterColumn>
        </div>

        {/* Hours */}
        <div className="mt-12 grid gap-4 border-t border-white/10 pt-8 sm:grid-cols-3">
          {contact.hours.map((h) => (
            <div key={h.days} className="flex items-center gap-3">
              <Icon name="clock" className="h-4 w-4 text-brand-400" />
              <span className="text-sm text-white/50">
                {h.days} · <span className="text-white/80">{h.time}</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col items-center justify-between gap-3 py-6 sm:flex-row">
          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} {site.name}. All rights reserved.
          </p>
          <div className="flex items-center gap-5 text-xs text-white/40">
            <Link href="/about" className="transition-colors hover:text-white/80">
              About
            </Link>
            <Link href="/contact" className="transition-colors hover:text-white/80">
              Contact
            </Link>
            <Link href="/admin" className="transition-colors hover:text-white/80">
              Staff Login
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-semibold tracking-[0.16em] text-white uppercase">{title}</h3>
      <ul className="mt-5 space-y-3">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link
        href={href}
        className="text-sm text-white/60 transition-colors hover:text-white"
      >
        {children}
      </Link>
    </li>
  );
}
