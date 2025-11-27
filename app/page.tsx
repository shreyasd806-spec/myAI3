"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";

import { useChat } from "@ai-sdk/react";
import { ArrowUp, Eraser, Loader2, Square } from "lucide-react";

import { MessageWall } from "@/components/messages/message-wall";
import { UIMessage } from "ai";

import { useEffect, useRef, useState } from "react";
import { AI_NAME, OWNER_NAME, WELCOME_MESSAGE } from "@/config";

const formSchema = z.object({
  message: z
    .string()
    .min(1, "Message cannot be empty.")
    .max(2000, "Message must be at most 2000 characters."),
});

const STORAGE_KEY = "chat-messages";

type StorageData = {
  messages: UIMessage[];
  durations: Record<string, number>;
};

// Load messages
const loadMessages = () => {
  if (typeof window === "undefined") return { messages: [], durations: {} };

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return { messages: [], durations: {} };

    const parsed = JSON.parse(stored);
    return {
      messages: parsed.messages || [],
      durations: parsed.durations || {},
    };
  } catch {
    return { messages: [], durations: {} };
  }
};

// Save messages
const saveMessages = (messages: UIMessage[], durations: Record<string, number>) => {
  if (typeof window === "undefined") return;

  try {
    const data: StorageData = { messages, durations };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
};

export default function ChatPage() {
  const [isClient, setIsClient] = useState(false);
  const [durations, setDurations] = useState<Record<string, number>>({});
  const welcomeShown = useRef(false);

  // Load initial messages
  const stored = typeof window !== "undefined" ? loadMessages() : { messages: [], durations: {} };
  const [initialMessages] = useState<UIMessage[]>(stored.messages);

  const { messages, sendMessage, stop, status, setMessages } = useChat({
    messages: initialMessages,
  });

  useEffect(() => {
    setIsClient(true);
    setDurations(stored.durations);
    setMessages(stored.messages);
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (isClient) {
      saveMessages(messages, durations);
    }
  }, [messages, durations, isClient]);

  // Welcome message
  useEffect(() => {
    if (isClient && initialMessages.length === 0 && !welcomeShown.current) {
      const welcomeMsg: UIMessage = {
        id: `welcome-${Date.now()}`,
        role: "assistant",
        parts: [{ type: "text", text: WELCOME_MESSAGE }],
      };
      setMessages([welcomeMsg]);
      saveMessages([welcomeMsg], {});
      welcomeShown.current = true;
    }
  }, [isClient, initialMessages.length, setMessages]);

  const handleDurationChange = (k: string, d: number) => {
    setDurations((prev) => ({ ...prev, [k]: d }));
  };

  // Form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { message: "" },
  });

  const submitMessage = (data: z.infer<typeof formSchema>) => {
    sendMessage({ text: data.message });
    form.reset();
  };

  // CLEAR CHAT
  const clearChat = () => {
    const empty: UIMessage[] = [];
    setMessages(empty);
    setDurations({});
    saveMessages(empty, {});
    toast.success("Chat cleared");
  };

  //
  // ✅ RETURN STARTS HERE
  //
  return (
    <div className="w-full h-full flex flex-col">

      {/* HEADER */}
      <div className="chat-header">
        <div className="chat-title-block">
          <div>
            <div className="chat-title">Chat with {AI_NAME}</div>
            <div className="chat-subtitle">
              Personalized financial product advisor — comparison & smart recommendations
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={clearChat} className="text-sm text-red-500 hover:underline">
            <Eraser className="w-4 h-4 inline-block mr-1" /> Clear
          </button>
          <div className="text-sm text-gray-500">Powered by {OWNER_NAME}</div>
        </div>
      </div>

      {/* MESSAGES */}
      <div className="messages-area">
        {isClient ? (
          <>
            <MessageWall
              messages={messages}
              status={status}
              durations={durations}
              onDurationChange={handleDurationChange}
            />
            {status === "submitted" && (
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            )}
          </>
        ) : (
          <div className="flex justify-center items-center w-full h-32">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        )}
      </div>

      {/* INPUT BAR */}
      <div className="input-bar-wrapper">
        <form onSubmit={form.handleSubmit(submitMessage)}>
          <div className="input-container">
            <Controller
              name="message"
              control={form.control}
              render={({ field }) => (
                <input
                  {...field}
                  placeholder="Ask about comparisons, returns, risk profiles…"
                  className="input-field"
                  disabled={status === "streaming"}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      form.handleSubmit(submitMessage)();
                    }
                  }}
                />
              )}
            />
            {status === "ready" || status === "error" ? (
              <button className="send-btn" type="submit">
                <ArrowUp size={18} />
              </button>
            ) : (
              <button className="send-btn" type="button" onClick={stop}>
                <Square size={16} />
              </button>
            )}
          </div>
        </form>

        <div className="chat-footer">
          © {new Date().getFullYear()} {OWNER_NAME} • Terms • Ringel.AI
        </div>
      </div>
    </div>
  );
}
