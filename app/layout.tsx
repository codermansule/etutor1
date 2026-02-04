import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "SBETUTOR | Preply-style tutoring + AI classroom",
  description:
    "Phase 1 foundation for SBETUTOR: Next.js + Supabase, auth flows, marketing, and verification automation.",
  metadataBase: new URL("https://sb-e-tutor.example.com"),
  openGraph: {
    title: "SBETUTOR | Preply-style tutoring + AI classroom",
    description:
      "Build a hybrid tutoring marketplace with Supabase, LiveKit, AI tutors, and gamification.",
    url: "https://sb-e-tutor.example.com",
    siteName: "SBETUTOR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SBETUTOR | Preply-style tutoring + AI classroom",
    description:
      "Phase 1 foundation for SBETUTOR: Next.js + Supabase, auth flows, marketing, and verification automation.",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${spaceGrotesk.variable} ${inter.variable} bg-slate-950 text-slate-100 antialiased`}
      >
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900">
          <Header />
          <div className="mx-auto flex w-full max-w-6xl flex-col px-4 py-10 lg:px-8">
            {children}
          </div>
          <Footer />
        </div>
      </body>
    </html>
  );
}
