"use client";

export default function DashboardError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-8">
      <div className="max-w-lg w-full border border-destructive/30 bg-destructive/5 rounded-2xl p-6 space-y-3">
        <h2 className="font-heading text-xl font-bold text-destructive">Dashboard error</h2>
        <p className="text-sm text-muted-foreground">{error.message}</p>
        {error.digest && (
          <p className="text-xs text-muted-foreground font-mono">Digest: {error.digest}</p>
        )}
      </div>
    </div>
  );
}
