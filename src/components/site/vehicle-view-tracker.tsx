"use client";

import { useEffect, useRef } from "react";
import { trackVehicleView } from "@/actions/analytics";

/**
 * Fires exactly once per mounted visit. The ref guard matters in development,
 * where React Strict Mode mounts effects twice and would otherwise double-count.
 */
export function VehicleViewTracker({ vehicleId }: { vehicleId: string }) {
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;
    void trackVehicleView(vehicleId);
  }, [vehicleId]);

  return null;
}
