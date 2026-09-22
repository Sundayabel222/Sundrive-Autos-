import Link from "next/link";
import { SiteFooter } from "@/components/site/footer";
import { SiteHeader } from "@/components/site/header";
import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { mainNav } from "@/lib/constants";

export const metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

/**
 * Global 404. It sits outside the `(site)` route group, so it renders the
 * header and footer itself to keep visitors inside the showroom experience.
 */
export default function NotFound() {
  return (
    <>
      <SiteHeader />

      <main id="main" className="flex flex-1 items-center bg-ink-50 py-16 lg:py-24">
        <div className="container-page">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5 text-xs font-semibold tracking-wide text-brand-700 uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
              Error 404
            </span>

            <h1 className="mt-6 text-3xl font-bold text-ink-900 sm:text-4xl">
              This page has driven off
            </h1>
            <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-ink-500">
              The link may be out of date, or the vehicle you were looking for has been sold and
              removed from the showroom. Let&apos;s get you back on track.
            </p>

            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <ButtonLink href="/inventory" size="lg">
                View Inventory
                <Icon name="arrowRight" className="h-4 w-4" />
              </ButtonLink>
              <ButtonLink href="/" variant="outline" size="lg">
                Back to homepage
              </ButtonLink>
            </div>

            <div className="mt-12 border-t border-ink-100 pt-8">
              <p className="text-xs font-semibold tracking-wide text-ink-400 uppercase">
                Popular destinations
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {mainNav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-full border border-ink-200 bg-white px-4 py-2 text-sm font-medium text-ink-600 transition-colors hover:border-brand-300 hover:text-brand-600"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            <p className="mt-10 text-sm text-ink-400">
              Still stuck? Call the showroom and we&apos;ll help you find the vehicle you wanted.
            </p>
          </div>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
