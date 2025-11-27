// app/layout.tsx
import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeToggle } from "./components/theme-toggle";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Finance Advisor Chat",
  description: "A friendly financial product advisor",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${geistMono.variable}`}>
        {/* Background wrapper */}
        <div className="app-shell min-h-screen flex items-center justify-center">
          <div className="w-full max-w-4xl mx-auto">
            {/* Theme toggle (now client-safe component) */}
            <div className="flex justify-end mb-4">
              <ThemeToggle />
            </div>

            {/* Chat card container */}
            <div className="chat-card overflow-hidden">
              {children}
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
