// app/page.tsx
"use client";

import React, { useState } from "react";

/**
 * Single-file page layout for Finatic AI (no external components).
 * - Inline piggy SVG used for hero/mascot
 * - Suggestion chips trigger the input
 * - Footer input is fixed and accessible
 */

export default function Page() {
  const [query, setQuery] = useState("");
  const [history, setHistory] = useState<
    { id: string; from: "user" | "assistant"; text: string }[]
  >([
    { id: "welcome", from: "assistant", text: "Hi — I'm Finatic AI. Tell me what you need (savings, CDs, credit cards) and I'll find the best rates." },
  ]);

  function sendMessage(text?: string) {
    const trimmed = (text ?? query).trim();
    if (!trimmed) return;
    const id = ${Date.now()};
    setHistory((h) => [...h, { id, from: "user", text: trimmed }]);
    setQuery("");
    // Simulated assistant reply (client-only placeholder)
    setTimeout(() => {
      setHistory((h) => [
        ...h,
        { id: ${id}-resp, from: "assistant", text: Searching live rates for: "${trimmed}" — (demo reply) },
      ]);
    }, 700);
  }

  const SUGGESTIONS = [
    "Show me the best savings accounts",
    "Compare CD rates right now",
    "What credit card has the best perks?",
    "Tell me the latest APY rates",
  ];

  return (
    <main className="page-root">
      <div className="money-bg" aria-hidden="true" />

      <section className="finatic-window" role="application" aria-label="Finatic AI chat">
        {/* LEFT: Chat area */}
        <div className="finatic-left">
          <header className="finatic-topbar" role="banner">
            <div className="logo-wrap" aria-hidden>
              {/* small piggy icon in the header (SVG simplified) */}
              <svg width="36" height="36" viewBox="0 0 64 64" className="logo-svg" aria-hidden>
                <g fill="none" fillRule="evenodd">
                  <circle cx="32" cy="32" r="30" fill="#0F63D8" />
                  <path d="M22 36c0 0 4-10 18-10 0 0 6 0 10 6 0 0 0 8-8 12" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </g>
              </svg>
              <div className="brand-title">Finatic AI</div>
            </div>

            <div className="topbar-text" aria-hidden>
              Find the best rates — instantly
            </div>
          </header>

          <div className="finatic-welcome" role="status">
            <strong>Hi there!</strong> I’m Finatic AI — I’ll find the best financial products for your needs.
            Try asking: “Best 1-year CD” or “High-yield savings with no minimum.”
          </div>

          <div className="search-row" aria-hidden>
            <input
              className="search-input"
              placeholder='E.g., "Find me the best 6-month CD"'
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
            />
            <button
              className="send-ghost"
              title="Send"
              onClick={() => sendMessage()}
              aria-label="Send"
            >
              ➤
            </button>
          </div>

          <div className="suggestion-row" role="list" aria-label="Suggestions">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                className="chip"
                onClick={() => {
                  setQuery(s);
                  // optional immediate send:
                  // sendMessage(s);
                }}
                role="listitem"
              >
                {s}
              </button>
            ))}
          </div>

          {/* Conversation preview */}
          <div className="messages" role="log" aria-live="polite">
            {history.map((m) => (
              <div
                key={m.id}
                className={message-bubble ${m.from === "user" ? "msg-user" : "msg-assistant"}}
                aria-label={${m.from === "user" ? "You" : "Assistant"}: ${m.text}}
              >
                {m.text}
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: hero / illustration */}
        <aside className="finatic-hero" aria-hidden>
          <div className="hero-illustration" role="img" aria-label="Piggy bank mascot">
            {/* Inline piggy SVG (scalable, no external files) */}
            <svg viewBox="0 0 360 280" width="320" height="240" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="g" x1="0" x2="1">
                  <stop offset="0" stopColor="#EAF5FF"/>
                  <stop offset="1" stopColor="#DDEBFF"/>
                </linearGradient>
              </defs>
              <g transform="translate(20,30)">
                <ellipse cx="180" cy="130" rx="120" ry="72" fill="url(#g)" stroke="#CFE8FF" strokeWidth="2"/>
                <rect x="220" y="70" rx="8" ry="8" width="80" height="48" fill="#CDE7FF" />
                <ellipse cx="120" cy="120" rx="72" ry="50" fill="#F5FBFF" stroke="#C9E6FF" strokeWidth="2"/>
                <ellipse cx="150" cy="110" rx="22" ry="14" fill="#E6F4FF"/>
                <circle cx="170" cy="110" r="6" fill="#8AA6D9"/>
                <path d="M100 40c8-12 32-12 40 0" fill="#DCEFFF"/>
                <rect x="140" y="72" width="48" height="6" rx="3" fill="#BFE1FF"/>
                {/* coin */}
                <g className="coin">
                  <circle cx="240" cy="30" r="18" fill="#FFCF47" stroke="#F6B800" />
                  <text x="236" y="36" fontSize="18" fontWeight="700" textAnchor="middle" fill="#9A6800">$</text>
                </g>
              </g>
            </svg>
          </div>

          <div className="hero-text">
            Compare opportunities to find the best financial products.
          </div>
        </aside>
      </section>

      {/* fixed footer input (accessible) */}
      <form
        className="finatic-footer"
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage();
        }}
        aria-label="Chat input form"
      >
        <label htmlFor="footer-input" className="sr-only">Type a message</label>
        <input
          id="footer-input"
          className="footer-input"
          placeholder="Type your message..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit" className="finatic-send" aria-label="Send message">➤</button>
      </form>
    </main>
  );
}
