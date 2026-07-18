import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "checkin zyron legacy",
  description: "Zyron Legacy is a Web3  Game and Gaming Hub rewarding games, earn tokens , and developers showcase own web3 games",
  keywords: ["Z.ai", "Next.js", "TypeScript", "Tailwind CSS", "shadcn/ui", "AI development", "React"],
  authors: [{ name: "krypt lab" }],
 
  openGraph: {
    title: "checkin zyron legacy",
    description: "Zyron Legacy is a Web3  Game and Gaming Hub rewarding games, earn tokens , and developers showcase own web3 games",
    url: "https://checkin-zyronlegacy.vercel.app/",
    siteName: "zyron legacy",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "checkin zyron legacy",
    description: "Zyron Legacy is a Web3  Game and Gaming Hub rewarding games, earn tokens , and developers showcase own web3 games",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
