import { isDatabaseEnabled } from "@/lib/config";

export async function getOrCreateOrganization(clerkOrgId: string) {
  if (!isDatabaseEnabled) {
    return { id: "mem_org", clerkOrgId, plan: "free", whiteLabelSettings: null, createdAt: new Date() };
  }
  const { prisma } = await import("@/lib/prisma");
  return prisma.organization.upsert({
    where: { clerkOrgId },
    update: {},
    create: { clerkOrgId },
  });
}

export async function getClients(orgId: string) {
  if (!isDatabaseEnabled) return [];
  const { prisma } = await import("@/lib/prisma");
  return prisma.client.findMany({
    where: { orgId },
    orderBy: { createdAt: "desc" },
    include: {
      profile: {
        include: {
          analyses: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      },
    },
  });
}

export async function addClient(orgId: string, email: string, userId?: string) {
  if (!isDatabaseEnabled) throw new Error("Database required for client management");
  const { prisma } = await import("@/lib/prisma");
  return prisma.client.create({ data: { orgId, email, userId } });
}

export async function removeClient(clientId: string) {
  if (!isDatabaseEnabled) throw new Error("Database required for client management");
  const { prisma } = await import("@/lib/prisma");
  return prisma.client.delete({ where: { id: clientId } });
}
