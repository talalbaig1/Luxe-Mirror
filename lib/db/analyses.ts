import { isDatabaseEnabled } from "@/lib/config";
import { memoryDb } from "@/lib/db/memory";

export async function createAnalysis(data: {
  userId: string;
  photoUrl: string;
  symmetryScore?: number;
  results: object;
}) {
  if (!isDatabaseEnabled) return memoryDb.analyses.create(data);
  const { prisma } = await import("@/lib/prisma");
  return prisma.analysis.create({ data });
}

export async function getAnalyses(userId: string) {
  if (!isDatabaseEnabled) return memoryDb.analyses.findMany(userId);
  const { prisma } = await import("@/lib/prisma");
  return prisma.analysis.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { regime: true },
  });
}

export async function getLatestAnalysis(userId: string) {
  if (!isDatabaseEnabled) return memoryDb.analyses.findFirst(userId);
  const { prisma } = await import("@/lib/prisma");
  return prisma.analysis.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { regime: true },
  });
}

export async function getAnalysisById(id: string) {
  if (!isDatabaseEnabled) return null;
  const { prisma } = await import("@/lib/prisma");
  return prisma.analysis.findUnique({
    where: { id },
    include: { regime: true },
  });
}

export async function createRegime(data: {
  analysisId: string;
  amSteps: object;
  pmSteps: object;
}) {
  if (!isDatabaseEnabled) return memoryDb.regimes.create(data);
  const { prisma } = await import("@/lib/prisma");
  return prisma.regime.create({ data });
}
