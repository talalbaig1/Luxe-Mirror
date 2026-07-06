import { isDatabaseEnabled } from "@/lib/config";
import { memoryDb } from "@/lib/db/memory";

export async function getProfile(userId: string) {
  if (!isDatabaseEnabled) return memoryDb.profiles.findUnique(userId);
  const { prisma } = await import("@/lib/prisma");
  return prisma.profile.findUnique({ where: { userId } });
}

export async function createProfile(data: {
  userId: string;
  name: string;
  skinType?: string;
  goals?: string[];
  avatarUrl?: string;
  gender?: string;
  ageRange?: string;
}) {
  if (!isDatabaseEnabled) {
    return memoryDb.profiles.create({
      userId: data.userId,
      name: data.name,
      skinType: data.skinType ?? null,
      goals: data.goals ?? [],
      avatarUrl: data.avatarUrl ?? null,
      gender: data.gender ?? null,
      ageRange: data.ageRange ?? null,
    });
  }
  const { prisma } = await import("@/lib/prisma");
  return prisma.profile.create({ data });
}

export async function updateProfile(
  userId: string,
  data: Partial<{
    name: string;
    skinType: string;
    goals: string[];
    avatarUrl: string;
    gender: string;
    ageRange: string;
  }>
) {
  if (!isDatabaseEnabled) return memoryDb.profiles.update(userId, data);
  const { prisma } = await import("@/lib/prisma");
  return prisma.profile.update({ where: { userId }, data });
}

export async function upsertProfile(data: {
  userId: string;
  name: string;
  skinType?: string;
  goals?: string[];
  avatarUrl?: string;
  gender?: string;
  ageRange?: string;
}) {
  if (!isDatabaseEnabled) {
    return memoryDb.profiles.upsert({
      userId: data.userId,
      name: data.name,
      skinType: data.skinType ?? null,
      goals: data.goals ?? [],
      avatarUrl: data.avatarUrl ?? null,
      gender: data.gender ?? null,
      ageRange: data.ageRange ?? null,
    });
  }
  const { prisma } = await import("@/lib/prisma");
  return prisma.profile.upsert({
    where: { userId: data.userId },
    update: data,
    create: data,
  });
}
