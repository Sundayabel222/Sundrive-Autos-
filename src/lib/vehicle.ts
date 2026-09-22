import type { Vehicle } from "@/generated/prisma/client";

/**
 * Safely decode a JSON-encoded column (`features` / `images`). Rows written by
 * an older schema or by hand could be malformed, so never throw here.
 */
export function parseJsonArray(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is string => typeof item === "string" && item.length > 0);
  } catch {
    return [];
  }
}

/** "2014 Lexus IS350 F-Sport" */
export function vehicleTitle(v: Pick<Vehicle, "year" | "make" | "model" | "trim">) {
  return [v.year, v.make, v.model, v.trim].filter(Boolean).join(" ");
}

/** "Lexus IS350" — used where the year would be redundant. */
export function vehicleShortTitle(v: Pick<Vehicle, "make" | "model" | "trim">) {
  return [v.make, v.model, v.trim].filter(Boolean).join(" ");
}

export function vehicleImages(v: Pick<Vehicle, "images">): string[] {
  const images = parseJsonArray(v.images);
  return images.length > 0 ? images : [PLACEHOLDER_IMAGE];
}

export function vehicleFeatures(v: Pick<Vehicle, "features">): string[] {
  return parseJsonArray(v.features);
}

export function primaryImage(v: Pick<Vehicle, "images">) {
  return vehicleImages(v)[0];
}

/**
 * Shown when a listing has no photos yet. Deliberately obvious so it is never
 * mistaken for a real vehicle.
 *
 * TODO(owner): replace `public/placeholder-car.svg` with branded artwork, or
 * upload real photos per vehicle in the admin dashboard.
 */
export const PLACEHOLDER_IMAGE = "/placeholder-car.svg";

export function isSoldStatus(status: string) {
  return status === "SOLD";
}

/** Total cost of ownership style summary line for the detail page. */
export function specsOf(v: Vehicle) {
  return [
    { label: "Year", value: String(v.year) },
    { label: "Mileage", value: v.mileage },
    { label: "Engine", value: v.engine },
    { label: "Fuel Type", value: v.fuelType },
    { label: "Transmission", value: v.transmission },
    { label: "Drive", value: v.driveType },
    { label: "Body Type", value: v.bodyType },
    { label: "Condition", value: v.condition },
    { label: "Exterior", value: v.exteriorColor },
    { label: "Interior", value: v.interiorColor ?? "—" },
    { label: "Location", value: v.location },
    { label: "VIN", value: v.vin ?? "Available on request" },
  ];
}
