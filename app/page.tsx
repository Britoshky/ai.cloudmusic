'use client';

import TTSInterface from "@/src/components/TTSInterface";

export default function Home() {
  return (
    <main className="min-h-screen py-12 px-4 relative overflow-hidden">
      {/* Efectos de fondo decorativos */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-success/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12 fade-in">
          <div className="inline-block mb-4">
            <div className="px-6 py-2 rounded-full bg-primary-50/10 border-2 border-primary/30 backdrop-blur-sm">
              <span className="text-2xl mr-2">🎙️</span>
              <span className="font-semibold text-primary">Tecnología XTTS-v2</span>
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
            TTS Studio
          </h1>
          
          <p className="text-xl md:text-2xl text-default-600 mb-3 font-light">
            Clonación de Voz con Inteligencia Artificial
          </p>
          
          <p className="text-default-500 max-w-2xl mx-auto">
            Genera voces realistas y naturales con nuestra tecnología de clonación de voz de última generación. 
            Soporta múltiples idiomas y personalización completa.
          </p>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-6 mt-8">
            <div className="bg-default-100/50 backdrop-blur-sm border border-primary/20 rounded-xl px-6 py-3 text-center">
              <div className="text-2xl font-bold text-primary">16+</div>
              <div className="text-sm text-default-500">Idiomas</div>
            </div>
            <div className="bg-default-100/50 backdrop-blur-sm border border-secondary/20 rounded-xl px-6 py-3 text-center">
              <div className="text-2xl font-bold text-secondary">HD</div>
              <div className="text-sm text-default-500">Calidad</div>
            </div>
            <div className="bg-default-100/50 backdrop-blur-sm border border-success/20 rounded-xl px-6 py-3 text-center">
              <div className="text-2xl font-bold text-success">Rápido</div>
              <div className="text-sm text-default-500">Generación</div>
            </div>
          </div>
        </div>

        {/* Main Interface */}
        <TTSInterface />

        {/* Footer Info */}
        <div className="mt-12 text-center text-default-500 text-sm">
          <div className="inline-block px-4 py-2 rounded-full bg-default-100/50 backdrop-blur-sm border border-default-200">
            Powered by XTTS-v2 • Open Source AI Technology
          </div>
        </div>
      </div>
    </main>
  );
}
