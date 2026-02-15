import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://ai.cloudmusic.cl"),
  title: {
    default: "CloudMusic IA | Text to Speech y Clonación de Voz",
    template: "%s | CloudMusic IA",
  },
  description:
    "Plataforma profesional de Text to Speech y clonación de voz con IA para radios y creadores. Genera locuciones naturales en segundos con XTTS-v2.",
  keywords: [
    "text to speech",
    "tts",
    "clonación de voz",
    "voz con inteligencia artificial",
    "xtts",
    "locuciones para radio",
    "ai cloudmusic",
    "tts español",
  ],
  alternates: {
    canonical: "/",
    languages: {
      "es-CL": "/es-cl",
      "es-ES": "/es-es",
      "x-default": "/",
    },
  },
  openGraph: {
    type: "website",
    locale: "es_CL",
    alternateLocale: ["es_ES"],
    url: "https://ai.cloudmusic.cl",
    siteName: "CloudMusic IA",
    title: "CloudMusic IA | Text to Speech y Clonación de Voz",
    description:
      "Genera voces realistas con IA para radios, contenido comercial y producción de audio profesional.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "CloudMusic IA - Plataforma de Text to Speech",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CloudMusic IA | Text to Speech y Clonación de Voz",
    description:
      "Genera voces naturales con IA para radio y contenido digital en español.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  category: "technology",
  applicationName: "CloudMusic IA",
  creator: "CloudMusic.cl",
  publisher: "CloudMusic.cl",
  icons: {
    icon: [{ url: "/favicon.ico", sizes: "any" }],
    apple: [{ url: "/apple-icon.png", sizes: "180x180" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
