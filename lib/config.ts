/** Set DATABASE_ENABLED=true once Supabase/Postgres is connected. */
export const isDatabaseEnabled = process.env.DATABASE_ENABLED === "true";

/** Set STORAGE_ENABLED=true once Supabase Storage buckets exist. */
export const isStorageEnabled = process.env.STORAGE_ENABLED === "true";

import { hasValidClerkKey } from "@/lib/clerk-config";

/** Clerk auth — set valid keys in .env. Set CLERK_ENABLED=false to skip auth locally. */
export function isClerkEnabled(): boolean {
  if (process.env.CLERK_ENABLED === "false") return false;
  return hasValidClerkKey();
}

/** Stable dev user id when Clerk is disabled */
export const DEV_USER_ID = "dev_user_local";

/** AI visual try-on previews (hairstyles, eyewear, outfits on user photo). */
export function isVisualPreviewsEnabled(): boolean {
  if (process.env.VISUAL_PREVIEWS_ENABLED === "false") return false;
  return Boolean(process.env.OPENAI_API_KEY);
}
