import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { v2 as cloudinary } from "cloudinary";

/**
 * Image uploads.
 *
 * Cloudinary is the intended home for production media — the public sourcing
 * form and the admin inventory editor both post here. When the CLOUDINARY_*
 * variables are absent (local development, first run) we fall back to writing
 * into `public/uploads` so the flow still works end to end.
 */

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024; // 8 MB

/** Only raster formats; SVG is deliberately excluded (it can carry scripts). */
export const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/heic": "heic",
};

/** Upload destinations the API accepts, so a caller can't write anywhere. */
export const UPLOAD_FOLDERS = {
  vehicles: { cloudinaryFolder: "sundrive/vehicles", requiresAdmin: true },
  sourcing: { cloudinaryFolder: "sundrive/sourcing", requiresAdmin: false },
} as const;

export type UploadFolder = keyof typeof UPLOAD_FOLDERS;

export function isUploadFolder(value: unknown): value is UploadFolder {
  return typeof value === "string" && value in UPLOAD_FOLDERS;
}

export type UploadResult =
  | { ok: true; url: string; provider: "cloudinary" | "local" }
  | { ok: false; message: string };

export function cloudinaryConfigured() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET,
  );
}

function configureCloudinary() {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

/** Reject anything that isn't a reasonably sized raster image. */
export function validateImage(file: File): string | null {
  if (file.size === 0) return "That file is empty.";
  if (file.size > MAX_UPLOAD_BYTES) {
    return `Images must be smaller than ${Math.round(MAX_UPLOAD_BYTES / 1024 / 1024)} MB.`;
  }

  const extension = ALLOWED_IMAGE_TYPES[file.type];
  if (!extension) {
    return "Upload a JPG, PNG, WebP, AVIF or HEIC image.";
  }

  return null;
}

function uploadToCloudinary(buffer: Buffer, folder: string): Promise<string> {
  configureCloudinary();

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error("Cloudinary returned no result"));
          return;
        }
        resolve(result.secure_url);
      },
    );

    stream.end(buffer);
  });
}

async function uploadToLocalDisk(buffer: Buffer, extension: string, folder: string) {
  // Served straight back out of /public, matching the placeholder artwork paths
  // already stored on seeded vehicles.
  const directory = path.join(process.cwd(), "public", "uploads", folder);
  await mkdir(directory, { recursive: true });

  const filename = `${Date.now()}-${randomUUID().slice(0, 8)}.${extension}`;
  await writeFile(path.join(directory, filename), buffer);

  return `/uploads/${folder}/${filename}`;
}

/**
 * Store one image and return the public URL to persist against the record.
 * Never throws — the caller renders `message` on failure.
 */
export async function uploadImage(file: File, folder: UploadFolder): Promise<UploadResult> {
  const invalid = validateImage(file);
  if (invalid) return { ok: false, message: invalid };

  const extension = ALLOWED_IMAGE_TYPES[file.type];
  const buffer = Buffer.from(await file.arrayBuffer());

  if (cloudinaryConfigured()) {
    try {
      const url = await uploadToCloudinary(buffer, UPLOAD_FOLDERS[folder].cloudinaryFolder);
      return { ok: true, url, provider: "cloudinary" };
    } catch (error) {
      console.error("[uploadImage] Cloudinary failed:", error);
      // Fall through to local storage rather than losing the customer's file.
    }
  }

  try {
    const url = await uploadToLocalDisk(buffer, extension, folder);
    return { ok: true, url, provider: "local" };
  } catch (error) {
    console.error("[uploadImage] local write failed:", error);
    return { ok: false, message: "We couldn't save that image. Please try again." };
  }
}
