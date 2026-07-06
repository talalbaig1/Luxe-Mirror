import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { isClerkEnabled } from "@/lib/config";
import { getProfile } from "@/lib/db/profiles";
import { SignInDevFallback, SignInForm } from "./SignInForm";

export const dynamic = "force-dynamic";

export default async function SignInPage() {
  if (!isClerkEnabled()) return <SignInDevFallback />;

  const { userId } = await auth();
  if (userId) {
    const profile = await getProfile(userId);
    redirect(profile ? "/dashboard" : "/onboarding");
  }

  return <SignInForm />;
}
