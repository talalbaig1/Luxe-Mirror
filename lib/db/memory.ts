/**
 * In-memory store used when DATABASE_ENABLED=false.
 * Data resets on server restart.
 */

export interface MemoryProfile {
  id: string;
  userId: string;
  name: string;
  skinType: string | null;
  goals: string[];
  avatarUrl: string | null;
  gender: string | null;
  ageRange: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface MemoryAnalysis {
  id: string;
  userId: string;
  photoUrl: string;
  symmetryScore: number | null;
  results: object;
  createdAt: Date;
  regime?: MemoryRegime | null;
}

export interface MemoryRegime {
  id: string;
  analysisId: string;
  amSteps: object;
  pmSteps: object;
  createdAt: Date;
}

export interface MemoryWardrobeAnalysis {
  id: string;
  userId: string;
  photoUrl: string;
  recommendations: object;
  createdAt: Date;
}

export interface MemoryChatThread {
  id: string;
  userId: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MemoryChatMessage {
  id: string;
  threadId: string;
  role: string;
  content: string;
  imageUrl: string | null;
  createdAt: Date;
}

const globalForMemory = globalThis as unknown as {
  memoryStore?: {
    profiles: Map<string, MemoryProfile>;
    analyses: Map<string, MemoryAnalysis>;
    regimes: Map<string, MemoryRegime>;
    wardrobeAnalyses: Map<string, MemoryWardrobeAnalysis>;
    chatThreads: Map<string, MemoryChatThread>;
    chatMessages: Map<string, MemoryChatMessage>;
    idCounter: number;
  };
};

function getStore() {
  if (!globalForMemory.memoryStore) {
    globalForMemory.memoryStore = {
      profiles: new Map(),
      analyses: new Map(),
      regimes: new Map(),
      wardrobeAnalyses: new Map(),
      chatThreads: new Map(),
      chatMessages: new Map(),
      idCounter: 0,
    };
  }
  return globalForMemory.memoryStore;
}

function cuid() {
  const store = getStore();
  store.idCounter += 1;
  return `mem_${Date.now()}_${store.idCounter}`;
}

export const memoryDb = {
  profiles: {
    findUnique: (userId: string) => getStore().profiles.get(userId) ?? null,
    create: (data: Omit<MemoryProfile, "id" | "createdAt" | "updatedAt">) => {
      const store = getStore();
      const now = new Date();
      const profile: MemoryProfile = { id: cuid(), ...data, createdAt: now, updatedAt: now };
      store.profiles.set(data.userId, profile);
      return profile;
    },
    update: (userId: string, data: Partial<MemoryProfile>) => {
      const store = getStore();
      const existing = store.profiles.get(userId);
      if (!existing) throw new Error("Profile not found");
      const updated = { ...existing, ...data, updatedAt: new Date() };
      store.profiles.set(userId, updated);
      return updated;
    },
    upsert: (data: Omit<MemoryProfile, "id" | "createdAt" | "updatedAt">) => {
      const existing = getStore().profiles.get(data.userId);
      if (existing) return memoryDb.profiles.update(data.userId, data);
      return memoryDb.profiles.create(data);
    },
  },
  analyses: {
    create: (data: { userId: string; photoUrl: string; symmetryScore?: number; results: object }) => {
      const store = getStore();
      const analysis: MemoryAnalysis = {
        id: cuid(),
        userId: data.userId,
        photoUrl: data.photoUrl,
        symmetryScore: data.symmetryScore ?? null,
        results: data.results,
        createdAt: new Date(),
      };
      store.analyses.set(analysis.id, analysis);
      return analysis;
    },
    findMany: (userId: string) => {
      const store = getStore();
      return [...store.analyses.values()]
        .filter((a) => a.userId === userId)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .map((a) => ({ ...a, regime: store.regimes.get(a.id) ?? null }));
    },
    findFirst: (userId: string) => {
      const list = memoryDb.analyses.findMany(userId);
      return list[0] ?? null;
    },
  },
  regimes: {
    create: (data: { analysisId: string; amSteps: object; pmSteps: object }) => {
      const store = getStore();
      const regime: MemoryRegime = { id: cuid(), ...data, createdAt: new Date() };
      store.regimes.set(data.analysisId, regime);
      const analysis = store.analyses.get(data.analysisId);
      if (analysis) analysis.regime = regime;
      return regime;
    },
  },
  wardrobe: {
    create: (data: { userId: string; photoUrl: string; recommendations: object }) => {
      const store = getStore();
      const row: MemoryWardrobeAnalysis = { id: cuid(), ...data, createdAt: new Date() };
      store.wardrobeAnalyses.set(row.id, row);
      return row;
    },
    findMany: (userId: string) => {
      const store = getStore();
      return [...store.wardrobeAnalyses.values()]
        .filter((w) => w.userId === userId)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    },
    findFirst: (userId: string) => memoryDb.wardrobe.findMany(userId)[0] ?? null,
  },
  threads: {
    create: (userId: string, title?: string) => {
      const store = getStore();
      const now = new Date();
      const thread: MemoryChatThread = {
        id: cuid(),
        userId,
        title: title ?? "New Conversation",
        createdAt: now,
        updatedAt: now,
      };
      store.chatThreads.set(thread.id, thread);
      return thread;
    },
    findMany: (userId: string) => {
      const store = getStore();
      return [...store.chatThreads.values()]
        .filter((t) => t.userId === userId)
        .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
        .map((t) => ({
          ...t,
          messages: [...store.chatMessages.values()]
            .filter((m) => m.threadId === t.id)
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
            .slice(0, 1),
        }));
    },
    findUnique: (id: string) => getStore().chatThreads.get(id) ?? null,
    update: (id: string, data: { title: string }) => {
      const store = getStore();
      const t = store.chatThreads.get(id);
      if (!t) throw new Error("Thread not found");
      const updated = { ...t, ...data, updatedAt: new Date() };
      store.chatThreads.set(id, updated);
      return updated;
    },
    delete: (id: string) => {
      const store = getStore();
      store.chatThreads.delete(id);
      for (const [mid, msg] of store.chatMessages) {
        if (msg.threadId === id) store.chatMessages.delete(mid);
      }
    },
  },
  messages: {
    findMany: (threadId: string) => {
      const store = getStore();
      return [...store.chatMessages.values()]
        .filter((m) => m.threadId === threadId)
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    },
    create: (data: { threadId: string; role: string; content: string; imageUrl?: string }) => {
      const store = getStore();
      const msg: MemoryChatMessage = {
        id: cuid(),
        threadId: data.threadId,
        role: data.role,
        content: data.content,
        imageUrl: data.imageUrl ?? null,
        createdAt: new Date(),
      };
      store.chatMessages.set(msg.id, msg);
      const thread = store.chatThreads.get(data.threadId);
      if (thread) thread.updatedAt = new Date();
      return msg;
    },
  },
};
