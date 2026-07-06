import { isStorageEnabled } from "@/lib/config";
import { toStoredPhotoRef } from "@/lib/utils/photo-url";

export async function uploadPhoto(
  bucket: (typeof import("@/lib/supabase").BUCKETS)[keyof typeof import("@/lib/supabase").BUCKETS],
  userId: string,
  file: File | Buffer,
  fileName: string
): Promise<string> {
  if (!isStorageEnabled) {
    if (file instanceof Buffer) {
      return `data:image/jpeg;base64,${file.toString("base64")}`;
    }
    const arrayBuffer = await (file as File).arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    return `data:image/jpeg;base64,${base64}`;
  }

  const { createSupabaseAdmin, BUCKETS: buckets } = await import("@/lib/supabase");
  const admin = createSupabaseAdmin();
  const path = `${userId}/${Date.now()}-${fileName}`;

  const { error } = await admin.storage.from(bucket).upload(path, file, {
    contentType: "image/jpeg",
    upsert: false,
  });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  return toStoredPhotoRef(bucket, path);
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function bufferToBase64(buffer: Buffer): Promise<string> {
  return buffer.toString("base64");
}

export function isValidImageType(file: File): boolean {
  return ["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(file.type);
}

export function isFileSizeValid(file: File, maxMb = 10): boolean {
  return file.size <= maxMb * 1024 * 1024;
}
