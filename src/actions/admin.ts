"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { InspectionStatus, MessageStatus, SourcingStatus } from "@/lib/constants";

/** Admin triage actions for the three lead queues. All admin-guarded. */

function refreshAdmin() {
  revalidatePath("/admin");
  revalidatePath("/admin/inspections");
  revalidatePath("/admin/sourcing");
  revalidatePath("/admin/messages");
  revalidatePath("/admin/customers");
}

export async function updateInspection(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  const adminNotes = formData.get("adminNotes");
  const preferredDate = formData.get("preferredDate");
  const preferredTime = formData.get("preferredTime");

  const allowed = Object.values(InspectionStatus) as string[];
  if (!id || (status && !allowed.includes(status))) return;

  const nextDate =
    typeof preferredDate === "string" && preferredDate ? new Date(`${preferredDate}T09:00:00`) : null;

  try {
    await prisma.inspection.update({
      where: { id },
      data: {
        ...(status ? { status } : {}),
        ...(typeof adminNotes === "string" && adminNotes.length > 0 ? { adminNotes } : {}),
        ...(nextDate && !Number.isNaN(nextDate.getTime()) ? { preferredDate: nextDate } : {}),
        ...(typeof preferredTime === "string" && preferredTime ? { preferredTime } : {}),
        // Rescheduling is only meaningful if the slot actually moved.
        ...(nextDate || preferredTime ? { status: status || InspectionStatus.RESCHEDULED } : {}),
      },
    });
  } catch (error) {
    console.error("[updateInspection] failed:", error);
    return;
  }

  refreshAdmin();
}

export async function deleteInspection(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  try {
    await prisma.inspection.delete({ where: { id } });
  } catch (error) {
    console.error("[deleteInspection] failed:", error);
    return;
  }
  refreshAdmin();
}

export async function updateSourcingRequest(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  const adminNotes = formData.get("adminNotes");

  const allowed = Object.values(SourcingStatus) as string[];
  if (!id || (status && !allowed.includes(status))) return;

  try {
    await prisma.sourcingRequest.update({
      where: { id },
      data: {
        ...(status ? { status } : {}),
        ...(typeof adminNotes === "string" && adminNotes.length > 0 ? { adminNotes } : {}),
      },
    });
  } catch (error) {
    console.error("[updateSourcingRequest] failed:", error);
    return;
  }
  refreshAdmin();
}

export async function deleteSourcingRequest(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  try {
    await prisma.sourcingRequest.delete({ where: { id } });
  } catch (error) {
    console.error("[deleteSourcingRequest] failed:", error);
    return;
  }
  refreshAdmin();
}

export async function updateMessageStatus(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  const allowed = Object.values(MessageStatus) as string[];
  if (!id || !allowed.includes(status)) return;

  try {
    await prisma.contactMessage.update({ where: { id }, data: { status } });
  } catch (error) {
    console.error("[updateMessageStatus] failed:", error);
    return;
  }
  refreshAdmin();
}

export async function deleteMessage(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  try {
    await prisma.contactMessage.delete({ where: { id } });
  } catch (error) {
    console.error("[deleteMessage] failed:", error);
    return;
  }
  refreshAdmin();
}
