import type { Metadata } from "next";
export { default } from "../page";

export const metadata: Metadata = {
  title: "TTS Studio Chile (es-CL)",
  description:
    "Plataforma de Text to Speech y clonación de voz con IA para radios y creadores en Chile.",
  alternates: {
    canonical: "/es-cl",
    languages: {
      "es-CL": "/es-cl",
      "es-ES": "/es-es",
      "x-default": "/",
    },
  },
  openGraph: {
    locale: "es_CL",
    url: "https://ai.cloudmusic.cl/es-cl",
    title: "CloudMusic IA Chile | TTS y Clonación de Voz",
    description:
      "Genera voces realistas con IA para radios y contenido digital en Chile.",
    images: ["/og-image.png"],
  },
};
