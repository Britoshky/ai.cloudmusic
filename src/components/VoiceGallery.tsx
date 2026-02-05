'use client';

import { useState, useEffect } from 'react';

const API_URL = process.env.NEXT_PUBLIC_TTS_API_URL || 'http://localhost:5000';

interface Voice {
  id: string;
  name: string;
  description: string;
  language: string;
  duration: number;
  filename: string;
}

interface VoiceGalleryProps {
  onSelectVoice: (voiceId: string) => void;
}

export default function VoiceGallery({ onSelectVoice }: VoiceGalleryProps) {
  const [voices, setVoices] = useState<Voice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newVoice, setNewVoice] = useState({
    name: '',
    description: '',
    language: 'es',
    audioFile: null as File | null,
  });

  useEffect(() => {
    loadVoices();
  }, []);

  const loadVoices = async () => {
    try {
      const response = await fetch(`${API_URL}/voices`);
      const data = await response.json();
      setVoices(data);
    } catch (error) {
      console.error('Error loading voices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddVoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVoice.audioFile) return;

    const formData = new FormData();
    formData.append('audio', newVoice.audioFile);
    formData.append('name', newVoice.name);
    formData.append('description', newVoice.description);
    formData.append('language', newVoice.language);

    try {
      const response = await fetch(`${API_URL}/voices`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setShowAddForm(false);
        setNewVoice({ name: '', description: '', language: 'es', audioFile: null });
        loadVoices();
      }
    } catch (error) {
      console.error('Error adding voice:', error);
    }
  };

  const handleDeleteVoice = async (voiceId: string) => {
    if (!confirm('¿Eliminar esta voz?')) return;

    try {
      await fetch(`${API_URL}/voices/${voiceId}`, {
        method: 'DELETE',
      });
      loadVoices();
    } catch (error) {
      console.error('Error deleting voice:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-4 text-gray-600">Cargando voces...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-black">Galería de Voces</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {showAddForm ? 'Cancelar' : '+ Agregar Voz'}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddVoice} className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="grid gap-4">
            <input
              type="text"
              placeholder="Nombre de la voz"
              value={newVoice.name}
              onChange={(e) => setNewVoice({ ...newVoice, name: e.target.value })}
              className="px-4 py-2 border rounded-lg text-black"
              required
            />
            <input
              type="text"
              placeholder="Descripción (opcional)"
              value={newVoice.description}
              onChange={(e) => setNewVoice({ ...newVoice, description: e.target.value })}
              className="px-4 py-2 border rounded-lg text-black"
            />
            <select
              value={newVoice.language}
              onChange={(e) => setNewVoice({ ...newVoice, language: e.target.value })}
              className="px-4 py-2 border rounded-lg text-black"
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
            <input
              type="file"
              accept=".mp3,.wav,.m4a,.ogg,.flac,.aac,.wma"
              onChange={(e) => setNewVoice({ ...newVoice, audioFile: e.target.files?.[0] || null })}
              className="px-4 py-2 border rounded-lg text-black"
              required
            />
            <button
              type="submit"
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Guardar Voz
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {voices.length === 0 ? (
          <p className="text-gray-500 col-span-full text-center py-8">
            No hay voces guardadas. Agrega tu primera voz con audio de 3-10 segundos para mejor calidad.
          </p>
        ) : (
          voices.map((voice) => (
            <div
              key={voice.id}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <h3 className="font-bold text-lg text-black mb-1">{voice.name}</h3>
              <p className="text-sm text-gray-600 mb-2">{voice.description}</p>
              <div className="flex justify-between items-center text-xs text-gray-500 mb-3">
                <span>🌍 {voice.language}</span>
                <span>⏱️ {voice.duration}s</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onSelectVoice(voice.id)}
                  className="flex-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm transition-colors"
                >
                  Usar
                </button>
                <button
                  onClick={() => handleDeleteVoice(voice.id)}
                  className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm transition-colors"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
