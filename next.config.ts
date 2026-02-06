import type { NextConfig } from "next";

const rawBackendUrl =
  process.env.TTS_BACKEND_URL ||
  process.env.NEXT_PUBLIC_TTS_API_URL ||
  "http://localhost:5000";
const backendUrl = rawBackendUrl.replace(/\/\*$/, "").replace(/\/$/, "");

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb', // Aumentar límite para archivos de audio
    },
  },
  // Proxy para evitar Mixed Content (HTTPS -> HTTP)
  async rewrites() {
    return [
      {
        source: '/api/tts/:path*',
        destination: `${backendUrl}/:path*`,
      },
    ];
  },
  // Optimizar imágenes si las usas
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },
};

export default nextConfig;
