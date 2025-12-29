import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Reflekt v6 - Your Digital Diary",
  description: "A premium digital diary with 11+ years of history",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
