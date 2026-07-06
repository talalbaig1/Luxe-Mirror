"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Send, Plus, MessageCircle, Sparkles, Trash2 } from "lucide-react";

interface Profile {
  name: string;
  skinType?: string | null;
  goals: string[];
  gender?: string | null;
}

interface Analysis {
  results: Record<string, unknown>;
}

interface Thread {
  id: string;
  title: string;
  updatedAt: Date;
  messages: { content: string; role: string }[];
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
}

interface Props {
  profile: Profile;
  threads: Thread[];
  latestAnalysis: Analysis | null;
}

const SUGGESTED_PROMPTS = [
  "What hairstyle suits my face shape?",
  "Recommend a skincare routine for my skin type",
  "What colors should I wear this season?",
  "How can I improve my grooming routine?",
  "What outfit works for a professional setting?",
];

export function ChatWindow({ profile, threads: initialThreads, latestAnalysis }: Props) {
  const [threads, setThreads] = useState<Thread[]>(initialThreads);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(
    initialThreads[0]?.id ?? null
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeThreadId) loadMessages(activeThreadId);
  }, [activeThreadId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function loadMessages(threadId: string) {
    setLoadingMessages(true);
    try {
      const res = await fetch(`/api/chat?threadId=${threadId}`);
      const data = await res.json();
      setMessages(data.messages ?? []);
    } finally {
      setLoadingMessages(false);
    }
  }

  async function createThread() {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "create_thread" }),
    });
    const data = await res.json();
    const newThread: Thread = { id: data.id, title: data.title, updatedAt: new Date(), messages: [] };
    setThreads((prev) => [newThread, ...prev]);
    setActiveThreadId(data.id);
    setMessages([]);
  }

  async function deleteThread(threadId: string) {
    await fetch(`/api/chat?threadId=${threadId}`, { method: "DELETE" });
    setThreads((prev) => prev.filter((t) => t.id !== threadId));
    if (activeThreadId === threadId) {
      const remaining = threads.filter((t) => t.id !== threadId);
      setActiveThreadId(remaining[0]?.id ?? null);
      setMessages([]);
    }
  }

  async function sendMessage(content: string) {
    if (!content.trim() || streaming) return;
    setInput("");

    let threadId = activeThreadId;

    // Create thread if none exists
    if (!threadId) {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create_thread", title: content.slice(0, 40) }),
      });
      const data = await res.json();
      const newThread: Thread = { id: data.id, title: data.title, updatedAt: new Date(), messages: [] };
      setThreads((prev) => [newThread, ...prev]);
      setActiveThreadId(data.id);
      threadId = data.id;
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      createdAt: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setStreaming(true);

    const assistantMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: "",
      createdAt: new Date(),
    };
    setMessages((prev) => [...prev, assistantMsg]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send_message", threadId, content }),
      });

      if (!res.body) throw new Error("No stream");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") break;
            try {
              const parsed = JSON.parse(data);
              const delta = parsed.choices?.[0]?.delta?.content ?? "";
              if (delta) {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMsg.id ? { ...m, content: m.content + delta } : m
                  )
                );
              }
            } catch {}
          }
        }
      }

      // Update thread title if it's the first message
      const thread = threads.find((t) => t.id === threadId);
      if (thread && thread.title === "New Conversation") {
        const titleRes = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "update_title", threadId, content }),
        });
        const titleData = await titleRes.json();
        setThreads((prev) =>
          prev.map((t) => (t.id === threadId ? { ...t, title: titleData.title } : t))
        );
      }
    } catch (err) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsg.id
            ? { ...m, content: "Sorry, something went wrong. Please try again." }
            : m
        )
      );
    } finally {
      setStreaming(false);
    }
  }

  return (
    <div className="flex gap-4 h-[calc(100vh-12rem)]">
      {/* Thread sidebar */}
      <div className="w-64 flex-shrink-0 flex flex-col gap-2">
        <Button
          className="gold-gradient text-obsidian font-semibold w-full"
          onClick={createThread}
          size="sm"
        >
          <Plus className="w-4 h-4 mr-2" /> New Chat
        </Button>
        <ScrollArea className="flex-1">
          <div className="space-y-1">
            {threads.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">No conversations yet</p>
            ) : (
              threads.map((thread) => (
                <div
                  key={thread.id}
                  className={cn(
                    "group flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-all text-sm",
                    activeThreadId === thread.id
                      ? "bg-sidebar-accent font-medium"
                      : "hover:bg-sidebar-accent/50 text-muted-foreground"
                  )}
                  onClick={() => setActiveThreadId(thread.id)}
                >
                  <MessageCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="flex-1 truncate text-xs">{thread.title}</span>
                  <button
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => { e.stopPropagation(); deleteThread(thread.id); }}
                  >
                    <Trash2 className="w-3 h-3 text-muted-foreground hover:text-destructive" />
                  </button>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Chat area */}
      <Card className="flex-1 flex flex-col overflow-hidden">
        <ScrollArea className="flex-1 p-4">
          {!activeThreadId || messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center gap-6 py-12">
              <div className="w-16 h-16 rounded-full gold-gradient flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <div className="text-center">
                <h3 className="font-heading text-xl font-semibold">Hi, I&apos;m your Luxe Mirror stylist</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Ask me anything about style, skincare, or grooming
                </p>
              </div>
              <div className="flex flex-wrap gap-2 justify-center max-w-sm">
                {SUGGESTED_PROMPTS.map((prompt) => (
                  <Badge
                    key={prompt}
                    variant="outline"
                    className="cursor-pointer hover:border-[var(--gold)]/50 hover:bg-[var(--gold)]/5 transition-all text-xs px-3 py-1.5"
                    onClick={() => sendMessage(prompt)}
                  >
                    {prompt}
                  </Badge>
                ))}
              </div>
            </div>
          ) : loadingMessages ? (
            <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
              Loading messages...
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex gap-3",
                    msg.role === "user" ? "flex-row-reverse" : ""
                  )}
                >
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarFallback
                      className={
                        msg.role === "assistant"
                          ? "gold-gradient text-white text-xs"
                          : "bg-muted text-xs"
                      }
                    >
                      {msg.role === "assistant" ? "LM" : profile.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={cn(
                      "max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed",
                      msg.role === "user"
                        ? "bg-[var(--obsidian)] text-white rounded-tr-sm"
                        : "bg-muted rounded-tl-sm"
                    )}
                  >
                    {msg.content || (
                      <span className="inline-flex gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: "300ms" }} />
                      </span>
                    )}
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
          )}
        </ScrollArea>

        {/* Input */}
        <CardContent className="p-3 border-t">
          <div className="flex gap-2 items-end">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask your stylist anything..."
              className="resize-none min-h-[44px] max-h-32 text-sm"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(input);
                }
              }}
            />
            <Button
              size="sm"
              className="gold-gradient text-obsidian h-11 w-11 p-0 flex-shrink-0"
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || streaming}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
