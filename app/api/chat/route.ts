import { getAuthUserId, getAuthContext, getCurrentUserName } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/ai/analyze";
import { buildSystemPrompt, generateThreadTitle } from "@/lib/ai/chat";
import { getProfile } from "@/lib/db/profiles";
import { getLatestAnalysis } from "@/lib/db/analyses";
import {
  createThread,
  getMessages,
  addMessage,
  updateThreadTitle,
  deleteThread,
  getThreads,
} from "@/lib/db/threads";
import type { AnalysisResults } from "@/lib/ai/analyze";

export async function GET(req: NextRequest) {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const threadId = searchParams.get("threadId");

  if (threadId) {
    const messages = await getMessages(threadId);
    return NextResponse.json({ messages });
  }

  const threads = await getThreads(userId);
  return NextResponse.json({ threads });
}

export async function DELETE(req: NextRequest) {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const threadId = searchParams.get("threadId");
  if (!threadId) return NextResponse.json({ error: "threadId required" }, { status: 400 });

  await deleteThread(threadId);
  return NextResponse.json({ success: true });
}

export async function POST(req: NextRequest) {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { action } = body;

  // --- Create thread ---
  if (action === "create_thread") {
    const thread = await createThread(userId, body.title ?? "New Conversation");
    return NextResponse.json(thread);
  }

  // --- Update thread title ---
  if (action === "update_title") {
    const { threadId, content } = body;
    const title = await generateThreadTitle(content);
    await updateThreadTitle(threadId, title);
    return NextResponse.json({ title });
  }

  // --- Send message (streaming) ---
  if (action === "send_message") {
    const { threadId, content } = body;

    const [profile, latestAnalysis, history] = await Promise.all([
      getProfile(userId),
      getLatestAnalysis(userId),
      getMessages(threadId),
    ]);

    if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

    // Save user message
    await addMessage({ threadId, role: "user", content });

    const systemPrompt = buildSystemPrompt({
      profile,
      latestAnalysis: latestAnalysis
        ? { results: latestAnalysis.results as unknown as AnalysisResults }
        : null,
    });

    const chatHistory = history.map((m: { role: string; content: string }) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

    // Streaming response
    const stream = await openai.chat.completions.create({
      model: "gpt-4o",
      stream: true,
      messages: [
        { role: "system", content: systemPrompt },
        ...chatHistory,
        { role: "user", content },
      ],
      max_tokens: 1000,
    });

    let fullResponse = "";

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const delta = chunk.choices[0]?.delta?.content ?? "";
          fullResponse += delta;
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();

        // Save assistant message after stream completes
        await addMessage({ threadId, role: "assistant", content: fullResponse });
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
