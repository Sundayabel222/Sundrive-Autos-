"use client";

import { useActionState } from "react";
import { submitSourcing } from "@/actions/leads";
import { ReferenceImageUpload } from "@/components/forms/reference-image-upload";
import { Field, FormAlert, Input, Textarea } from "@/components/ui/field";
import { SubmitButtonWide } from "@/components/ui/submit-button";
import { Icon } from "@/components/ui/icon";
import { CURRENCY } from "@/lib/constants";
import type { ActionState } from "@/lib/validation";

const INITIAL: ActionState = { ok: false };

/** Vehicle sourcing request (PRD §8). */
export function SourcingForm() {
  const [state, formAction] = useActionState(submitSourcing, INITIAL);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <FormAlert tone={state.ok ? "success" : "error"} message={state.message} />

      {state.ok && (
        <p className="flex items-start gap-2.5 rounded-xl bg-brand-50 px-4 py-3 text-sm text-brand-800">
          <Icon name="verified" className="mt-0.5 h-4 w-4 shrink-0" />
          Our sourcing team reviews every request by hand and will call or WhatsApp you with real
          options — never a generic price list.
        </p>
      )}

      {/* Contact details */}
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Full name" htmlFor="customerName" error={state.errors?.customerName} required>
          <Input
            id="customerName"
            name="customerName"
            autoComplete="name"
            placeholder="Ada Obi"
            required
            error={state.errors?.customerName}
          />
        </Field>

        <Field label="Phone number" htmlFor="phone" error={state.errors?.phone} required>
          <Input
            id="phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="+234 800 000 0000"
            required
            error={state.errors?.phone}
          />
        </Field>
      </div>

      <Field label="Email address" htmlFor="email" error={state.errors?.email} required>
        <Input
          id="email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
          error={state.errors?.email}
        />
      </Field>

      <div className="rule-fade my-1" />

      {/* What they're looking for */}
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Vehicle brand" htmlFor="make" error={state.errors?.make} required>
          <Input
            id="make"
            name="make"
            placeholder="Mercedes-Benz"
            required
            error={state.errors?.make}
          />
        </Field>

        <Field label="Vehicle model" htmlFor="model" error={state.errors?.model} required>
          <Input
            id="model"
            name="model"
            placeholder="G-Class G63 AMG"
            required
            error={state.errors?.model}
          />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <Field label="Year from" htmlFor="yearFrom" error={state.errors?.yearFrom}>
          <Input
            id="yearFrom"
            name="yearFrom"
            type="number"
            inputMode="numeric"
            min={1950}
            max={new Date().getFullYear() + 1}
            placeholder="2019"
            error={state.errors?.yearFrom}
          />
        </Field>

        <Field label="Year to" htmlFor="yearTo" error={state.errors?.yearTo}>
          <Input
            id="yearTo"
            name="yearTo"
            type="number"
            inputMode="numeric"
            min={1950}
            max={new Date().getFullYear() + 1}
            placeholder="2022"
            error={state.errors?.yearTo}
          />
        </Field>

        <Field
          label={`Budget (${CURRENCY.code})`}
          htmlFor="budget"
          error={state.errors?.budget}
          required
        >
          <Input
            id="budget"
            name="budget"
            type="number"
            inputMode="numeric"
            min={0}
            step={100000}
            placeholder="50000000"
            required
            error={state.errors?.budget}
          />
        </Field>
      </div>

      <Field
        label="Delivery location"
        htmlFor="location"
        hint="Where should the vehicle end up?"
        error={state.errors?.location}
        required
      >
        <Input
          id="location"
          name="location"
          placeholder="Lagos"
          required
          error={state.errors?.location}
        />
      </Field>

      <Field
        label="Additional notes"
        htmlFor="notes"
        hint="Trim, colour, mileage limit, must-have options, or a deadline."
        error={state.errors?.notes}
      >
        <Textarea
          id="notes"
          name="notes"
          rows={4}
          placeholder="Black on black, under 40,000 km, full service history. No accident repair."
          error={state.errors?.notes}
        />
      </Field>

      <Field label="Reference image" error={state.errors?.referenceImage}>
        <ReferenceImageUpload />
      </Field>

      <div className="flex flex-wrap items-center gap-4 pt-1">
        <SubmitButtonWide pendingLabel="Sending request…">
          <Icon name="search" className="h-4 w-4" />
          Submit sourcing request
        </SubmitButtonWide>
        <p className="text-xs text-ink-400">
          Free to submit. No obligation to buy.
        </p>
      </div>
    </form>
  );
}
