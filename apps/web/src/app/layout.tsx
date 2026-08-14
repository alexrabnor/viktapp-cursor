import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import AppDataProvider from "@/app/providers/AppDataProvider";
import WaveBackground from "@/components/WaveBackground";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vikttapp",
  description: "Viktnedgång och injektioner i en modern app.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="sv"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-screen text-zinc-900 dark:bg-black dark:text-zinc-50">
        <WaveBackground />
        <AppDataProvider>
          <div className="mx-auto w-full max-w-md">
            <main className="min-h-screen pb-28">{children}</main>
          </div>
          <BottomNav />
        </AppDataProvider>
      </body>
    </html>
  );
}
