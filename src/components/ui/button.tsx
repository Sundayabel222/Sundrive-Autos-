import Link from "next/link";
import type { ButtonHTMLAttributes, ComponentProps } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "dark" | "outline" | "ghost" | "white" | "whatsapp";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-55";

const variants: Record<Variant, string> = {
  primary:
    "bg-brand-500 text-white shadow-[0_10px_26px_-12px_rgba(0,153,255,0.9)] hover:bg-brand-600 hover:shadow-[0_16px_32px_-12px_rgba(0,153,255,1)] active:scale-[0.985]",
  dark: "bg-ink-900 text-white hover:bg-ink-700 active:scale-[0.985]",
  outline:
    "border border-ink-200 bg-white text-ink-800 hover:border-ink-900 hover:bg-ink-50 active:scale-[0.985]",
  ghost: "text-ink-600 hover:bg-ink-50 hover:text-ink-900",
  white:
    "bg-white text-ink-900 border border-white/20 hover:bg-white/90 active:scale-[0.985]",
  whatsapp: "bg-[#25D366] text-white hover:bg-[#1FB855] active:scale-[0.985]",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-6 text-sm",
  lg: "h-13 px-8 text-base",
};

export function buttonClasses({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: Variant;
  size?: Size;
  className?: string;
} = {}) {
  return cn(base, variants[variant], sizes[size], className);
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: { variant?: Variant; size?: Size } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={buttonClasses({ variant, size, className })} {...props} />;
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  ...props
}: { variant?: Variant; size?: Size } & ComponentProps<typeof Link>) {
  return <Link className={buttonClasses({ variant, size, className })} {...props} />;
}

export function ButtonAnchor({
  variant = "primary",
  size = "md",
  className,
  ...props
}: { variant?: Variant; size?: Size } & ComponentProps<"a">) {
  return <a className={buttonClasses({ variant, size, className })} {...props} />;
}
