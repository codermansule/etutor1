import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
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
    "Online tutoring marketplace with expert human tutors, AI coaching, live video classrooms, and gamified learning.",
  metadataBase: new URL("https://sb-e-tutor.example.com"),
  openGraph: {
    title: "SBETUTOR | Preply-style tutoring + AI classroom",
    description:
      "Online tutoring marketplace with expert human tutors, AI coaching, live video classrooms, and gamified learning.",
    url: "https://sb-e-tutor.example.com",
    siteName: "SBETUTOR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SBETUTOR | Preply-style tutoring + AI classroom",
    description:
      "Online tutoring marketplace with expert human tutors, AI coaching, live video classrooms, and gamified learning.",
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
        {children}
      </body>
    </html>
  );
}
