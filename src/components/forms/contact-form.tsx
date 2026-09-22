"use client";

import { useActionState } from "react";
import { submitContact } from "@/actions/leads";
import { Field, FormAlert, Input, Textarea } from "@/components/ui/field";
import { SubmitButtonWide } from "@/components/ui/submit-button";
import { Icon } from "@/components/ui/icon";
import type { ActionState } from "@/lib/validation";

const INITIAL: ActionState = { ok: false };

/** General contact form (PRD §10). */
export function ContactForm({ defaultSubject }: { defaultSubject?: string }) {
  const [state, formAction] = useActionState(submitContact, INITIAL);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <FormAlert tone={state.ok ? "success" : "error"} message={state.message} />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Full name" htmlFor="contact-name" error={state.errors?.name} required>
          <Input
            id="contact-name"
            name="name"
            autoComplete="name"
            placeholder="Ada Obi"
            required
            error={state.errors?.name}
          />
        </Field>

        <Field label="Phone number" htmlFor="contact-phone" error={state.errors?.phone}>
          <Input
            id="contact-phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="+234 800 000 0000"
            error={state.errors?.phone}
          />
        </Field>
      </div>

      <Field label="Email address" htmlFor="contact-email" error={state.errors?.email} required>
        <Input
          id="contact-email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
          error={state.errors?.email}
        />
      </Field>

      <Field
        label="Subject"
        htmlFor="contact-subject"
        hint="Optional — e.g. financing, a specific vehicle, or corporate fleet."
        error={state.errors?.subject}
      >
        <Input
          id="contact-subject"
          name="subject"
          defaultValue={defaultSubject}
          placeholder="Enquiry about a vehicle"
          error={state.errors?.subject}
        />
      </Field>

      <Field label="Message" htmlFor="contact-message" error={state.errors?.message} required>
        <Textarea
          id="contact-message"
          name="message"
          rows={6}
          placeholder="Tell us what you're looking for and we'll take it from there."
          required
          error={state.errors?.message}
        />
      </Field>

      <div className="flex flex-wrap items-center gap-4">
        <SubmitButtonWide pendingLabel="Sending message…">
          <Icon name="mail" className="h-4 w-4" />
          Send message
        </SubmitButtonWide>
        <p className="text-xs text-ink-400">We reply within one business day.</p>
      </div>
    </form>
  );
}
