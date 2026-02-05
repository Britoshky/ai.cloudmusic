import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb', // Aumentar límite para archivos de audio
    },
  },
  // Optimizar imágenes si las usas
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'api-voz.cloudmusic.cl',
      },
    ],
  },
};

export default nextConfig;
