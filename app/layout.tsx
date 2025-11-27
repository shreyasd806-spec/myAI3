// app/layout.tsx (server)
import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import ThemeToggle from "./components/theme-toggle";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MyAI3 — Financial Advisor",
  description: "AI-driven financial product recommendations & analysis",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <body>
        <div className="app-shell">
          <div className="container">
            <div className="chat-card">
              {/* Header contains theme toggle on the right */}
              <div style={{ display: "flex", justifyContent: "flex-end", padding: 12 }}>
                <ThemeToggle />
              </div>

              {/* App content */}
              {children}
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
