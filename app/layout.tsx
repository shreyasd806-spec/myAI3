import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

// Use the Inter font, which is clean and professional (often used in finance/tech)
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "RateMind | Real-Time Financial Comparison",
  description: "Your AI financial analyst for real-time rates on HYSAs, CDs, and credit cards.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // 🔑 FIX: Apply dark background classes and set the default text color here.
    // This ensures the body element correctly uses the dark theme.
    <html lang="en" className="dark bg-slate-950 text-slate-100 antialiased">
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
