import { isDatabaseEnabled } from "@/lib/config";
import { memoryDb } from "@/lib/db/memory";

export async function createWardrobeAnalysis(data: {
  userId: string;
  photoUrl: string;
  recommendations: object;
}) {
  if (!isDatabaseEnabled) return memoryDb.wardrobe.create(data);
  const { prisma } = await import("@/lib/prisma");
  return prisma.wardrobeAnalysis.create({ data });
}

export async function getWardrobeAnalyses(userId: string) {
  if (!isDatabaseEnabled) return memoryDb.wardrobe.findMany(userId);
  const { prisma } = await import("@/lib/prisma");
  return prisma.wardrobeAnalysis.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getLatestWardrobeAnalysis(userId: string) {
  if (!isDatabaseEnabled) return memoryDb.wardrobe.findFirst(userId);
  const { prisma } = await import("@/lib/prisma");
  return prisma.wardrobeAnalysis.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}
