"use client";

import { useActionState } from "react";
import { submitInspection } from "@/actions/leads";
import { Field, FormAlert, Input, Select, Textarea } from "@/components/ui/field";
import { SubmitButtonWide } from "@/components/ui/submit-button";
import { Icon } from "@/components/ui/icon";
import { INSPECTION_TIME_SLOTS } from "@/lib/constants";
import { toDateInputValue } from "@/lib/format";
import type { ActionState } from "@/lib/validation";

const INITIAL: ActionState = { ok: false };

/** Tomorrow is the earliest sensible slot; today is often already booked out. */
const EARLIEST_DATE = toDateInputValue(new Date(Date.now() + 86_400_000));

/**
 * Inspection booking (PRD §9). Prefilled with the vehicle when the visitor
 * arrived from a listing — `vehicleId` is re-verified server-side before use.
 */
export function InspectionForm({
  vehicleId,
  vehicleLabel,
}: {
  vehicleId?: string;
  vehicleLabel?: string;
}) {
  const [state, formAction] = useActionState(submitInspection, INITIAL);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {vehicleId && <input type="hidden" name="vehicleId" value={vehicleId} />}

      <FormAlert tone={state.ok ? "success" : "error"} message={state.message} />

      {state.ok && (
        <p className="flex items-start gap-2.5 rounded-xl bg-brand-50 px-4 py-3 text-sm text-brand-800">
          <Icon name="verified" className="mt-0.5 h-4 w-4 shrink-0" />
          Keep an eye on your phone — we usually confirm within a couple of hours during business
          hours.
        </p>
      )}

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

      <Field
        label="Which vehicle would you like to inspect?"
        htmlFor="vehicleLabel"
        hint="Give us the car from our inventory, or anything else you'd like us to look at."
        error={state.errors?.vehicleLabel}
        required
      >
        <Input
          id="vehicleLabel"
          name="vehicleLabel"
          defaultValue={vehicleLabel}
          placeholder="2021 BMW X5 xDrive40i M Sport"
          required
          error={state.errors?.vehicleLabel}
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Preferred date" htmlFor="preferredDate" error={state.errors?.preferredDate} required>
          <Input
            id="preferredDate"
            name="preferredDate"
            type="date"
            min={EARLIEST_DATE}
            required
            error={state.errors?.preferredDate}
          />
        </Field>

        <Field label="Preferred time" htmlFor="preferredTime" error={state.errors?.preferredTime} required>
          <Select
            id="preferredTime"
            name="preferredTime"
            defaultValue=""
            required
            error={state.errors?.preferredTime}
          >
            <option value="" disabled>
              Choose a slot
            </option>
            {INSPECTION_TIME_SLOTS.map((slot) => (
              <option key={slot} value={slot}>
                {slot}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Field
        label="Anything we should prepare?"
        htmlFor="message"
        hint="Optional — service history, financing questions, or a specific fault to check."
        error={state.errors?.message}
      >
        <Textarea
          id="message"
          name="message"
          rows={4}
          placeholder="I'd like the full service history and a test drive, please."
          error={state.errors?.message}
        />
      </Field>

      <div className="flex flex-wrap items-center gap-4">
        <SubmitButtonWide pendingLabel="Sending request…">
          <Icon name="calendar" className="h-4 w-4" />
          Request inspection
        </SubmitButtonWide>
        <p className="text-xs text-ink-400">No payment or commitment required.</p>
      </div>
    </form>
  );
}
