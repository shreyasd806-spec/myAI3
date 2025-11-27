"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useChat } from "@ai-sdk/react";
import { ArrowUp, Eraser, Loader2, Plus, Square } from "lucide-react";
import { MessageWall } from "@/components/messages/message-wall";
import { ChatHeader } from "@/app/parts/chat-header";
import { ChatHeaderBlock } from "@/app/parts/chat-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UIMessage } from "ai";
import { useEffect, useState, useRef } from "react";
import { AI_NAME, CLEAR_CHAT_TEXT, OWNER_NAME, WELCOME_MESSAGE } from "@/config";
import Image from "next/image";
import Link from "next/link";

const formSchema = z.object({
  message: z.string().min(1, "Message cannot be empty.").max(2000, "Message must be at most 2000 characters."),
});

const STORAGE_KEY = "chat-messages";

type StorageData = {
  messages: UIMessage[];
  durations: Record<string, number>;
};

const loadMessagesFromStorage = (): { messages: UIMessage[]; durations: Record<string, number> } => {
  if (typeof window === "undefined") return { messages: [], durations: {} };
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return { messages: [], durations: {} };
    const parsed = JSON.parse(stored);
    return { messages: parsed.messages || [], durations: parsed.durations || {} };
  } catch (error) {
    console.error("Failed to load messages from localStorage:", error);
    return { messages: [], durations: {} };
  }
};

const saveMessagesToStorage = (messages: UIMessage[], durations: Record<string, number>) => {
  if (typeof window === "undefined") return;
  try {
    const data: StorageData = { messages, durations };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save messages to localStorage:", error);
  }
};

export default function Chat() {
  const [isClient, setIsClient] = useState(false);
  const [durations, setDurations] = useState<Record<string, number>>({});
  const welcomeMessageShownRef = useRef<boolean>(false);

  const stored = typeof window !== "undefined" ? loadMessagesFromStorage() : { messages: [], durations: {} };
  const [initialMessages] = useState<UIMessage[]>(stored.messages);

  const { messages, sendMessage, status, stop, setMessages } = useChat({
    messages: initialMessages,
  });

  useEffect(() => {
    setIsClient(true);
    setDurations(stored.durations);
    setMessages(stored.messages);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isClient) {
      saveMessagesToStorage(messages, durations);
    }
  }, [durations, messages, isClient]);

  const handleDurationChange = (key: string, duration: number) => {
    setDurations((prevDurations) => {
      const newDurations = { ...prevDurations };
      newDurations[key] = duration;
      return newDurations;
    });
  };

  useEffect(() => {
    if (isClient && initialMessages.length === 0 && !welcomeMessageShownRef.current) {
      const welcomeMessage: UIMessage = {
        id: `welcome-${Date.now()}`,
        role: "assistant",
        parts: [{ type: "text", text: WELCOME_MESSAGE }],
      };
      setMessages([welcomeMessage]);
      saveMessagesToStorage([welcomeMessage], {});
      welcomeMessageShownRef.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isClient, initialMessages.length]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { message: "" },
  });

  function onSubmit(data: z.infer<typeof formSchema>) {
    sendMessage({ text: data.message });
    form.reset();
  }

  function clearChat() {
    const newMessages: UIMessage[] = [];
    const newDurations = {};
    setMessages(newMessages);
    setDurations(newDurations);
    saveMessagesToStorage(newMessages, newDurations);
    toast.success("Chat cleared");
  }

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="chat-header">
        <ChatHeaderBlock className="flex items-center gap-3">
          <Avatar className="w-10 h-10 ring-1 ring-offset-1" >
            <AvatarImage src="/logo.png" />
            <AvatarFallback>
              <Image src="/logo.png" alt="Logo" width={36} height={36} />
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="chat-title">Chat with {AI_NAME}</div>
            <div className="chat-subtitle">Personalized financial product advisor — comparison & recommendations</div>
          </div>
        </ChatHeaderBlock>

        <div className="ml-auto flex items-center gap-3">
          <button
            onClick={clearChat}
            className="badge hover:bg-transparent transition-colors"
            title="Clear chat"
          >
            <Eraser className="w-4 h-4 inline-block mr-1" /> Clear
          </button>
          <div className="badge">Powered by {OWNER_NAME}</div>
        </div>
      </div>

      {/* Messages */}
      <div className="messages-area">
        {isClient ? (
          <>
            <MessageWall messages={messages} status={status} durations={durations} onDurationChange={handleDurationChange} />
            {status === "submitted" && (
              <div className="flex justify-start max-w-3xl w-full">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            )}
          </>
        ) : (
          <div className="flex justify-center items-center w-full h-36">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Input & footer */}
      <div className="chat-input-wrap relative">
        <div className="max-w-3xl mx-auto w-full relative">
          <form id="chat-form" onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <Controller
                name="message"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="relative">
                    <FieldLabel htmlFor="chat-form-message" className="sr-only">Message</FieldLabel>

                    <input
                      {...field}
                      id="chat-form-message"
                      className="chat-input"
                      placeholder="Ask about returns, fees, comparisons — e.g. 'Compare these mutual funds for my moderate risk profile'..."
                      disabled={status === "streaming"}
                      aria-invalid={fieldState.invalid}
                      autoComplete="off"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          form.handleSubmit(onSubmit)();
                        }
                      }}
                    />

                    {/* Send / stop button */}
                    {(status === "ready" || status === "error") && (
                      <button
                        type="submit"
                        className="send-button"
                        disabled={!field.value.trim()}
                        aria-label="Send message"
                        title="Send"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                    )}

                    {(status === "streaming" || status === "submitted") && (
                      <button
                        type="button"
                        onClick={() => stop()}
                        className="send-button"
                        title="Stop streaming"
                        aria-label="Stop"
                      >
                        <Square className="w-4 h-4" />
                      </button>
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
          </form>
        </div>

        <div className="w-full px-5 pt-3 pb-4 items-center flex justify-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} {OWNER_NAME} • <Link href="/terms" className="underline">Terms</Link> • <Link href="https://ringel.ai/" className="underline">Ringel.AI</Link>
        </div>
      </div>
    </div>
  );
}
