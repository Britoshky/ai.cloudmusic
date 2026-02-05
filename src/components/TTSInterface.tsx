'use client';

import { useState } from 'react';
import { cloneVoice, useVoiceFromGallery } from '@/app/actions/tts';
import VoiceGallery from './VoiceGallery';

export default function TTSInterface() {
  const [text, setText] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [language, setLanguage] = useState('es');
  const [temperature, setTemperature] = useState(0.75);
  const [speed, setSpeed] = useState(1.0);
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [useGallery, setUseGallery] = useState(false);
  const [selectedVoiceId, setSelectedVoiceId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      
      if (useGallery && selectedVoiceId) {
        // Usar voz de la galería
        const blob = await useVoiceFromGallery(selectedVoiceId, text, language, temperature, speed);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
      } else {
        // Usar archivo de audio subido
        if (!audioFile) {
          setError('Selecciona un archivo de audio o usa una voz de la galería');
          setLoading(false);
          return;
        }
        formData.append('audio', audioFile);
        formData.append('text', text);
        formData.append('language', language);
        formData.append('temperature', temperature.toString());
        formData.append('speed', speed.toString());

        const result = await cloneVoice(formData);

        if (result.success && result.audio) {
          const blob = new Blob(
            [Uint8Array.from(atob(result.audio), c => c.charCodeAt(0))],
            { type: 'audio/wav' }
          );
          const url = URL.createObjectURL(blob);
          setAudioUrl(url);
        } else {
          setError(result.error || 'Error generando audio');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error generando audio');
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceSelect = (voiceId: string) => {
    setSelectedVoiceId(voiceId);
    setUseGallery(true);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <VoiceGallery onSelectVoice={handleVoiceSelect} selectedVoiceId={selectedVoiceId} />
      
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-6 text-center text-black">
          Clon de Voz con IA
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex gap-4 mb-4">
            <button
              type="button"
              onClick={() => setUseGallery(false)}
              className={`flex-1 px-4 py-2 rounded-lg font-semibold ${!useGallery ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              Subir Audio
            </button>
            <button
              type="button"
              onClick={() => setUseGallery(true)}
              className={`flex-1 px-4 py-2 rounded-lg font-semibold ${useGallery ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              Usar Galería {selectedVoiceId && '✓'}
            </button>
          </div>

          {!useGallery && (
            <div>
              <label className="block text-sm font-medium mb-2 text-black">
                Audio de referencia (3-10 seg recomendado)
              </label>
              <input
                type="file"
                accept=".mp3,.wav,.m4a,.ogg,.flac,.aac,.wma"
                onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                className="w-full px-4 py-2 border rounded-lg text-black"
              />
              <p className="text-xs text-gray-500 mt-1">
                Formatos: MP3, WAV, M4A, OGG, FLAC, AAC, WMA
              </p>
            </div>
          )}

          {useGallery && selectedVoiceId && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800">✓ Voz seleccionada de la galería</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2 text-black">
              Texto a convertir
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Escribe el texto que quieres convertir a voz..."
              className="w-full px-4 py-2 border rounded-lg h-32 text-black"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-black">
                Idioma
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg text-black"
              >
                <option value="es">Español</option>
                <option value="en">English</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
                <option value="it">Italiano</option>
                <option value="pt">Português</option>
                <option value="pl">Polski</option>
                <option value="tr">Türkçe</option>
                <option value="ru">Русский</option>
                <option value="nl">Nederlands</option>
                <option value="cs">Čeština</option>
                <option value="ar">العربية</option>
                <option value="zh-cn">中文</option>
                <option value="ja">日本語</option>
                <option value="hu">Magyar</option>
                <option value="ko">한국어</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-black">
                Calidad de voz: {temperature.toFixed(2)}
              </label>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">
                Menor = más estable y similar al original
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-black">
              Velocidad: {speed.toFixed(1)}x
            </label>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              1.0 = velocidad normal
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || (!audioFile && !selectedVoiceId)}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
          >
            {loading ? 'Generando...' : 'Generar Voz'}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {audioUrl && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-3 text-black">Audio generado:</h2>
            <audio controls className="w-full" src={audioUrl}>
              Tu navegador no soporta el elemento de audio.
            </audio>
            <a
              href={audioUrl}
              download="voz_clonada.wav"
              className="inline-block mt-3 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Descargar Audio
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
