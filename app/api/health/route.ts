import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const results: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    env: {
      DATABASE_ENABLED: process.env.DATABASE_ENABLED,
      STORAGE_ENABLED: process.env.STORAGE_ENABLED,
      SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? "set" : "MISSING",
      SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "set" : "MISSING",
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? "set" : "MISSING",
      DATABASE_URL: process.env.DATABASE_URL
        ? process.env.DATABASE_URL.replace(/:[^:@]+@/, ":***@")
        : "MISSING",
      OPENAI_API_KEY: process.env.OPENAI_API_KEY ? "set" : "MISSING",
    },
  };

  // Test Supabase auth
  try {
    const { createSupabaseServerClient } = await import("@/lib/supabase/server");
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    results.auth = { ok: true, hasUser: !!user, error: error?.message ?? null };
  } catch (e) {
    results.auth = { ok: false, error: String(e) };
  }

  // Test database connection
  if (process.env.DATABASE_ENABLED === "true") {
    try {
      const { prisma } = await import("@/lib/prisma");
      await prisma.$queryRaw`SELECT 1`;
      results.database = { ok: true };
    } catch (e) {
      results.database = { ok: false, error: String(e) };
    }
  } else {
    results.database = { ok: "skipped", reason: "DATABASE_ENABLED is not true" };
  }

  return NextResponse.json(results, { status: 200 });
}
