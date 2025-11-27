"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const saved = localStorage.getItem("theme") as "light" | "dark" | null;

    if (saved) {
      setTheme(saved);
      document.documentElement.classList.add(saved === "dark" ? "theme-dark" : "theme-light");
      return;
    }

    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const systemTheme = prefersDark ? "dark" : "light";

    setTheme(systemTheme);
    document.documentElement.classList.add(systemTheme === "dark" ? "theme-dark" : "theme-light");
  }, []);

  const toggle = () => {
    const newTheme = theme === "dark" ? "light" : "dark";

    document.documentElement.classList.remove("theme-dark", "theme-light");
    document.documentElement.classList.add(
      newTheme === "dark" ? "theme-dark" : "theme-light"
    );

    localStorage.setItem("theme", newTheme);
    setTheme(newTheme);
  };

  return (
    <button
      onClick={toggle}
      className="inline-flex items-center gap-2 px-3 py-1 rounded-md hover:scale-105 transition-transform"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  );
}
