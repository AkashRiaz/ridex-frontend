/*
 * Backend validateRequest pattern: JSON payload in a "data" field
 * plus optional file fields (upload.fields([...])).
 */
export const toMultipart = (
  data: Record<string, unknown>,
  files: Record<string, File | null | undefined> = {},
) => {
  const formData = new FormData();

  formData.append("data", JSON.stringify(data));

  for (const [key, file] of Object.entries(files)) {
    if (file instanceof File && file.size > 0) {
      formData.append(key, file);
    }
  }

  return formData;
};

export const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export const getImageFromFormData = (formData: FormData, key: string) => {
  const file = formData.get(key);

  return file instanceof File && file.size > 0 ? file : null;
};

export const validateImageFile = (file: File | null): string | null => {
  if (!file) return null;
  if (!file.type.startsWith("image/")) return "Please choose an image file";
  if (file.size > MAX_IMAGE_SIZE) return "Image must be 5MB or smaller";
  return null;
};
