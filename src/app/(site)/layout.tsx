import { SiteFooter } from "@/components/site/footer";
import { SiteHeader } from "@/components/site/header";

/**
 * Public marketing/showroom shell. Route groups don't affect URLs, so this
 * file supplies the chrome for `/`, `/inventory`, `/cars/[slug]`, etc., while
 * the admin area gets its own layout.
 */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
