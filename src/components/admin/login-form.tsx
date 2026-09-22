"use client";

import { useActionState } from "react";
import { login } from "@/actions/auth";
import { Field, FormAlert, Input } from "@/components/ui/field";
import { Icon } from "@/components/ui/icon";
import { SubmitButtonWide } from "@/components/ui/submit-button";
import type { ActionState } from "@/lib/validation";

const INITIAL: ActionState = { ok: false };

/** Staff sign-in form (PRD §12 "secure login"). */
export function LoginForm({ next }: { next?: string }) {
  const [state, formAction] = useActionState(login, INITIAL);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {/* Where to land after signing in — the proxy sets this from the requested URL. */}
      {next && <input type="hidden" name="next" value={next} />}

      <FormAlert tone={state.ok ? "success" : "error"} message={state.message} />

      <Field label="Email address" htmlFor="login-email" error={state.errors?.email} required>
        <Input
          id="login-email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="username"
          placeholder="you@sundriveautos.com"
          required
          error={state.errors?.email}
        />
      </Field>

      <Field label="Password" htmlFor="login-password" error={state.errors?.password} required>
        <Input
          id="login-password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          required
          error={state.errors?.password}
        />
      </Field>

      <SubmitButtonWide pendingLabel="Signing in…">
        <Icon name="logout" className="h-4 w-4 rotate-180" />
        Sign in to dashboard
      </SubmitButtonWide>
    </form>
  );
}
