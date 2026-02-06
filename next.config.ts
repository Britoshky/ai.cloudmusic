import type { NextConfig } from "next";

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
        destination: 'http://192.168.30.188:5000/:path*',
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
