"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/cn";

/**
 * Must be rendered inside the `<form>` it submits — `useFormStatus` reads the
 * pending state of the nearest parent form.
 */
export function SubmitButton({
  children,
  pendingLabel = "Please wait…",
  className,
  ...props
}: { pendingLabel?: string } & Omit<React.ComponentProps<typeof Button>, "type">) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} aria-busy={pending} className={className} {...props}>
      {pending && <Icon name="spinner" className="h-4 w-4 animate-spin" />}
      {pending ? pendingLabel : children}
    </Button>
  );
}

/** Slightly larger variant for the primary form action on public pages. */
export function SubmitButtonWide({
  children,
  pendingLabel,
  className,
  ...props
}: { pendingLabel?: string } & Omit<React.ComponentProps<typeof Button>, "type">) {
  return (
    <SubmitButton
      size="lg"
      className={cn("w-full sm:w-auto", className)}
      pendingLabel={pendingLabel}
      {...props}
    >
      {children}
    </SubmitButton>
  );
}
