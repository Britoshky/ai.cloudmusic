'use client';

import { useState, useEffect } from 'react';

const API_URL = process.env.NEXT_PUBLIC_TTS_API_URL || 'http://localhost:5000';

interface Voice {
  id: string;
  name: string;
  description?: string;
  language?: string;
  duration?: number;
  filename: string;
  type?: string;
}

interface VoiceGalleryProps {
  onSelectVoice: (voiceId: string) => void;
  selectedVoiceId?: string | null;
}

export default function VoiceGallery({ onSelectVoice, selectedVoiceId }: VoiceGalleryProps) {
  const [userVoices, setUserVoices] = useState<Voice[]>([]);
  const [preloadedVoices, setPreloadedVoices] = useState<Voice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showUserVoices, setShowUserVoices] = useState(false);
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
      setUserVoices(data.user_voices || []);
      setPreloadedVoices(data.preloaded_voices || []);
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

  const selectedVoice = [...preloadedVoices, ...userVoices].find(v => v.id === selectedVoiceId);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-black">🎙️ Seleccionar Voz</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          {showAddForm ? '✕ Cancelar' : '+ Agregar Voz'}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddVoice} className="mb-6 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200">
          <h3 className="text-lg font-semibold text-black mb-4">➕ Agregar Nueva Voz</h3>
          <div className="grid gap-4">
            <input
              type="text"
              placeholder="Nombre de la voz"
              value={newVoice.name}
              onChange={(e) => setNewVoice({ ...newVoice, name: e.target.value })}
              className="px-4 py-2 border-2 border-gray-300 rounded-lg text-black focus:border-blue-500 focus:outline-none"
              required
            />
            <input
              type="text"
              placeholder="Descripción (opcional)"
              value={newVoice.description}
              onChange={(e) => setNewVoice({ ...newVoice, description: e.target.value })}
              className="px-4 py-2 border-2 border-gray-300 rounded-lg text-black focus:border-blue-500 focus:outline-none"
            />
            <select
              value={newVoice.language}
              onChange={(e) => setNewVoice({ ...newVoice, language: e.target.value })}
              className="px-4 py-2 border-2 border-gray-300 rounded-lg text-black focus:border-blue-500 focus:outline-none"
            >
              <option value="es">🇪🇸 Español</option>
              <option value="en">🇺🇸 English</option>
              <option value="fr">🇫🇷 Français</option>
              <option value="de">🇩🇪 Deutsch</option>
              <option value="it">🇮🇹 Italiano</option>
              <option value="pt">🇧🇷 Português</option>
              <option value="pl">🇵🇱 Polski</option>
              <option value="tr">🇹🇷 Türkçe</option>
              <option value="ru">🇷🇺 Русский</option>
              <option value="nl">🇳🇱 Nederlands</option>
              <option value="cs">🇨🇿 Čeština</option>
              <option value="ar">🇸🇦 العربية</option>
              <option value="zh-cn">🇨🇳 中文</option>
              <option value="ja">🇯🇵 日本語</option>
              <option value="hu">🇭🇺 Magyar</option>
              <option value="ko">🇰🇷 한국어</option>
            </select>
            <div className="relative">
              <input
                type="file"
                accept=".mp3,.wav,.m4a,.ogg,.flac,.aac,.wma"
                onChange={(e) => setNewVoice({ ...newVoice, audioFile: e.target.files?.[0] || null })}
                className="px-4 py-2 border-2 border-gray-300 rounded-lg text-black w-full focus:border-blue-500 focus:outline-none"
                required
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
            >
              💾 Guardar Voz
            </button>
          </div>
        </form>
      )}

      {/* Selector Principal de Voces Pre-cargadas */}
      {preloadedVoices.length > 0 && (
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            🎭 Locutores Profesionales de Chile
          </label>
          <div className="relative">
            <select
              value={selectedVoiceId || ''}
              onChange={(e) => onSelectVoice(e.target.value)}
              className="w-full px-4 py-3 text-lg border-2 border-green-300 rounded-lg text-black bg-gradient-to-r from-green-50 to-emerald-50 focus:border-green-500 focus:outline-none appearance-none cursor-pointer font-medium shadow-sm hover:shadow-md transition-all"
            >
              <option value="">Selecciona un locutor profesional...</option>
              {preloadedVoices.map((voice) => (
                <option key={voice.id} value={voice.id}>
                  🎙️ {voice.name}
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          
          {/* Vista previa de voz seleccionada */}
          {selectedVoice && selectedVoice.type === 'preloaded' && (
            <div className="mt-4 p-4 bg-green-50 border-2 border-green-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-lg text-green-800">✓ {selectedVoice.name}</h4>
                  <p className="text-sm text-green-600">🇨🇱 Locutor profesional chileno</p>
                </div>
                <div className="text-right">
                  <span className="inline-block px-3 py-1 bg-green-600 text-white text-xs rounded-full font-semibold">
                    PRE-CARGADO
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Voces de Usuarios - Colapsable */}
      {userVoices.length > 0 && (
        <div className="mt-6">
          <button
            onClick={() => setShowUserVoices(!showUserVoices)}
            className="w-full flex items-center justify-between p-4 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors mb-3"
          >
            <span className="font-semibold text-black flex items-center gap-2">
              👤 Mis Voces Guardadas ({userVoices.length})
            </span>
            <svg 
              className={`w-5 h-5 text-gray-600 transition-transform ${showUserVoices ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {showUserVoices && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {userVoices.map((voice) => (
                <div
                  key={voice.id}
                  className={`border-2 rounded-lg p-4 transition-all cursor-pointer ${
                    selectedVoiceId === voice.id
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-blue-300 hover:shadow-sm'
                  }`}
                  onClick={() => onSelectVoice(voice.id)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-bold text-base text-black truncate flex-1">{voice.name}</h4>
                    {selectedVoiceId === voice.id && (
                      <span className="text-blue-600 text-xl ml-2">✓</span>
                    )}
                  </div>
                  {voice.description && (
                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">{voice.description}</p>
                  )}
                  <div className="flex justify-between items-center text-xs text-gray-500 mb-3">
                    <span className="bg-gray-100 px-2 py-1 rounded">{voice.language}</span>
                    <span>⏱️ {voice.duration}s</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectVoice(voice.id);
                      }}
                      className={`flex-1 px-3 py-2 rounded text-xs transition-colors font-semibold ${
                        selectedVoiceId === voice.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                      }`}
                    >
                      {selectedVoiceId === voice.id ? '✓ Seleccionada' : 'Usar'}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteVoice(voice.id);
                      }}
                      className="px-3 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded text-xs transition-colors"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {preloadedVoices.length === 0 && userVoices.length === 0 && !loading && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-500 text-lg mb-2">No hay voces disponibles</p>
          <p className="text-gray-400 text-sm">Agrega tu primera voz con audio de 3-10 segundos para mejor calidad</p>
        </div>
      )}
    </div>
  );
}
