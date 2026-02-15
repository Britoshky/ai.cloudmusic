import type { Metadata } from "next";
export { default } from "../page";

export const metadata: Metadata = {
  title: "TTS Studio España (es-ES)",
  description:
    "Plataforma de Text to Speech y clonación de voz con IA para locución, radio y creadores en España.",
  alternates: {
    canonical: "/es-es",
    languages: {
      "es-CL": "/es-cl",
      "es-ES": "/es-es",
      "x-default": "/",
    },
  },
  openGraph: {
    locale: "es_ES",
    url: "https://ai.cloudmusic.cl/es-es",
    title: "CloudMusic IA España | TTS y Clonación de Voz",
    description:
      "Convierte texto en voz natural con IA para contenido digital y producción de audio en España.",
    images: ["/og-image.png"],
  },
};
