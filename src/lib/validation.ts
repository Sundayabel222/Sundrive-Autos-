import { z } from "zod";
import {
  BODY_TYPES,
  CONDITIONS,
  DRIVE_TYPES,
  FUEL_TYPES,
  TRANSMISSIONS,
  VehicleStatus,
} from "./constants";

/* -------------------------------------------------------------------------- */
/* FormData helpers                                                            */
/* -------------------------------------------------------------------------- */

/**
 * Convert a `FormData` into a plain object for validation. File entries are
 * skipped (handled separately) and repeated keys collapse into an array.
 */
export function formDataToObject(formData: FormData): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [key, value] of formData.entries()) {
    if (typeof value !== "string") continue;
    const existing = result[key];
    if (existing === undefined) {
      result[key] = value;
    } else if (Array.isArray(existing)) {
      existing.push(value);
    } else {
      result[key] = [existing, value];
    }
  }

  return result;
}

/**
 * `searchParams` arrive as `string | string[] | undefined`. The inventory
 * filters are all single-select, so keep the first value of any repeated key.
 */
export function searchParamsToObject(
  searchParams: Record<string, string | string[] | undefined>,
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(searchParams)) {
    const first = Array.isArray(value) ? value[0] : value;
    if (first !== undefined) result[key] = first;
  }

  return result;
}

/** `{"": "required"}` -> `{"": "..."}`, keyed by field name for form display. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.length > 0 ? String(issue.path[0]) : "form";
    if (!errors[key]) errors[key] = issue.message;
  }
  return errors;
}

export type ActionState = {
  ok: boolean;
  message?: string;
  errors?: Record<string, string>;
};

export const emptyActionState: ActionState = { ok: false };

/** Treat blank optional inputs as absent rather than as an empty string. */
const optionalText = z.preprocess(
  (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
  z.string().trim().optional(),
);

const optionalNumber = z.preprocess(
  (v) => (v === "" || v === null ? undefined : v),
  z.coerce.number().optional(),
);

/** HTML checkboxes submit "on"; absent means unchecked. */
const checkbox = z.preprocess(
  (v) => v === "on" || v === "true" || v === true,
  z.boolean(),
);

/* -------------------------------------------------------------------------- */
/* Public forms                                                                */
/* -------------------------------------------------------------------------- */

const name = z.string().trim().min(2, "Please enter your full name").max(120);
const email = z.email("Please enter a valid email address").max(200);
const phone = z
  .string()
  .trim()
  .min(7, "Please enter a valid phone number")
  .max(30, "Please enter a valid phone number");

export const inspectionSchema = z.object({
  customerName: name,
  email,
  phone,
  vehicleId: optionalText,
  vehicleLabel: z.string().trim().min(2, "Tell us which vehicle you want to inspect").max(200),
  preferredDate: z
    .string()
    .trim()
    .min(1, "Choose a preferred date")
    .refine((v) => !Number.isNaN(Date.parse(v)), "Choose a valid date"),
  preferredTime: z.string().trim().min(1, "Choose a preferred time"),
  message: optionalText,
});

export const sourcingSchema = z.object({
  customerName: name,
  email,
  phone,
  make: z.string().trim().min(1, "Vehicle brand is required").max(80),
  model: z.string().trim().min(1, "Vehicle model is required").max(80),
  yearFrom: optionalNumber,
  yearTo: optionalNumber,
  budget: z.coerce
    .number({ error: "Enter your budget as a number" })
    .positive("Enter a budget greater than zero"),
  location: z.string().trim().min(2, "Where should the vehicle be delivered?").max(120),
  notes: optionalText,
  referenceImage: optionalText,
});

export const contactSchema = z.object({
  name,
  email,
  phone: z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    phone.optional(),
  ),
  subject: optionalText,
  message: z.string().trim().min(10, "Please give us a little more detail").max(4000),
});

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Enter your password"),
});

/* -------------------------------------------------------------------------- */
/* Admin: vehicle                                                              */
/* -------------------------------------------------------------------------- */

export const vehicleSchema = z.object({
  make: z.string().trim().min(1, "Make is required").max(60),
  model: z.string().trim().min(1, "Model is required").max(60),
  trim: optionalText,
  year: z.coerce
    .number({ error: "Year is required" })
    .int("Year must be a whole number")
    .min(1950, "Year looks too old")
    .max(new Date().getFullYear() + 1, "Year is in the future"),
  price: z.coerce
    .number({ error: "Price is required" })
    .int("Price must be a whole number")
    .nonnegative("Price cannot be negative"),
  mileage: z.coerce
    .number({ error: "Mileage is required" })
    .int("Mileage must be a whole number")
    .nonnegative("Mileage cannot be negative"),
  bodyType: z.enum(BODY_TYPES),
  fuelType: z.enum(FUEL_TYPES),
  transmission: z.enum(TRANSMISSIONS),
  driveType: z.enum(DRIVE_TYPES),
  engine: z.string().trim().min(1, "Engine description is required").max(80),
  exteriorColor: z.string().trim().min(1, "Exterior colour is required").max(40),
  interiorColor: optionalText,
  condition: z.enum(CONDITIONS),
  location: z.string().trim().min(1, "Location is required").max(80),
  vin: optionalText,
  description: z.string().trim().min(20, "Write at least a sentence or two").max(5000),
  // Newline- or comma-separated in the textarea; stored as a JSON array.
  features: z.preprocess(
    (v) =>
      typeof v === "string"
        ? v
            .split(/\r?\n|,/)
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
    z.array(z.string().max(80)),
  ),
  status: z.enum([VehicleStatus.AVAILABLE, VehicleStatus.RESERVED, VehicleStatus.SOLD]),
  featured: checkbox,
});

export type VehicleInput = z.infer<typeof vehicleSchema>;

/* -------------------------------------------------------------------------- */
/* Admin: inventory filters (search params)                                    */
/* -------------------------------------------------------------------------- */

export const inventoryFilterSchema = z.object({
  q: optionalText,
  make: optionalText,
  bodyType: optionalText,
  fuelType: optionalText,
  transmission: optionalText,
  condition: optionalText,
  location: optionalText,
  yearMin: optionalNumber,
  yearMax: optionalNumber,
  priceMin: optionalNumber,
  priceMax: optionalNumber,
  sort: optionalText,
  page: optionalNumber,
});

export type InventoryFilters = z.infer<typeof inventoryFilterSchema>;
