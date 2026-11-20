/*
 * Browser-only: shrinks large photos before upload so a full document set
 * stays well under the server-action body limit. PDFs and small images pass through.
 */
const MAX_EDGE = 2000;
const SKIP_BELOW_BYTES = 1024 * 1024;

export const compressImage = async (file: File, quality = 0.85): Promise<File> => {
  if (!file.type.startsWith("image/") || file.size <= SKIP_BELOW_BYTES) return file;

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);

    const context = canvas.getContext("2d");
    if (!context) return file;

    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));

    if (!blob || blob.size >= file.size) return file;

    return new File([blob], file.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" });
  } catch {
    // unsupported format in this browser (e.g. some AVIF) — send as is
    return file;
  }
};
