"use client";

import { useActionState } from "react";
import { createVehicle, updateVehicle } from "@/actions/vehicles";
import { VehicleImages } from "@/components/admin/vehicle-images";
import { Field, FormAlert, Input, Select, Textarea } from "@/components/ui/field";
import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { SubmitButton } from "@/components/ui/submit-button";
import {
  BODY_TYPES,
  CONDITIONS,
  DRIVE_TYPES,
  FUEL_TYPES,
  TRANSMISSIONS,
  VehicleStatus,
} from "@/lib/constants";
import { parseJsonArray } from "@/lib/vehicle";
import type { ActionState } from "@/lib/validation";

const INITIAL: ActionState = { ok: false };

/** The columns the form reads and writes — a subset of the `Vehicle` row. */
export type VehicleFormVehicle = {
  id: string;
  make: string;
  model: string;
  trim: string | null;
  year: number;
  price: number;
  mileage: number;
  bodyType: string;
  fuelType: string;
  transmission: string;
  driveType: string;
  engine: string;
  exteriorColor: string;
  interiorColor: string | null;
  condition: string;
  location: string;
  vin: string | null;
  description: string;
  features: string;
  images: string;
  videoUrl: string | null;
  status: string;
  featured: boolean;
};

const STATUS_LABELS: Record<string, string> = {
  [VehicleStatus.AVAILABLE]: "Available — listed publicly",
  [VehicleStatus.RESERVED]: "Reserved — deposit taken",
  [VehicleStatus.SOLD]: "Sold — hidden from inventory",
};

const thisYear = new Date().getFullYear();

/**
 * Add / edit vehicle form (PRD §13). One component for both because the fields
 * are identical — only the action and the prefilled values differ.
 */
export function VehicleForm({ vehicle }: { vehicle?: VehicleFormVehicle }) {
  const [state, formAction] = useActionState(vehicle ? updateVehicle : createVehicle, INITIAL);

  const features = vehicle ? parseJsonArray(vehicle.features) : [];
  const images = vehicle ? parseJsonArray(vehicle.images) : [];

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {vehicle && <input type="hidden" name="id" value={vehicle.id} />}

      <FormAlert tone={state.ok ? "success" : "error"} message={state.message} />

      {/* Identity + pricing */}
      <Section title="Vehicle details" description="How the listing is titled and priced.">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Make" htmlFor="v-make" error={state.errors?.make} required>
            <Input
              id="v-make"
              name="make"
              defaultValue={vehicle?.make}
              placeholder="Lexus"
              required
              error={state.errors?.make}
            />
          </Field>

          <Field label="Model" htmlFor="v-model" error={state.errors?.model} required>
            <Input
              id="v-model"
              name="model"
              defaultValue={vehicle?.model}
              placeholder="IS350"
              required
              error={state.errors?.model}
            />
          </Field>

          <Field
            label="Trim"
            htmlFor="v-trim"
            hint="Optional — appears in the title and the page URL."
            error={state.errors?.trim}
          >
            <Input
              id="v-trim"
              name="trim"
              defaultValue={vehicle?.trim ?? ""}
              placeholder="F-Sport"
              error={state.errors?.trim}
            />
          </Field>

          <Field label="Year" htmlFor="v-year" error={state.errors?.year} required>
            <Input
              id="v-year"
              name="year"
              type="number"
              inputMode="numeric"
              min={1950}
              max={thisYear + 1}
              defaultValue={vehicle?.year ?? thisYear}
              required
              error={state.errors?.year}
            />
          </Field>

          <Field
            label="Price"
            htmlFor="v-price"
            hint="Whole naira, no commas."
            error={state.errors?.price}
            required
          >
            <Input
              id="v-price"
              name="price"
              type="number"
              inputMode="numeric"
              min={0}
              step={50000}
              defaultValue={vehicle?.price}
              placeholder="28500000"
              required
              error={state.errors?.price}
            />
          </Field>

          <Field label="Mileage" htmlFor="v-mileage" hint="Kilometres." error={state.errors?.mileage} required>
            <Input
              id="v-mileage"
              name="mileage"
              type="number"
              inputMode="numeric"
              min={0}
              step={1000}
              defaultValue={vehicle?.mileage}
              placeholder="96000"
              required
              error={state.errors?.mileage}
            />
          </Field>

          <Field label="Body type" htmlFor="v-bodyType" required>
            <Select id="v-bodyType" name="bodyType" defaultValue={vehicle?.bodyType ?? "SUV"}>
              {BODY_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Condition" htmlFor="v-condition" required>
            <Select id="v-condition" name="condition" defaultValue={vehicle?.condition ?? "Foreign Used"}>
              {CONDITIONS.map((condition) => (
                <option key={condition} value={condition}>
                  {condition}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      </Section>

      {/* Powertrain + specs */}
      <Section title="Specifications" description="Powers the spec sheet and the inventory filters.">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Engine" htmlFor="v-engine" error={state.errors?.engine} required>
            <Input
              id="v-engine"
              name="engine"
              defaultValue={vehicle?.engine}
              placeholder="3.5L V6 (2GR-FSE)"
              required
              error={state.errors?.engine}
            />
          </Field>

          <Field label="Fuel type" htmlFor="v-fuelType" required>
            <Select id="v-fuelType" name="fuelType" defaultValue={vehicle?.fuelType ?? "Petrol"}>
              {FUEL_TYPES.map((fuel) => (
                <option key={fuel} value={fuel}>
                  {fuel}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Transmission" htmlFor="v-transmission" required>
            <Select
              id="v-transmission"
              name="transmission"
              defaultValue={vehicle?.transmission ?? "Automatic"}
            >
              {TRANSMISSIONS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Drive type" htmlFor="v-driveType" required>
            <Select id="v-driveType" name="driveType" defaultValue={vehicle?.driveType ?? "FWD"}>
              {DRIVE_TYPES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </Select>
          </Field>

          <Field
            label="Exterior colour"
            htmlFor="v-exteriorColor"
            error={state.errors?.exteriorColor}
            required
          >
            <Input
              id="v-exteriorColor"
              name="exteriorColor"
              defaultValue={vehicle?.exteriorColor}
              placeholder="Ultra Blue"
              required
              error={state.errors?.exteriorColor}
            />
          </Field>

          <Field label="Interior" htmlFor="v-interiorColor" error={state.errors?.interiorColor}>
            <Input
              id="v-interiorColor"
              name="interiorColor"
              defaultValue={vehicle?.interiorColor ?? ""}
              placeholder="Black Leather"
              error={state.errors?.interiorColor}
            />
          </Field>

          <Field
            label="Location"
            htmlFor="v-location"
            hint="Shown as the vehicle's city, e.g. Lagos."
            error={state.errors?.location}
            required
          >
            <Input
              id="v-location"
              name="location"
              defaultValue={vehicle?.location}
              placeholder="Lagos"
              required
              error={state.errors?.location}
            />
          </Field>

          <Field
            label="VIN"
            htmlFor="v-vin"
            hint="Optional. Kept private — the listing shows “Available on request”."
            error={state.errors?.vin}
          >
            <Input
              id="v-vin"
              name="vin"
              defaultValue={vehicle?.vin ?? ""}
              placeholder="JTHBF1D20E5012345"
              error={state.errors?.vin}
            />
          </Field>
        </div>
      </Section>

      {/* Copy */}
      <Section title="Description & features" description="What buyers read on the detail page.">
        <div className="flex flex-col gap-5">
          <Field
            label="Description"
            htmlFor="v-description"
            hint="Condition, history and anything a buyer would ask on the phone."
            error={state.errors?.description}
            required
          >
            <Textarea
              id="v-description"
              name="description"
              rows={7}
              defaultValue={vehicle?.description}
              placeholder="A clean, low-owner example imported directly from…"
              required
              error={state.errors?.description}
            />
          </Field>

          <Field
            label="Features"
            htmlFor="v-features"
            hint="One per line. These become the checklist on the detail page."
            error={state.errors?.features}
          >
            <Textarea
              id="v-features"
              name="features"
              rows={6}
              defaultValue={features.join("\n")}
              placeholder={"Reverse Camera\nHeated Seats\nPanoramic Roof"}
              error={state.errors?.features}
            />
          </Field>
        </div>
      </Section>

      {/* Media */}
      <Section title="Photos & video" description="The first photo is used as the listing cover.">
        <div className="flex flex-col gap-5">
          <VehicleImages initial={images} />

          <Field
            label="Video URL"
            htmlFor="v-videoUrl"
            hint="Optional — a YouTube, Vimeo or Cloudinary link for a walkaround."
          >
            <Input
              id="v-videoUrl"
              name="videoUrl"
              type="url"
              defaultValue={vehicle?.videoUrl ?? ""}
              placeholder="https://youtube.com/watch?v=…"
            />
          </Field>
        </div>
      </Section>

      {/* Publishing */}
      <Section title="Visibility" description="Controls whether the listing is live on the site.">
        <div className="flex flex-col gap-5">
          <Field label="Status" htmlFor="v-status" required>
            <Select id="v-status" name="status" defaultValue={vehicle?.status ?? VehicleStatus.AVAILABLE}>
              {Object.values(VehicleStatus).map((status) => (
                <option key={status} value={status}>
                  {STATUS_LABELS[status] ?? status}
                </option>
              ))}
            </Select>
          </Field>

          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-ink-200 bg-ink-50/60 px-4 py-3.5">
            <input
              type="checkbox"
              name="featured"
              defaultChecked={vehicle?.featured ?? false}
              className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-brand-500"
            />
            <span>
              <span className="block text-sm font-semibold text-ink-800">
                Feature on the homepage
              </span>
              <span className="mt-0.5 block text-xs text-ink-500">
                Featured vehicles appear in the “Hand-picked” rail and the hero spotlight.
              </span>
            </span>
          </label>
        </div>
      </Section>

      <div className="flex flex-wrap items-center gap-3">
        <SubmitButton size="lg" pendingLabel="Saving vehicle…">
          <Icon name="check" className="h-4 w-4" />
          {vehicle ? "Save changes" : "Publish vehicle"}
        </SubmitButton>
        <ButtonLink href="/admin/inventory" variant="ghost" size="lg">
          Cancel
        </ButtonLink>
        <p className="text-xs text-ink-400">
          Slug is generated from the make, model, trim and year — and kept unique automatically.
        </p>
      </div>
    </form>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-ink-100 bg-white p-5 shadow-[var(--shadow-card)] sm:p-6">
      <header className="mb-5">
        <h3 className="font-display text-base font-bold text-ink-900">{title}</h3>
        {description && <p className="mt-1 text-xs text-ink-400">{description}</p>}
      </header>
      {children}
    </section>
  );
}
