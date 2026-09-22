"use client";

import Image from "next/image";
import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/cn";

/**
 * Detail-page gallery (PRD §7).
 *
 * Uses plain `next/image` with `fill` rather than a carousel library: the
 * thumbnails are the whole interaction, so this stays dependency-free and
 * keyboard accessible.
 */
export function VehicleGallery({ images, alt }: { images: string[]; alt: string }) {
  const [active, setActive] = useState(0);
  const safeIndex = Math.min(active, images.length - 1);

  return (
    <div>
      <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-ink-100 bg-ink-50">
        <Image
          key={images[safeIndex]}
          src={images[safeIndex]}
          alt={`${alt} — photo ${safeIndex + 1} of ${images.length}`}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 60vw"
          className="animate-fade-up object-cover"
        />

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => setActive((safeIndex - 1 + images.length) % images.length)}
              aria-label="Previous photo"
              className="absolute top-1/2 left-4 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-black/45 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
            >
              <Icon name="chevronLeft" className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => setActive((safeIndex + 1) % images.length)}
              aria-label="Next photo"
              className="absolute top-1/2 right-4 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-black/45 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
            >
              <Icon name="chevronRight" className="h-5 w-5" />
            </button>
            <span className="absolute right-4 bottom-4 rounded-full bg-black/55 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
              {safeIndex + 1} / {images.length}
            </span>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
          {images.map((image, index) => (
            <button
              key={image}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`Show photo ${index + 1}`}
              aria-current={index === safeIndex}
              className={cn(
                "relative h-20 w-28 shrink-0 overflow-hidden rounded-xl border-2 transition-all",
                index === safeIndex
                  ? "border-brand-500"
                  : "border-transparent opacity-70 hover:opacity-100",
              )}
            >
              <Image src={image} alt="" fill sizes="112px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
