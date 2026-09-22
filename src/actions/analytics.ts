"use server";

import { recordVehicleView } from "@/lib/queries";

/**
 * Record one detail-page view (PRD §18).
 *
 * Called from a client tracker rather than during render: the detail page is
 * statically generated and revalidated, so a server-side hook would only ever
 * count builds. Analytics must never break browsing, so failures are swallowed.
 */
export async function trackVehicleView(vehicleId: string): Promise<void> {
  if (!vehicleId) return;

  try {
    await recordVehicleView(vehicleId);
  } catch (error) {
    console.error("[trackVehicleView] failed:", error);
  }
}
