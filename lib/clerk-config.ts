/** Shared Clerk key validation (works in server and client bundles). */
export function hasValidClerkKey(): boolean {
  const key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";
  if (!key || key.includes("your_clerk") || key.includes("pk_test_...")) return false;
  return true;
}

/** Server-side Clerk enable check (respects CLERK_ENABLED flag). */
export function isClerkEnabledClient(): boolean {
  if (process.env.NEXT_PUBLIC_CLERK_ENABLED === "false") return false;
  return hasValidClerkKey();
}
