"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/cn";
import type { UploadResult } from "@/lib/uploads";

/**
 * Vehicle photo manager (PRD §13).
 *
 * Files upload through /api/uploads (Cloudinary when configured, local disk
 * otherwise) and only the returned URLs are kept in hidden inputs, so the
 * Server Action receives plain strings. The first image is the listing's cover.
 */
export function VehicleImages({
  name = "images",
  initial = [],
}: {
  name?: string;
  initial?: string[];
}) {
  const [images, setImages] = useState<string[]>(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [urlDraft, setUrlDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function uploadFiles(files: File[]) {
    if (files.length === 0) return;

    setBusy(true);
    setError(null);

    const uploaded: string[] = [];

    for (const file of files) {
      const body = new FormData();
      body.append("file", file);
      body.append("folder", "vehicles");

      try {
        const response = await fetch("/api/uploads", { method: "POST", body });
        const result = (await response.json()) as UploadResult;

        if (result.ok) uploaded.push(result.url);
        else setError(result.message);
      } catch {
        setError("We couldn't upload one of those images. Please try again.");
      }
    }

    if (uploaded.length > 0) setImages((current) => [...current, ...uploaded]);

    setBusy(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  function move(index: number, direction: -1 | 1) {
    setImages((current) => {
      const next = [...current];
      const target = index + direction;
      if (target < 0 || target >= next.length) return current;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  return (
    <div className="flex flex-col gap-4">
      {/* The Server Action reads every value of this key, in order. */}
      {images.map((url) => (
        <input key={url} type="hidden" name={name} value={url} />
      ))}

      {images.length > 0 && (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((url, index) => (
            <li
              key={url}
              className="group relative overflow-hidden rounded-xl border border-ink-100 bg-ink-50"
            >
              <span className="relative block aspect-[4/3]">
                <Image
                  src={url}
                  alt={index === 0 ? "Cover photo" : `Vehicle photo ${index + 1}`}
                  fill
                  sizes="(max-width: 640px) 50vw, 25vw"
                  className="object-cover"
                />
              </span>

              {index === 0 && (
                <span className="absolute top-2 left-2 rounded-full bg-ink-900/85 px-2 py-0.5 text-[0.65rem] font-semibold text-white">
                  Cover
                </span>
              )}

              <div className="absolute inset-x-2 bottom-2 flex items-center justify-between gap-1">
                <span className="flex gap-1">
                  <IconButton
                    label="Move earlier"
                    disabled={index === 0}
                    onClick={() => move(index, -1)}
                  >
                    <Icon name="chevronLeft" className="h-3.5 w-3.5" />
                  </IconButton>
                  <IconButton
                    label="Move later"
                    disabled={index === images.length - 1}
                    onClick={() => move(index, 1)}
                  >
                    <Icon name="chevronRight" className="h-3.5 w-3.5" />
                  </IconButton>
                </span>

                <button
                  type="button"
                  onClick={() => setImages((current) => current.filter((item) => item !== url))}
                  aria-label="Remove photo"
                  className="grid h-7 w-7 place-items-center rounded-lg bg-ink-900/85 text-white transition-colors hover:bg-red-600"
                >
                  <Icon name="trash" className="h-3.5 w-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <label
        className={cn(
          "flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-ink-300 bg-ink-50 px-4 py-4 transition-colors hover:border-brand-400 hover:bg-brand-50/40",
          busy && "pointer-events-none opacity-60",
        )}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/avif,image/heic"
          className="sr-only"
          onChange={(event) => uploadFiles(Array.from(event.target.files ?? []))}
        />

        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-white text-brand-500 shadow-sm">
          <Icon name={busy ? "spinner" : "upload"} className={cn("h-5 w-5", busy && "animate-spin")} />
        </span>

        <span>
          <span className="block text-sm font-semibold text-ink-800">
            {busy ? "Uploading…" : images.length > 0 ? "Add more photos" : "Upload vehicle photos"}
          </span>
          <span className="block text-xs text-ink-400">
            JPG, PNG, WebP, AVIF or HEIC up to 8 MB each. The first photo is the cover.
          </span>
        </span>
      </label>

      {/* Existing hosted images can be pasted in directly. */}
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="url"
          value={urlDraft}
          onChange={(event) => setUrlDraft(event.target.value)}
          placeholder="…or paste an image URL"
          className="h-10 min-w-0 flex-1 rounded-xl border border-ink-200 px-3.5 text-sm text-ink-900 placeholder:text-ink-300 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 focus:outline-none"
        />
        <button
          type="button"
          onClick={() => {
            const url = urlDraft.trim();
            if (!/^https?:\/\//.test(url)) {
              setError("Paste a full image URL starting with http:// or https://.");
              return;
            }
            setError(null);
            setImages((current) => [...current, url]);
            setUrlDraft("");
          }}
          className="h-10 shrink-0 rounded-xl border border-ink-200 px-4 text-sm font-semibold text-ink-700 transition-colors hover:border-ink-900"
        >
          Add URL
        </button>
      </div>

      {error && (
        <p role="alert" className="text-xs font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

function IconButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="grid h-7 w-7 place-items-center rounded-lg bg-white/90 text-ink-700 transition-colors hover:bg-white disabled:opacity-35"
    >
      {children}
    </button>
  );
}
