export { createPreviewUrl };

// An object URL for the preview of an image file, or `undefined` for other files (or when it cannot be created).
// The caller releases it with `URL.revokeObjectURL`.
function createPreviewUrl(file: File): string | undefined {
  if (!file.type.startsWith('image/') || typeof URL.createObjectURL !== 'function') {
    return undefined;
  }

  try {
    return URL.createObjectURL(file);
  } catch {
    return undefined;
  }
}
