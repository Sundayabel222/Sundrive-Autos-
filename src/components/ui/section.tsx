import { cn } from "@/lib/cn";

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "left",
  tone = "dark",
  className,
  children,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  align?: "left" | "center";
  tone?: "dark" | "light";
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      {eyebrow && (
        <span className={cn("eyebrow", tone === "light" && "text-brand-400")}>
          <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
          {eyebrow}
        </span>
      )}

      <h2
        className={cn(
          "mt-3 text-3xl leading-[1.15] font-bold sm:text-4xl lg:text-[2.75rem]",
          tone === "light" ? "text-white" : "text-ink-900",
        )}
      >
        {title}
      </h2>

      {subtitle && (
        <p
          className={cn(
            "mt-4 text-base leading-relaxed sm:text-lg",
            tone === "light" ? "text-white/60" : "text-ink-500",
          )}
        >
          {subtitle}
        </p>
      )}

      {children}
    </div>
  );
}

/** Vertical rhythm wrapper for full-width page sections. */
export function Section({
  children,
  className,
  id,
  tone = "white",
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
  tone?: "white" | "surface" | "dark";
}) {
  return (
    <section
      id={id}
      className={cn(
        "py-16 sm:py-20 lg:py-24",
        tone === "surface" && "bg-ink-50",
        tone === "dark" && "surface-dark",
        className,
      )}
    >
      <div className="container-page">{children}</div>
    </section>
  );
}
