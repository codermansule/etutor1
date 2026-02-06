import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import SkipNav from "@/components/layout/SkipNav";
import WebVitalsReporter from "@/components/shared/WebVitalsReporter";
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
  title: "ETUTOR | Elite Online Tutoring + AI Adaptive Classroom",
  description:
    "Premium tutoring marketplace with expert human tutors, AI-powered study plans, live video classrooms, and gamified learning experiences.",
  metadataBase: new URL("https://etutor.studybitests.com"),
  openGraph: {
    title: "ETUTOR | Elite Online Tutoring + AI Adaptive Classroom",
    description:
      "Premium tutoring marketplace with expert human tutors, AI-powered study plans, live video classrooms, and gamified learning experiences.",
    url: "https://etutor.studybitests.com",
    siteName: "ETUTOR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ETUTOR | Elite Online Tutoring + AI Adaptive Classroom",
    description:
      "Premium tutoring marketplace with expert human tutors, AI-powered study plans, live video classrooms, and gamified learning experiences.",
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
        <SkipNav />
        <div id="main-content">{children}</div>
        <WebVitalsReporter />
      </body>
    </html>
  );
}
