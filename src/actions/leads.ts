"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { notifyLead } from "@/lib/notifications";
import {
  contactSchema,
  fieldErrors,
  formDataToObject,
  inspectionSchema,
  sourcingSchema,
  type ActionState,
} from "@/lib/validation";
import { formatDate } from "@/lib/format";

/**
 * Public forms. Every failure returns a message the form can render rather than
 * throwing, so a validation slip never shows the visitor an error screen.
 */

/** Consolidate every lead against one customer record (PRD §14). */
async function upsertCustomer(name: string, email: string, phone?: string | null) {
  const normalised = email.trim().toLowerCase();
  return prisma.customer.upsert({
    where: { email: normalised },
    update: { name, ...(phone ? { phone } : {}) },
    create: { email: normalised, name, phone: phone ?? null },
  });
}

export async function submitInspection(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = inspectionSchema.safeParse(formDataToObject(formData));

  if (!parsed.success) {
    return {
      ok: false,
      message: "Please correct the highlighted fields.",
      errors: fieldErrors(parsed.error),
    };
  }

  const data = parsed.data;

  try {
    const customer = await upsertCustomer(data.customerName, data.email, data.phone);

    // Link to inventory when the booking started from a listing, but never trust
    // a client-supplied id without confirming it exists.
    let vehicleId: string | null = null;
    if (data.vehicleId) {
      const vehicle = await prisma.vehicle.findUnique({
        where: { id: data.vehicleId },
        select: { id: true },
      });
      vehicleId = vehicle?.id ?? null;
    }

    const inspection = await prisma.inspection.create({
      data: {
        customerName: data.customerName,
        email: data.email,
        phone: data.phone,
        vehicleId,
        vehicleLabel: data.vehicleLabel,
        preferredDate: new Date(`${data.preferredDate}T09:00:00`),
        preferredTime: data.preferredTime,
        message: data.message ?? null,
        customerId: customer.id,
      },
    });

    revalidatePath("/admin");
    revalidatePath("/admin/inspections");

    await notifyLead("inspection", [
      ["Customer", data.customerName],
      ["Email", data.email],
      ["Phone", data.phone],
      ["Vehicle", data.vehicleLabel],
      ["Preferred date", formatDate(inspection.preferredDate)],
      ["Preferred time", data.preferredTime],
      ["Message", data.message],
    ]);

    return {
      ok: true,
      message:
        "Your inspection request has been received. Our team will confirm your slot by phone or WhatsApp within a few hours.",
    };
  } catch (error) {
    console.error("[submitInspection] failed:", error);
    return {
      ok: false,
      message: "Something went wrong saving your request. Please call or WhatsApp us instead.",
    };
  }
}

export async function submitSourcing(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = sourcingSchema.safeParse(formDataToObject(formData));

  if (!parsed.success) {
    return {
      ok: false,
      message: "Please correct the highlighted fields.",
      errors: fieldErrors(parsed.error),
    };
  }

  const data = parsed.data;

  if (
    data.yearFrom !== undefined &&
    data.yearTo !== undefined &&
    data.yearFrom > data.yearTo
  ) {
    return {
      ok: false,
      message: "Please correct the highlighted fields.",
      errors: { yearTo: "Year to must be the same as or later than year from" },
    };
  }

  try {
    const customer = await upsertCustomer(data.customerName, data.email, data.phone);

    await prisma.sourcingRequest.create({
      data: {
        customerName: data.customerName,
        email: data.email,
        phone: data.phone,
        make: data.make,
        model: data.model,
        yearFrom: data.yearFrom ?? null,
        yearTo: data.yearTo ?? null,
        budget: Math.round(data.budget),
        location: data.location,
        notes: data.notes ?? null,
        referenceImage: data.referenceImage ?? null,
        customerId: customer.id,
      },
    });

    revalidatePath("/admin");
    revalidatePath("/admin/sourcing");

    await notifyLead("sourcing", [
      ["Customer", data.customerName],
      ["Email", data.email],
      ["Phone", data.phone],
      ["Wanted", `${data.make} ${data.model}`],
      ["Year range", data.yearFrom && data.yearTo ? `${data.yearFrom}–${data.yearTo}` : null],
      ["Budget", data.budget],
      ["Location", data.location],
      ["Notes", data.notes],
    ]);

    return {
      ok: true,
      message:
        "Sourcing request received. We'll search our network and come back to you with options that match your budget.",
    };
  } catch (error) {
    console.error("[submitSourcing] failed:", error);
    return {
      ok: false,
      message: "Something went wrong saving your request. Please call or WhatsApp us instead.",
    };
  }
}

export async function submitContact(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = contactSchema.safeParse(formDataToObject(formData));

  if (!parsed.success) {
    return {
      ok: false,
      message: "Please correct the highlighted fields.",
      errors: fieldErrors(parsed.error),
    };
  }

  const data = parsed.data;

  try {
    const customer = await upsertCustomer(data.name, data.email, data.phone);

    await prisma.contactMessage.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone ?? null,
        subject: data.subject ?? null,
        message: data.message,
        customerId: customer.id,
      },
    });

    revalidatePath("/admin");
    revalidatePath("/admin/messages");

    await notifyLead("inquiry", [
      ["Name", data.name],
      ["Email", data.email],
      ["Phone", data.phone],
      ["Subject", data.subject],
      ["Message", data.message],
    ]);

    return {
      ok: true,
      message: "Thanks for reaching out — we'll respond within one business day.",
    };
  } catch (error) {
    console.error("[submitContact] failed:", error);
    return {
      ok: false,
      message: "Something went wrong sending your message. Please call or WhatsApp us instead.",
    };
  }
}

/**
 * Log an inventory search so the admin can report on the most searched brands
 * (PRD §18). Intentionally silent — analytics must never break browsing.
 */
export async function logInventorySearch(input: {
  term: string;
  resultCount: number;
}): Promise<void> {
  const term = input.term.trim().toLowerCase().slice(0, 60);
  if (!term) return;

  try {
    await prisma.searchLog.create({
      data: { term, resultCount: input.resultCount },
    });
  } catch (error) {
    console.error("[logInventorySearch] failed:", error);
  }
}
