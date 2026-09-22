"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { Icon } from "@/components/ui/icon";
import type { UploadResult } from "@/lib/uploads";

/**
 * Reference-photo picker for the sourcing form (PRD §8).
 *
 * Uploads immediately via /api/uploads and keeps only the returned URL in a
 * hidden input, so the Server Action receives a plain string and no multipart
 * payload has to survive validation.
 */
export function ReferenceImageUpload({ name = "referenceImage" }: { name?: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-3">
      <input type="hidden" name={name} value={url ?? ""} />

      {url ? (
        <div className="flex items-center gap-4 rounded-xl border border-ink-200 bg-white p-3">
          <span className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-ink-50">
            <Image src={url} alt="Reference upload preview" fill sizes="96px" className="object-cover" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-xs font-medium tracking-wide text-ink-400 uppercase">
              Attached
            </span>
            <span className="block truncate text-sm text-ink-700">Reference photo uploaded</span>
          </span>
          <button
            type="button"
            onClick={() => {
              setUrl(null);
              if (inputRef.current) inputRef.current.value = "";
            }}
            className="shrink-0 rounded-lg border border-ink-200 px-3 py-1.5 text-xs font-semibold text-ink-600 transition-colors hover:border-red-300 hover:text-red-600"
          >
            Remove
          </button>
        </div>
      ) : (
        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-ink-300 bg-ink-50 px-4 py-4 transition-colors hover:border-brand-400 hover:bg-brand-50/40">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif,image/heic"
            className="sr-only"
            onChange={async (event) => {
              const file = event.target.files?.[0];
              if (!file) return;

              const body = new FormData();
              body.append("file", file);
              body.append("folder", "sourcing");

              try {
                const response = await fetch("/api/uploads", { method: "POST", body });
                const result = (await response.json()) as UploadResult;
                if (result.ok) setUrl(result.url);
                else alert(result.message);
              } catch {
                alert("We couldn't upload that image. You can still submit without it.");
              }
            }}
          />
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-white text-brand-500 shadow-sm">
            <Icon name="upload" className="h-5 w-5" />
          </span>
          <span>
            <span className="block text-sm font-semibold text-ink-800">
              Upload a reference photo
            </span>
            <span className="block text-xs text-ink-400">
              Optional — a photo of the exact car you want helps a lot.
            </span>
          </span>
        </label>
      )}
    </div>
  );
}
