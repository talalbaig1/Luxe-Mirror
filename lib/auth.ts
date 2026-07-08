import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getAuthUserId(): Promise<string | null> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id ?? null;
  } catch {
    return null;
  }
}

export async function getAuthContext(): Promise<{ userId: string | null; orgId: string | null }> {
  const userId = await getAuthUserId();
  return { userId, orgId: null };
}

export async function getCurrentUserName(): Promise<string> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return "User";
    return (
      user.user_metadata?.full_name ??
      user.user_metadata?.name ??
      user.email?.split("@")[0] ??
      "User"
    );
  } catch {
    return "User";
  }
}
