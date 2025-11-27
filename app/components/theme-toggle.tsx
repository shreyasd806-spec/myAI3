"use client";
import { useEffect, useState } from "react";

/** Simple theme toggle - toggles `theme-dark` class on <html> */
export default function ThemeToggle() {
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    const s = localStorage.getItem("theme");
    if (s) return s === "dark";
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("theme-dark");
    } else {
      root.classList.remove("theme-dark");
    }
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  return (
    <button
      onClick={() => setIsDark((v) => !v)}
      aria-label="Toggle theme"
      style={{
        padding: "8px 10px",
        borderRadius: 10,
        background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
        color: isDark ? "#fff" : "#0b1a28",
        border: "1px solid rgba(255,255,255,0.06)",
        cursor: "pointer",
      }}
    >
      {isDark ? "🌙 Dark" : "☀️ Light"}
    </button>
  );
}
