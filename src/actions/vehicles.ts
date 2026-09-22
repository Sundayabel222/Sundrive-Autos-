"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { vehicleSlug } from "@/lib/format";
import { notifyLead } from "@/lib/notifications";
import { requireAdmin } from "@/lib/session";
import { VehicleStatus } from "@/lib/constants";
import {
  fieldErrors,
  formDataToObject,
  vehicleSchema,
  type ActionState,
} from "@/lib/validation";
import type { VehicleInput } from "@/lib/validation";

/**
 * Admin inventory mutations.
 *
 * Note: the proxy guards page navigation only — Server Functions are POSTs to
 * the page route, so each action re-verifies the session here.
 */

const PUBLIC_PATHS = ["/", "/inventory", "/sourcing"];

function revalidatePublicInventory() {
  for (const path of PUBLIC_PATHS) revalidatePath(path);
  revalidatePath("/admin");
  revalidatePath("/admin/inventory");
}

/** Slugs are the public URL, so they must stay unique and stable. */
async function uniqueSlug(input: VehicleInput, excludeId?: string): Promise<string> {
  const base = vehicleSlug(input) || "vehicle";
  let candidate = base;
  let suffix = 2;

  // Bounded loop: escaping after 50 attempts would need 50 identical listings.
  for (let attempt = 0; attempt < 50; attempt += 1) {
    const existing = await prisma.vehicle.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });
    if (!existing || existing.id === excludeId) return candidate;
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }

  return `${base}-${Date.now()}`;
}

/** Shape the validated form data into database columns. */
function toVehicleData(input: VehicleInput) {
  return {
    make: input.make,
    model: input.model,
    trim: input.trim ?? null,
    year: input.year,
    price: Math.round(input.price),
    mileage: Math.round(input.mileage),
    bodyType: input.bodyType,
    fuelType: input.fuelType,
    transmission: input.transmission,
    driveType: input.driveType,
    engine: input.engine,
    exteriorColor: input.exteriorColor,
    interiorColor: input.interiorColor ?? null,
    condition: input.condition,
    location: input.location,
    vin: input.vin ?? null,
    description: input.description,
    features: JSON.stringify(input.features),
    status: input.status,
    featured: input.featured,
  };
}

export async function createVehicle(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const parsed = vehicleSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    return {
      ok: false,
      message: "Please correct the highlighted fields.",
      errors: fieldErrors(parsed.error),
    };
  }

  const images = formData.getAll("images").filter((v): v is string => typeof v === "string");
  const slug = await uniqueSlug(parsed.data);

  try {
    await prisma.vehicle.create({
      data: {
        ...toVehicleData(parsed.data),
        slug,
        images: JSON.stringify(images.length > 0 ? images : []),
        videoUrl: (formData.get("videoUrl") as string) || null,
      },
    });
  } catch (error) {
    console.error("[createVehicle] failed:", error);
    return { ok: false, message: "Could not save the vehicle. Please try again." };
  }

  revalidatePublicInventory();
  redirect(`/admin/inventory?created=${encodeURIComponent(slug)}`);
}

export async function updateVehicle(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  if (!id) return { ok: false, message: "Missing vehicle id." };

  const parsed = vehicleSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    return {
      ok: false,
      message: "Please correct the highlighted fields.",
      errors: fieldErrors(parsed.error),
    };
  }

  const existing = await prisma.vehicle.findUnique({ where: { id } });
  if (!existing) return { ok: false, message: "That vehicle no longer exists." };

  const images = formData.getAll("images").filter((v): v is string => typeof v === "string");
  const slug = await uniqueSlug(parsed.data, id);

  try {
    await prisma.vehicle.update({
      where: { id },
      data: {
        ...toVehicleData(parsed.data),
        slug,
        images: JSON.stringify(images.length > 0 ? images : []),
        videoUrl: (formData.get("videoUrl") as string) || null,
      },
    });
  } catch (error) {
    console.error("[updateVehicle] failed:", error);
    return { ok: false, message: "Could not update the vehicle. Please try again." };
  }

  revalidatePublicInventory();
  revalidatePath(`/cars/${existing.slug}`);
  revalidatePath(`/cars/${slug}`);
  redirect(`/admin/inventory?updated=${encodeURIComponent(slug)}`);
}

export async function deleteVehicle(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  try {
    await prisma.vehicle.delete({ where: { id } });
  } catch (error) {
    console.error("[deleteVehicle] failed:", error);
    return;
  }

  revalidatePublicInventory();
}

export async function setVehicleStatus(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  const allowed = Object.values(VehicleStatus) as string[];

  if (!id || !allowed.includes(status)) return;

  const vehicle = await prisma.vehicle.findUnique({ where: { id } });
  if (!vehicle) return;

  try {
    await prisma.vehicle.update({ where: { id }, data: { status } });
  } catch (error) {
    console.error("[setVehicleStatus] failed:", error);
    return;
  }

  if (status === VehicleStatus.SOLD && vehicle.status !== VehicleStatus.SOLD) {
    await notifyLead("vehicle-sold", [
      ["Vehicle", `${vehicle.year} ${vehicle.make} ${vehicle.model} ${vehicle.trim ?? ""}`],
      ["Price", vehicle.price],
      ["Location", vehicle.location],
    ]);
  }

  revalidatePublicInventory();
  revalidatePath(`/cars/${vehicle.slug}`);
}

export async function toggleVehicleFeatured(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const vehicle = await prisma.vehicle.findUnique({
    where: { id },
    select: { featured: true },
  });
  if (!vehicle) return;

  try {
    await prisma.vehicle.update({
      where: { id },
      data: { featured: !vehicle.featured },
    });
  } catch (error) {
    console.error("[toggleVehicleFeatured] failed:", error);
    return;
  }

  revalidatePublicInventory();
}
