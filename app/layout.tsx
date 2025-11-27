// app/layout.tsx
import React, { useEffect, useState } from "react";
import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Sun, Moon } from "lucide-react";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Finance Advisor Chat",
  description: "A friendly financial product advisor",
};

function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">(
    (typeof window !== "undefined" && (localStorage.getItem("theme") as "light" | "dark")) || "light"
  );

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("theme-dark", "theme-light");
    root.classList.add(theme === "dark" ? "theme-dark" : "theme-light");
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    // initialize from prefers-color-scheme if not set
    if (!localStorage.getItem("theme")) {
      const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
      setTheme(prefersDark ? "dark" : "light");
    }
  }, []);

  return (
    <button
      onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
      aria-label="Toggle theme"
      className="inline-flex items-center gap-2 px-3 py-1 rounded-md ring-0 hover:scale-105 transition-transform"
    >
      {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${geistMono.variable}`}>
      <body>
        {/* App shell provides background gradient and padding */}
        <div className="app-shell min-h-screen flex items-center justify-center">
          <div className="w-full max-w-4xl mx-auto">
            {/* Top-right theme toggle */}
            <div className="flex justify-end mb-4">
              <ThemeToggle />
            </div>

            {/* Centered content (chat-card) */}
            <div className="chat-card overflow-hidden">
              {children}
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}

