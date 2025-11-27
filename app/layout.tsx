// app/layout.tsx
import "./app/globals.css";  // ✔ Correct path based on your folder structure

export const metadata = {
  title: "Finatic AI",
  description: "Real-time financial product comparison",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
