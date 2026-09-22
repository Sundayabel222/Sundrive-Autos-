import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/admin/login-form";
import { Logo } from "@/components/site/logo";
import { Icon } from "@/components/ui/icon";
import { contact, site } from "@/lib/config";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Staff Login",
  description: "Sundrive Autos staff console.",
  // Never index the console, and never leak it through a referrer.
  robots: { index: false, follow: false },
};

const perks = [
  "Publish and edit inventory with photos in minutes",
  "Approve, reschedule or reject inspection bookings",
  "Track sourcing requests and customer enquiries",
];

export default async function AdminLoginPage(props: PageProps<"/admin/login">) {
  const searchParams = await props.searchParams;
  const next = typeof searchParams.next === "string" ? searchParams.next : undefined;

  // Show a first-run hint instead of a dead end while the database is empty.
  const adminCount = await prisma.adminUser.count();

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      {/* Brand panel */}
      <div className="surface-dark texture-grid relative hidden overflow-hidden p-12 lg:flex lg:flex-col lg:justify-between">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 -right-24 h-[32rem] w-[32rem] rounded-full bg-brand-500/20 blur-[130px]"
        />

        <Logo size="md" tone="light" />

        <div className="relative max-w-md">
          <span className="eyebrow text-brand-400">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
            Staff Console
          </span>
          <h1 className="mt-4 text-3xl leading-tight font-bold text-white">
            Everything your showroom needs, in one place
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-white/60">
            Manage the inventory, work the lead queues and see what buyers are actually looking at —
            for {site.name}.
          </p>

          <ul className="mt-8 flex flex-col gap-3">
            {perks.map((perk) => (
              <li key={perk} className="flex items-start gap-3 text-sm text-white/75">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand-500/20 text-brand-300">
                  <Icon name="check" className="h-3 w-3" />
                </span>
                {perk}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-white/35">
          Need access? Call the showroom on {contact.phoneDisplay}.
        </p>
      </div>

      {/* Form panel */}
      <div className="flex flex-col justify-center bg-white px-6 py-14 sm:px-12 lg:px-16">
        <div className="mx-auto w-full max-w-sm">
          <div className="lg:hidden">
            <Logo size="md" />
          </div>

          <h2 className="mt-8 font-display text-2xl font-bold text-ink-900 lg:mt-0">
            Sign in to the dashboard
          </h2>
          <p className="mt-2 text-sm text-ink-500">
            Use your Sundrive Autos staff account. Sessions expire after 12 hours.
          </p>

          {adminCount === 0 && (
            <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              No staff accounts exist yet. Run{" "}
              <code className="rounded bg-white/70 px-1.5 py-0.5 text-xs font-semibold">
                npm run db:seed
              </code>{" "}
              to create the first administrator.
            </div>
          )}

          <div className="mt-7">
            <LoginForm next={next} />
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-ink-100 pt-6 text-xs text-ink-400">
            <Link href="/" className="font-semibold transition-colors hover:text-brand-600">
              ← Back to {site.name}
            </Link>
            <a
              href={`mailto:${contact.email}`}
              className="transition-colors hover:text-brand-600"
            >
              {contact.email}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
