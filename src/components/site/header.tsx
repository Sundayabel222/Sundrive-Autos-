"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "@/components/site/logo";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/cn";
import { contact, whatsappLink } from "@/lib/config";
import { mainNav } from "@/lib/constants";

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close the mobile panel whenever the route changes.
  useEffect(() => setOpen(false), [pathname]);

  // Prevent the page scrolling behind the open mobile panel.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 border-b border-ink-100 bg-white/85 backdrop-blur-xl">
      {/* Thin brand accent line */}
      <div className="h-0.5 w-full bg-gradient-to-r from-brand-500 via-brand-400 to-transparent" />

      <div className="container-page flex h-16 items-center justify-between gap-4 lg:h-[4.5rem]">
        <Logo size="md" />

        <nav aria-label="Main" className="hidden items-center gap-0.5 lg:flex">
          {mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={cn(
                "relative rounded-lg px-3.5 py-2 text-sm font-medium transition-colors",
                isActive(item.href)
                  ? "text-brand-600"
                  : "text-ink-500 hover:bg-ink-50 hover:text-ink-900",
              )}
            >
              {item.label}
              {isActive(item.href) && (
                <span className="absolute inset-x-3.5 -bottom-0.5 h-0.5 rounded-full bg-brand-500" />
              )}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <a
            href={`tel:${contact.phone}`}
            className="flex items-center gap-2 text-sm font-semibold text-ink-700 transition-colors hover:text-brand-600"
          >
            <Icon name="phone" className="h-4 w-4 text-brand-500" />
            {contact.phoneDisplay}
          </a>
          <Link
            href="/inspection"
            className="rounded-full bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_24px_-10px_rgba(0,153,255,0.8)] transition-all hover:bg-brand-600 hover:shadow-[0_14px_28px_-10px_rgba(0,153,255,0.9)]"
          >
            Book Inspection
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          className="grid h-10 w-10 place-items-center rounded-lg border border-ink-100 text-ink-700 transition-colors hover:bg-ink-50 lg:hidden"
        >
          <Icon name={open ? "close" : "menu"} />
        </button>
      </div>

      {/* Mobile panel */}
      <div
        id="mobile-nav"
        className={cn(
          "overflow-hidden border-t border-ink-100 bg-white transition-[max-height,opacity] duration-300 lg:hidden",
          open ? "max-h-[32rem] opacity-100" : "max-h-0 opacity-0",
        )}
      >
        <nav aria-label="Mobile" className="container-page flex flex-col gap-1 py-4">
          {mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-lg px-3 py-3 text-base font-medium transition-colors",
                isActive(item.href)
                  ? "bg-brand-50 text-brand-700"
                  : "text-ink-600 hover:bg-ink-50",
              )}
            >
              {item.label}
            </Link>
          ))}

          <div className="mt-3 flex flex-col gap-2 border-t border-ink-100 pt-4">
            <a
              href={`tel:${contact.phone}`}
              className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold text-ink-700"
            >
              <Icon name="phone" className="h-4 w-4 text-brand-500" />
              {contact.phoneDisplay}
            </a>
            <a
              href={whatsappLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold text-ink-700"
            >
              <Icon name="whatsapp" className="h-4 w-4 text-[#25D366]" />
              WhatsApp us
            </a>
            <Link
              href="/inspection"
              className="mt-1 rounded-full bg-brand-500 px-5 py-3 text-center text-sm font-semibold text-white"
            >
              Book Inspection
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
