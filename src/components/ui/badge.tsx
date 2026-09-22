import { cn } from "@/lib/cn";
import { STATUS_TONE } from "@/lib/constants";

export type Tone = "blue" | "amber" | "green" | "red" | "gray" | "dark";

const tones: Record<Tone, string> = {
  blue: "bg-brand-50 text-brand-700 ring-brand-200",
  amber: "bg-amber-50 text-amber-700 ring-amber-200",
  green: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  red: "bg-red-50 text-red-700 ring-red-200",
  gray: "bg-ink-100 text-ink-600 ring-ink-200",
  dark: "bg-ink-900 text-white ring-ink-900",
};

export function Badge({
  tone = "gray",
  children,
  className,
}: {
  tone?: Tone;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Badge for a database status string, using the shared tone mapping. */
export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const tone = (STATUS_TONE[status] ?? "gray") as Tone;
  const label = status
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return (
    <Badge tone={tone} className={className}>
      {label}
    </Badge>
  );
}
