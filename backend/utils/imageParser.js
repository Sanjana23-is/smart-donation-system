function parseImages(value) {
  if (!value) return [];

  // Already an array
  if (Array.isArray(value)) return value;

  // If it's a string
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      return [value]; // fallback for single image path
    }
  }

  return [];
}

module.exports = parseImages;
