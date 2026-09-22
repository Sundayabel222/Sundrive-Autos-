import { Icon, type IconName } from "@/components/ui/icon";
import { cn } from "@/lib/cn";

/**
 * Small presentational pieces shared by every admin screen, so headers, panels
 * and stat tiles look identical across the console.
 */

export function AdminPageHeader({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-5">
      <div className="max-w-2xl">
        <h2 className="font-display text-2xl font-bold text-ink-900 sm:text-[1.75rem]">{title}</h2>
        {description && (
          <p className="mt-2 text-sm leading-relaxed text-ink-500">{description}</p>
        )}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  );
}

export function Panel({
  title,
  description,
  action,
  children,
  className,
  bodyClassName,
}: {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-ink-100 bg-white shadow-[var(--shadow-card)]",
        className,
      )}
    >
      {(title || action) && (
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-100 px-5 py-4">
          <div>
            {title && <h3 className="font-display text-base font-bold text-ink-900">{title}</h3>}
            {description && <p className="mt-1 text-xs text-ink-400">{description}</p>}
          </div>
          {action}
        </header>
      )}
      <div className={cn("p-5", bodyClassName)}>{children}</div>
    </section>
  );
}

const statTones = {
  blue: "bg-brand-50 text-brand-600",
  green: "bg-emerald-50 text-emerald-600",
  amber: "bg-amber-50 text-amber-600",
  red: "bg-red-50 text-red-600",
  gray: "bg-ink-100 text-ink-600",
} as const;

export function StatCard({
  icon,
  label,
  value,
  hint,
  tone = "blue",
  href,
}: {
  icon: IconName;
  label: string;
  value: string;
  hint?: string;
  tone?: keyof typeof statTones;
  href?: string;
}) {
  const body = (
    <>
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-semibold tracking-wide text-ink-400 uppercase">{label}</span>
        <span className={cn("grid h-9 w-9 place-items-center rounded-xl", statTones[tone])}>
          <Icon name={icon} className="h-5 w-5" />
        </span>
      </div>
      <p className="mt-3 font-display text-2xl font-bold text-ink-900">{value}</p>
      {hint && <p className="mt-1 text-xs text-ink-400">{hint}</p>}
    </>
  );

  const className =
    "block rounded-2xl border border-ink-100 bg-white p-5 shadow-[var(--shadow-card)] transition-colors";

  if (href) {
    return (
      <a href={href} className={cn(className, "hover:border-brand-300")}>
        {body}
      </a>
    );
  }

  return <div className={className}>{body}</div>;
}

export function EmptyState({
  icon = "inbox",
  title,
  description,
  children,
}: {
  icon?: IconName;
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-ink-200 bg-white px-6 py-12 text-center">
      <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-ink-50 text-ink-400">
        <Icon name={icon} className="h-5 w-5" />
      </span>
      <h3 className="mt-4 font-display text-base font-bold text-ink-900">{title}</h3>
      {description && (
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-500">{description}</p>
      )}
      {children && <div className="mt-5 flex flex-wrap justify-center gap-2">{children}</div>}
    </div>
  );
}

/** Key/value line used inside detail cards. */
export function DetailRow({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap justify-between gap-2 text-sm", className)}>
      <dt className="text-ink-400">{label}</dt>
      <dd className="font-medium text-ink-800">{children}</dd>
    </div>
  );
}
