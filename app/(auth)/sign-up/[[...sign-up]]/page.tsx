import { redirect } from "next/navigation";
import { getAuthUserId } from "@/lib/auth";
import { getProfile } from "@/lib/db/profiles";
import { SignUpForm } from "./SignUpForm";

export const dynamic = "force-dynamic";

export default async function SignUpPage() {
  const userId = await getAuthUserId();
  if (userId) {
    const profile = await getProfile(userId);
    redirect(profile ? "/dashboard" : "/onboarding");
  }

  return <SignUpForm />;
}
