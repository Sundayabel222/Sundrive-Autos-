import Image from "next/image";
import Link from "next/link";
import { site } from "@/lib/config";
import { cn } from "@/lib/cn";

/**
 * Brand mark + wordmark.
 *
 * Use the supplied Sundrive Autos logo artwork in /public/logo.svg so the site
 * matches the company identity exactly.
 */
const LOGO_URL: string | null = "/logo.svg";

const sizeStyles = {
  sm: { mark: "h-7 w-7", text: "text-base", gap: "gap-2" },
  md: { mark: "h-9 w-9", text: "text-lg", gap: "gap-2.5" },
  lg: { mark: "h-12 w-12", text: "text-2xl", gap: "gap-3" },
} as const;

export function Logo({
  size = "md",
  tone = "dark",
  showTagline = false,
  className,
}: {
  size?: keyof typeof sizeStyles;
  /** "dark" = dark ink text on light backgrounds; "light" = white text on dark. */
  tone?: "dark" | "light";
  showTagline?: boolean;
  className?: string;
}) {
  const s = sizeStyles[size];

  return (
    <Link
      href="/"
      aria-label={`${site.name} — home`}
      className={cn("group inline-flex items-center", s.gap, className)}
    >
      {LOGO_URL ? (
        <Image
          src={LOGO_URL}
          alt={site.name}
          width={48}
          height={48}
          className={cn(s.mark, "object-contain")}
          priority
        />
      ) : (
        <BrandMark className={s.mark} />
      )}

      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "font-display font-extrabold tracking-tight",
            s.text,
            tone === "light" ? "text-white" : "text-ink-900",
          )}
        >
          {site.nameParts.leading}
          <span className="text-brand-500">{site.nameParts.accent}</span>
          <span className="font-semibold"> {site.nameParts.trailing}</span>
        </span>
        {showTagline && (
          <span
            className={cn(
              "mt-1 text-[0.6rem] font-medium tracking-[0.2em] uppercase",
              tone === "light" ? "text-white/60" : "text-ink-400",
            )}
          >
            Premium Vehicles
          </span>
        )}
      </span>
    </Link>
  );
}

/** Stylised "S" speed-mark in the brand blue gradient. */
function BrandMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "relative grid shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-700 shadow-[0_6px_18px_-6px_rgba(0,153,255,0.7)] transition-transform duration-300 group-hover:scale-105",
        className,
      )}
    >
      <svg viewBox="0 0 24 24" fill="none" className="h-[62%] w-[62%]">
        <path
          d="M17.5 7.2c-.9-1-2.4-1.6-4.1-1.6-3 0-5 1.4-5 3.6 0 2 1.5 2.9 4.3 3.5 2.1.4 2.8.8 2.8 1.6 0 .9-1 1.5-2.6 1.5-1.6 0-3-.6-3.9-1.5"
          stroke="white"
          strokeWidth="2.1"
          strokeLinecap="round"
        />
        <path d="M4 20.5h11" stroke="white" strokeOpacity=".55" strokeWidth="2.1" strokeLinecap="round" />
        <path d="M9 23h11" stroke="white" strokeOpacity=".3" strokeWidth="2.1" strokeLinecap="round" />
      </svg>
    </span>
  );
}
