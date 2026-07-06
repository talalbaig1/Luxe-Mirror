import { isClerkEnabled, DEV_USER_ID } from "@/lib/config";

export async function getAuthUserId(): Promise<string | null> {
  if (!isClerkEnabled()) return DEV_USER_ID;
  const { auth } = await import("@clerk/nextjs/server");
  const { userId } = await auth();
  return userId;
}

export async function getAuthContext(): Promise<{ userId: string | null; orgId: string | null }> {
  if (!isClerkEnabled()) return { userId: DEV_USER_ID, orgId: null };
  const { auth } = await import("@clerk/nextjs/server");
  const { userId, orgId } = await auth();
  return { userId, orgId: orgId ?? null };
}

export async function getCurrentUserName(): Promise<string> {
  if (!isClerkEnabled()) return "Dev User";
  const { currentUser } = await import("@clerk/nextjs/server");
  const user = await currentUser();
  return user?.fullName ?? user?.firstName ?? "User";
}
