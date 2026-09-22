import { CURRENCY } from "./constants";

/** Format a whole-unit price, e.g. 18500000 -> "₦18,500,000". */
export function formatPrice(value: number, options?: { compact?: boolean }) {
  return new Intl.NumberFormat(CURRENCY.locale, {
    style: "currency",
    currency: CURRENCY.code,
    maximumFractionDigits: CURRENCY.maximumFractionDigits,
    notation: options?.compact ? "compact" : "standard",
  }).format(value);
}

/** Format an odometer reading, e.g. 42000 -> "42,000 km". */
export function formatMileage(km: number) {
  return `${new Intl.NumberFormat("en-US").format(km)} km`;
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

export function formatDate(value: Date | string) {
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatTime(value: Date | string) {
  return new Date(value).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDateTime(value: Date | string) {
  return `${formatDate(value)} · ${formatTime(value)}`;
}

/** "3 days ago" style label for admin tables. */
export function timeAgo(value: Date | string) {
  const then = new Date(value).getTime();
  const seconds = Math.round((Date.now() - then) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.round(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.round(months / 12)}y ago`;
}

/**
 * Build the SEO-friendly vehicle URL segment described in PRD §17, e.g.
 * "lexus-is350-fsport-2014".
 */
export function vehicleSlug(input: {
  make: string;
  model: string;
  trim?: string | null;
  year: number;
  id?: string;
}) {
  const parts = [input.make, input.model, input.trim ?? "", String(input.year)];
  const base = slugify(parts.filter(Boolean).join(" "));
  return base;
}

export function slugify(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** `Date` -> value for an `<input type="date">`. */
export function toDateInputValue(value: Date | string) {
  const d = new Date(value);
  const offset = d.getTimezoneOffset();
  return new Date(d.getTime() - offset * 60_000).toISOString().slice(0, 10);
}

/** Truncate for meta descriptions and card copy. */
export function truncate(value: string, max: number) {
  if (value.length <= max) return value;
  return `${value.slice(0, max - 1).trimEnd()}…`;
}
