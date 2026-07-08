export const isDatabaseEnabled = process.env.DATABASE_ENABLED === "true";
export const isStorageEnabled = process.env.STORAGE_ENABLED === "true";

export function isVisualPreviewsEnabled(): boolean {
  if (process.env.VISUAL_PREVIEWS_ENABLED === "false") return false;
  return Boolean(process.env.OPENAI_API_KEY);
}
