import { isDatabaseEnabled } from "@/lib/config";
import { memoryDb } from "@/lib/db/memory";

export async function createThread(userId: string, title?: string) {
  if (!isDatabaseEnabled) return memoryDb.threads.create(userId, title);
  const { prisma } = await import("@/lib/prisma");
  return prisma.chatThread.create({
    data: { userId, title: title ?? "New Conversation" },
  });
}

export async function getThreads(userId: string) {
  if (!isDatabaseEnabled) return memoryDb.threads.findMany(userId);
  const { prisma } = await import("@/lib/prisma");
  return prisma.chatThread.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    include: {
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });
}

export async function getThread(threadId: string) {
  if (!isDatabaseEnabled) return memoryDb.threads.findUnique(threadId);
  const { prisma } = await import("@/lib/prisma");
  return prisma.chatThread.findUnique({ where: { id: threadId } });
}

export async function updateThreadTitle(threadId: string, title: string) {
  if (!isDatabaseEnabled) return memoryDb.threads.update(threadId, { title });
  const { prisma } = await import("@/lib/prisma");
  return prisma.chatThread.update({ where: { id: threadId }, data: { title } });
}

export async function deleteThread(threadId: string) {
  if (!isDatabaseEnabled) return memoryDb.threads.delete(threadId);
  const { prisma } = await import("@/lib/prisma");
  return prisma.chatThread.delete({ where: { id: threadId } });
}

export async function getMessages(threadId: string) {
  if (!isDatabaseEnabled) return memoryDb.messages.findMany(threadId);
  const { prisma } = await import("@/lib/prisma");
  return prisma.chatMessage.findMany({
    where: { threadId },
    orderBy: { createdAt: "asc" },
  });
}

export async function addMessage(data: {
  threadId: string;
  role: "user" | "assistant";
  content: string;
  imageUrl?: string;
}) {
  if (!isDatabaseEnabled) return memoryDb.messages.create(data);
  const { prisma } = await import("@/lib/prisma");
  return prisma.chatMessage.create({ data });
}
