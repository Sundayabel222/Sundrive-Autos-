import { getSession } from "@/lib/session";
import { isUploadFolder, uploadImage, UPLOAD_FOLDERS } from "@/lib/uploads";

/**
 * Multipart image upload used by the public sourcing form (reference photo) and,
 * later, the admin inventory editor.
 *
 * Kept as a Route Handler rather than a Server Action so the browser sends the
 * bytes directly and we can answer with a plain JSON result the form can react
 * to mid-flow.
 */
export async function POST(request: Request) {
  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return Response.json({ ok: false, message: "Expected a multipart form upload." }, { status: 400 });
  }

  const folder = formData.get("folder");
  if (!isUploadFolder(folder)) {
    return Response.json({ ok: false, message: "Unknown upload destination." }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return Response.json({ ok: false, message: "No image was attached." }, { status: 400 });
  }

  // Inventory media is staff-only; sourcing photos are part of the public form.
  if (UPLOAD_FOLDERS[folder].requiresAdmin) {
    const session = await getSession();
    if (!session) {
      return Response.json({ ok: false, message: "Please sign in again." }, { status: 401 });
    }
  }

  const result = await uploadImage(file, folder);
  return Response.json(result, { status: result.ok ? 201 : 400 });
}
