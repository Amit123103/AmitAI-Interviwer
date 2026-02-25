import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AMITAI Interview | Next-Gen AI Career Coaching",
  description: "Master your technical and behavioral interviews with our advanced AI coaching platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen relative`}
      >
        <div className="fixed inset-0 -z-50 bg-zinc-950">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `
                radial-gradient(ellipse 60% 40% at 15% 20%, rgba(139,92,246,0.06), transparent),
                radial-gradient(ellipse 50% 35% at 80% 70%, rgba(59,130,246,0.05), transparent),
                radial-gradient(ellipse 40% 30% at 50% 50%, rgba(147,51,234,0.04), transparent)
              `,
            }}
          />
        </div>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
