import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { DashboardHeader } from "@/components/dashboard/header";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Asep Haryana Saputra",
  description:
    "Backend & infrastructure engineer — portfolio, projects, and live monitoring dashboard by Asep Haryana Saputra.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <DashboardHeader />
        {children}
      </body>
    </html>
  );
}
