import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CorvEd - Tutoring Platform",
  description: "Connect students with qualified tutors",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
