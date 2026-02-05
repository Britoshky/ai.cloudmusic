import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverActions: {
    bodySizeLimit: '10mb', // Aumentar límite para archivos de audio
  },
  // Optimizar imágenes si las usas
  images: {
    domains: ['localhost', 'api-voz.cloudmusic.cl'],
  },
};

export default nextConfig;
