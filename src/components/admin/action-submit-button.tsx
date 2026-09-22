"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Icon, type IconName } from "@/components/ui/icon";

/**
 * Submit button for the admin's compact action forms (status changes, delete).
 * Lives inside its `<form>` so `useFormStatus` can report the pending state.
 */
export function ActionSubmitButton({
  children,
  icon,
  confirmMessage,
  pendingLabel = "Saving…",
  variant = "outline",
  size = "sm",
  className,
  title,
}: {
  children: React.ReactNode;
  icon?: IconName;
  /** When set, the browser asks for confirmation before submitting. */
  confirmMessage?: string;
  pendingLabel?: string;
  variant?: React.ComponentProps<typeof Button>["variant"];
  size?: React.ComponentProps<typeof Button>["size"];
  className?: string;
  title?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      variant={variant}
      size={size}
      disabled={pending}
      aria-busy={pending}
      title={title}
      className={className}
      onClick={(event) => {
        if (confirmMessage && !window.confirm(confirmMessage)) {
          event.preventDefault();
        }
      }}
    >
      {pending ? (
        <Icon name="spinner" className="h-3.5 w-3.5 animate-spin" />
      ) : icon ? (
        <Icon name={icon} className="h-3.5 w-3.5" />
      ) : null}
      {pending ? pendingLabel : children}
    </Button>
  );
}
