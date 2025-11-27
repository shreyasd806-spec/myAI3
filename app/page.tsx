"use client";

import React, { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { ArrowUpIcon, SendIcon, EraseIcon } from "./icons";
import Image from "next/image";

/* If you have `useChat` from your AI SDK, use it — else mock a simple interface */
import { useChat } from "@ai-sdk/react"; // keep as-is if present
import { UIMessage } from "ai";

/* Config constants */
const AI_NAME = "MyAI3";
const OWNER_NAME = "Shreyas Daga";
const WELCOME_MESSAGE = "Hello! I'm MyAI3, an AI assistant created by Shreyas Daga.";

/* Quick action suggestions */
const QUICK_ACTIONS = [
  "Show me the best savings accounts",
  "Compare CD rates right now",
  "What credit card has the best perks?",
  "Tell me the latest APY rates",
];

const STORAGE_KEY = "chat-messages-v2";

/* Load/save helpers */
const loadStorage = () => {
  if (typeof window === "undefined") return { messages: [], durations: {} };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { messages: [], durations: {} };
    const parsed = JSON.parse(raw);
    return { messages: parsed.messages || [], durations: parsed.durations || {} };
  } catch {
    return { messages: [], durations: {} };
  }
};

const saveStorage = (messages: any[], durations: any) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ messages, durations }));
  } catch {}
};

/* Small icons as React components */
function SendIconSVG() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M22 2L11 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function EraseSVG() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M3 6h18" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

/* MessageWall: basic renderer for UIMessage[] */
function MessageWall({ messages }:{ messages: UIMessage[] }) {
  return (
    <div className="messages" id="messages">
      {messages.map((m) => {
        const role = (m.role || "assistant") as string;
        const text = Array.isArray(m.parts) ? (m.parts[0]?.text || "") : (m.content || "");
        const isUser = role === "user";
        return (
          <div key={m.id ?? Math.random()} className={`msg-row ${isUser ? "user" : "assistant"}`}>
            {!isUser && <div className="bubble">{text}</div>}
            {isUser && <div className="bubble user">{text}</div>}
          </div>
        );
      })}
    </div>
  );
}

export default function Page() {
  // Chat hook: keep your existing provider. This example expects `useChat` to exist.
  const stored = loadStorage();
  const [initialMessages] = useState<UIMessage[]>(stored.messages);
  const [durations] = useState(stored.durations || {});
  const [isClient, setIsClient] = useState(false);
  const welcomeShown = useRef(false);

  const { messages, sendMessage, setMessages, status, stop } = useChat({
    messages: initialMessages,
  });

  /* react-hook-form for controlled input */
  const { control, handleSubmit, reset } = useForm({ defaultValues: { message: "" } });

  useEffect(() => {
    setIsClient(true);
    // ensure welcome message present
    if (initialMessages.length === 0 && !welcomeShown.current) {
      const welcome: UIMessage = {
        id: `welcome-${Date.now()}`,
        role: "assistant",
        parts: [{ type: "text", text: WELCOME_MESSAGE }],
      };
      setMessages([welcome]);
      saveStorage([welcome], {});
      welcomeShown.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // persist changes
  useEffect(() => {
    if (!isClient) return;
    saveStorage(messages, durations);
  }, [messages, durations, isClient]);

  // send
  const onSubmit = (data:{message:string}) => {
    if (!data.message || !data.message.trim()) return;
    sendMessage({ text: data.message });
    reset();
    // scroll to bottom
    setTimeout(() => {
      const el = document.getElementById("messages");
      if (el) el.scrollTop = el.scrollHeight;
    }, 150);
  };

  const handleQuick = (q:string) => {
    // populate and send
    sendMessage({ text: q });
    // scroll
    setTimeout(() => {
      const el = document.getElementById("messages");
      if (el) el.scrollTop = el.scrollHeight;
    }, 150);
  };

  const clearChat = () => {
    setMessages([]);
    saveStorage([], {});
  };

  return (
    <div>
      <div className="header">
        <div className="header-left">
          <div className="logo">
            {/* Piggy icon (svg) */}
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" style={{filter:"drop-shadow(0 6px 12px rgba(16,40,60,0.08))"}}>
              <rect x="3" y="6" width="14" height="9" rx="3" fill="#fff" opacity="0.12"/>
              <path d="M5 12c0 1 0 2 1 2" stroke="#fff" strokeWidth="1.2" strokeLinecap="round"/>
              <circle cx="19" cy="9" r="2.2" fill="#ffd166"/>
              <path d="M9 9a3 3 0 1 0 0-6" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
          </div>

          <div>
            <div className="header-title">Chat with {AI_NAME}</div>
            <div className="header-sub">Personalized financial product advisor — comparison & recommendations</div>
          </div>
        </div>

        <div className="header-right">
          <button onClick={clearChat} style={{background:"transparent", border:"none", color:"white", fontWeight:600, cursor:"pointer"}}>
            <EraseSVG /> Clear
          </button>
          <div style={{color:"rgba(255,255,255,0.9)", fontWeight:600}}>Powered by {OWNER_NAME}</div>
        </div>
      </div>

      <div className="body">
        {/* LEFT: intro, messages, actions */}
        <div className="left">
          <div className="intro">
            <div className="avatar">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <rect width="24" height="24" rx="6" fill="#e6f7ff"/>
                <circle cx="9" cy="9" r="2.2" fill="#0f172a"/>
                <path d="M6 13c1.6 1 4 1 6 1s4.4 0 6-1" stroke="#0f172a" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="text">{WELCOME_MESSAGE}</div>
          </div>

          <MessageWall messages={messages} />

          {/* Quick action buttons */}
          <div style={{marginTop:6}}>
            <div style={{fontSize:12, color:"var(--muted)", marginBottom:8}}>Try quick actions</div>
            <div className="quick-actions">
              {QUICK_ACTIONS.map((q) => (
                <button key={q} onClick={() => handleQuick(q)} className="quick-btn" type="button">
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: Illustration */}
        <div className="illustration" aria-hidden>
          {/* Use your own SVG/image in public folder as /piggy-illustration.png or keep this placeholder */}
          <Image src="/piggy-illustration.png" alt="Piggy bank" width={300} height={200} style={{objectFit:"contain"}}/>
          <div style={{fontSize:14, color:"var(--muted)", textAlign:"center", padding:"0 6px"}}>Get tailored product comparisons — savings, CDs, credit cards and more.</div>
        </div>
      </div>

      {/* Input area */}
      <div className="input-wrap">
        <form onSubmit={handleSubmit(onSubmit)} style={{width:"100%"}}>
          <div className="input-box" role="search" aria-label="Chat input">
            <Controller
              name="message"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  placeholder="Ask anything about returns, fees, or comparisons..."
                  className="input-field"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(onSubmit)();
                    }
                  }}
                />
              )}
            />

            {/* Mic icon placeholder */}
            <button type="button" className="icon-btn" title="Voice (coming soon)" style={{background:"transparent", color:"var(--accent)"}}>
              🎤
            </button>

            {/* Send */}
            <button type="submit" className="icon-btn" title="Send" style={{background:"var(--accent-2)"}}>
              <SendIconSVG />
            </button>
          </div>
        </form>
      </div>

      <div className="footer">© {new Date().getFullYear()} {OWNER_NAME} • Terms • Ringel.AI</div>
    </div>
  );
}
