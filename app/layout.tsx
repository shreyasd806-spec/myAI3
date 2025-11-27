import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeToggle } from "./components/theme-toggle";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MyAI3 — Financial Advisor",
  description: "AI-driven financial product recommendations & analysis",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="app-shell">
          <div className="w-full max-w-4xl mx-auto">
            <div className="flex justify-end mb-4">
              <ThemeToggle />
            </div>
            <div className="chat-card">{children}</div>
          </div>
        </div>
      </body>
    </html>
  );
}
