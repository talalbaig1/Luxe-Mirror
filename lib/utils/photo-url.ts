import { isStorageEnabled } from "@/lib/config";

const SIGNED_URL_TTL_SECONDS = 60 * 60 * 24; // 24 hours

export function isInlinePhotoUrl(url: string): boolean {
  return url.startsWith("data:") || url.startsWith("blob:");
}

/** Parse a stored photo reference or legacy Supabase public URL into bucket + path. */
export function parseSupabasePhotoRef(url: string): { bucket: string; path: string } | null {
  if (url.startsWith("supabase://")) {
    const rest = url.slice("supabase://".length);
    const slash = rest.indexOf("/");
    if (slash === -1) return null;
    return { bucket: rest.slice(0, slash), path: rest.slice(slash + 1) };
  }

  const match = url.match(/\/storage\/v1\/object\/(?:public|sign|authenticated)\/([^/]+)\/(.+?)(?:\?|$)/);
  if (!match) return null;
  return { bucket: match[1], path: decodeURIComponent(match[2]) };
}

/** Resolve a stored photo URL to something the browser can load (signed URL for private buckets). */
export async function resolvePhotoUrl(url: string | null | undefined): Promise<string> {
  if (!url) return "";
  if (isInlinePhotoUrl(url)) return url;

  const ref = parseSupabasePhotoRef(url);
  if (!ref) return url;

  if (!isStorageEnabled) return url;

  try {
    const { createSupabaseAdmin } = await import("@/lib/supabase");
    const admin = createSupabaseAdmin();
    const { data, error } = await admin.storage
      .from(ref.bucket)
      .createSignedUrl(ref.path, SIGNED_URL_TTL_SECONDS);

    if (error || !data?.signedUrl) {
      console.error("[resolvePhotoUrl] Failed to sign URL:", error?.message);
      return url;
    }
    return data.signedUrl;
  } catch (err) {
    console.error("[resolvePhotoUrl] Error:", err);
    return url;
  }
}

export async function resolvePhotoUrls<T extends { photoUrl?: string | null }>(
  items: T[]
): Promise<T[]> {
  return Promise.all(
    items.map(async (item) => ({
      ...item,
      photoUrl: item.photoUrl ? await resolvePhotoUrl(item.photoUrl) : item.photoUrl,
    }))
  );
}

/** Build the canonical stored reference saved in the database. */
export function toStoredPhotoRef(bucket: string, path: string): string {
  return `supabase://${bucket}/${path}`;
}
