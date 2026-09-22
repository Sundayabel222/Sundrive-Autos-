import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Shared control styling so inputs, selects and textareas stay consistent. */
const controlBase =
  "w-full rounded-xl border bg-white text-[0.9375rem] text-ink-900 transition-colors placeholder:text-ink-300 focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:bg-ink-50 disabled:text-ink-400";

const controlTone = {
  normal: "border-ink-200 focus:border-brand-500 focus:ring-brand-500/15",
  error: "border-red-400 focus:border-red-500 focus:ring-red-500/15",
} as const;

function toneFor(error?: string) {
  return error ? controlTone.error : controlTone.normal;
}

export function Field({
  label,
  htmlFor,
  error,
  hint,
  required,
  children,
  className,
}: {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={htmlFor} className="text-sm font-semibold text-ink-700">
        {label}
        {required && <span className="ml-0.5 text-brand-500">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-ink-400">{hint}</p>}
      {error && (
        <p role="alert" className="text-xs font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

export function Input({
  error,
  className,
  ...props
}: { error?: string } & ComponentProps<"input">) {
  return (
    <input
      aria-invalid={error ? true : undefined}
      className={cn(controlBase, toneFor(error), "h-11 px-4", className)}
      {...props}
    />
  );
}

export function Textarea({
  error,
  className,
  ...props
}: { error?: string } & ComponentProps<"textarea">) {
  return (
    <textarea
      aria-invalid={error ? true : undefined}
      className={cn(controlBase, toneFor(error), "min-h-28 resize-y px-4 py-3", className)}
      {...props}
    />
  );
}

export function Select({
  error,
  className,
  children,
  ...props
}: { error?: string } & ComponentProps<"select">) {
  return (
    <div className="relative">
      <select
        aria-invalid={error ? true : undefined}
        className={cn(
          controlBase,
          toneFor(error),
          "h-11 cursor-pointer appearance-none pr-10",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        className="pointer-events-none absolute top-1/2 right-4 h-4 w-4 -translate-y-1/2 text-ink-400"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </div>
  );
}

/** Green inline success message used on public forms. */
export function FormAlert({
  tone = "error",
  message,
}: {
  tone?: "error" | "success";
  message?: string;
}) {
  if (!message) return null;

  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "rounded-xl border px-4 py-3 text-sm",
        tone === "error"
          ? "border-red-200 bg-red-50 text-red-700"
          : "border-emerald-200 bg-emerald-50 text-emerald-800",
      )}
    >
      {message}
    </div>
  );
}
