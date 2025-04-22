import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Should I Should I Not | Email Chance Sender",
  description: "A coin toss for your boldest messages - send emails with a touch of chance",
  keywords: ["email sender", "random chance", "decision maker", "probability", "message sender"],
  authors: [{ name: "Mishan Poudel" }],
  openGraph: {
    title: "Should I Should I Not",
    description: "A coin toss for your boldest messages",
    images: [{
      url: "/icon.png",
      width: 1200,
      height: 630,
      alt: "Should I Should I Not"
    }],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-icon.png",
  },
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#111111" }
  ],
  viewport: "width=device-width, initial-scale=1",
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
