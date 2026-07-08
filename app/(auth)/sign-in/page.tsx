import { redirect } from "next/navigation";
import { getAuthUserId } from "@/lib/auth";
import { getProfile } from "@/lib/db/profiles";
import { SignInForm } from "./SignInForm";

export const dynamic = "force-dynamic";

export default async function SignInPage() {
  const userId = await getAuthUserId();
  if (userId) {
    const profile = await getProfile(userId);
    redirect(profile ? "/dashboard" : "/onboarding");
  }

  return <SignInForm />;
}
