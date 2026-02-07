'use client';

import { useState, useEffect } from 'react';
import { getVoices, addVoice, deleteVoice } from '@/app/actions/tts';
import { Button, Card, CardBody, Input, Select, SelectItem, Accordion, AccordionItem, Chip } from '@nextui-org/react';

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
      const result = await getVoices();
      if (result.success) {
        setUserVoices(result.user_voices);
        setPreloadedVoices(result.preloaded_voices);
      }
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
      const result = await addVoice(formData);
      
      if (result.success) {
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
      const result = await deleteVoice(voiceId);
      if (result.success) {
        loadVoices();
      }
    } catch (error) {
      console.error('Error deleting voice:', error);
    }
  };

  if (loading) {
    return (
      <Card className="mb-6 backdrop-blur-xl border border-primary-500/20">
        <CardBody className="text-center py-8">
          <div className="animate-pulse flex items-center justify-center gap-2">
            <span className="text-2xl">⚙️</span>
            <span className="text-default-500">Cargando voces...</span>
          </div>
        </CardBody>
      </Card>
    );
  }

  const selectedVoice = [...preloadedVoices, ...userVoices].find(v => v.id === selectedVoiceId);

  return (
    <Card className="mb-6 backdrop-blur-xl border border-primary-500/20">
      <CardBody className="p-8 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent flex items-center gap-2">
            <span>🎙️</span>
            <span>Seleccionar Voz</span>
          </h2>
          <Button
            color={showAddForm ? "danger" : "primary"}
            variant="shadow"
            onPress={() => setShowAddForm(!showAddForm)}
            startContent={<span>{showAddForm ? '✕' : '+'}</span>}
          >
            {showAddForm ? 'Cancelar' : 'Agregar Voz'}
          </Button>
        </div>

        {showAddForm && (
          <Card className="bg-gradient-to-br from-primary-500/10 to-accent-500/10 border-2 border-primary-500/30">
            <CardBody className="p-6 space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <span>➕</span>
                <span>Agregar Nueva Voz</span>
              </h3>
              <form onSubmit={handleAddVoice} className="space-y-4">
                <Input
                  type="text"
                  label="Nombre de la voz"
                  placeholder="Ej: Mi voz personalizada"
                  value={newVoice.name}
                  onValueChange={(value) => setNewVoice({ ...newVoice, name: value })}
                  isRequired
                  classNames={{
                    input: "text-slate-200",
                    inputWrapper: "border-2 border-primary-500/30 bg-dark-900/50"
                  }}
                />
                <Input
                  type="text"
                  label="Descripción"
                  placeholder="Descripción opcional"
                  value={newVoice.description}
                  onValueChange={(value) => setNewVoice({ ...newVoice, description: value })}
                  classNames={{
                    input: "text-slate-200",
                    inputWrapper: "border-2 border-primary-500/30 bg-dark-900/50"
                  }}
                />
                <Select
                  label="Idioma"
                  selectedKeys={[newVoice.language]}
                  onChange={(e) => setNewVoice({ ...newVoice, language: e.target.value })}
                  classNames={{
                    trigger: "border-2 border-primary-500/30 bg-dark-900/50",
                    value: "text-slate-200"
                  }}
                >
                  <SelectItem key="es" value="es">🇪🇸 Español</SelectItem>
                  <SelectItem key="en" value="en">🇺🇸 English</SelectItem>
                  <SelectItem key="fr" value="fr">🇫🇷 Français</SelectItem>
                  <SelectItem key="de" value="de">🇩🇪 Deutsch</SelectItem>
                  <SelectItem key="it" value="it">🇮🇹 Italiano</SelectItem>
                  <SelectItem key="pt" value="pt">🇧🇷 Português</SelectItem>
                  <SelectItem key="pl" value="pl">🇵🇱 Polski</SelectItem>
                  <SelectItem key="tr" value="tr">🇹🇷 Türkçe</SelectItem>
                  <SelectItem key="ru" value="ru">🇷🇺 Русский</SelectItem>
                  <SelectItem key="nl" value="nl">🇳🇱 Nederlands</SelectItem>
                  <SelectItem key="cs" value="cs">🇨🇿 Čeština</SelectItem>
                  <SelectItem key="ar" value="ar">🇸🇦 العربية</SelectItem>
                  <SelectItem key="zh-cn" value="zh-cn">🇨🇳 中文</SelectItem>
                  <SelectItem key="ja" value="ja">🇯🇵 日本語</SelectItem>
                  <SelectItem key="hu" value="hu">🇭🇺 Magyar</SelectItem>
                  <SelectItem key="ko" value="ko">🇰🇷 한국어</SelectItem>
                </Select>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold flex items-center gap-2">
                    <span>🎵</span>
                    <span>Archivo de audio (3-10 seg)</span>
                  </label>
                  <input
                    type="file"
                    accept=".mp3,.wav,.m4a,.ogg,.flac,.aac,.wma"
                    onChange={(e) => setNewVoice({ ...newVoice, audioFile: e.target.files?.[0] || null })}
                    className="w-full px-4 py-3 border-2 border-primary-500/30 rounded-xl bg-dark-900/50 text-slate-200 focus:border-primary-500 focus:outline-none transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary-600 file:text-white file:cursor-pointer hover:file:bg-primary-700"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  color="success"
                  variant="shadow"
                  className="w-full font-semibold"
                  startContent={<span>💾</span>}
                >
                  Guardar Voz
                </Button>
              </form>
            </CardBody>
          </Card>
        )}

        {/* Selector Principal de Voces Pre-cargadas */}
        {preloadedVoices.length > 0 && (
          <div className="space-y-3">
            <label className="block text-sm font-semibold flex items-center gap-2">
              <span>🎭</span>
              <span>Locutores Profesionales de Chile</span>
            </label>
            <Select
              label="Selecciona un locutor profesional"
              selectedKeys={selectedVoiceId ? [selectedVoiceId] : []}
              onChange={(e) => onSelectVoice(e.target.value)}
              placeholder="Elige un locutor..."
              classNames={{
                trigger: "border-2 border-success-500/30 bg-gradient-to-r from-success-500/10 to-primary-500/10",
                value: "text-slate-200 font-medium"
              }}
            >
              {preloadedVoices.map((voice) => (
                <SelectItem key={voice.id} value={voice.id}>
                  🎙️ {voice.name}
                </SelectItem>
              ))}
            </Select>
            
            {/* Vista previa de voz seleccionada */}
            {selectedVoice && selectedVoice.type === 'preloaded' && (
              <Card className="bg-success-500/10 border-2 border-success-500/30">
                <CardBody className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-lg text-success-300 flex items-center gap-2">
                        <span>✓</span>
                        <span>{selectedVoice.name}</span>
                      </h4>
                      <p className="text-sm text-success-400">🇨🇱 Locutor profesional chileno</p>
                    </div>
                    <Chip color="success" variant="flat" size="sm">
                      PRE-CARGADO
                    </Chip>
                  </div>
                </CardBody>
              </Card>
            )}
          </div>
        )}

        {/* Voces de Usuarios - Accordion */}
        {userVoices.length > 0 && (
          <Accordion variant="bordered">
            <AccordionItem
              key="user-voices"
              aria-label="Mis Voces Guardadas"
              title={
                <div className="flex items-center gap-2 font-semibold">
                  <span>👤</span>
                  <span>Mis Voces Guardadas</span>
                  <Chip size="sm" color="primary" variant="flat">{userVoices.length}</Chip>
                </div>
              }
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 pt-4">
                {userVoices.map((voice) => (
                  <Card
                    key={voice.id}
                    isPressable
                    isHoverable
                    onPress={() => onSelectVoice(voice.id)}
                    className={`transition-all ${
                      selectedVoiceId === voice.id
                        ? 'border-2 border-primary-500 bg-primary-500/10'
                        : 'border border-default-200'
                    }`}
                  >
                    <CardBody className="p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <h4 className="font-bold text-base truncate flex-1">{voice.name}</h4>
                        {selectedVoiceId === voice.id && (
                          <span className="text-primary-500 text-xl ml-2">✓</span>
                        )}
                      </div>
                      {voice.description && (
                        <p className="text-xs text-default-500 line-clamp-2">{voice.description}</p>
                      )}
                      <div className="flex justify-between items-center text-xs">
                        <Chip size="sm" variant="flat">{voice.language}</Chip>
                        <span className="text-default-400">⏱️ {voice.duration}s</span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          color={selectedVoiceId === voice.id ? "primary" : "default"}
                          variant={selectedVoiceId === voice.id ? "shadow" : "flat"}
                          onPress={() => onSelectVoice(voice.id)}
                          className="flex-1"
                        >
                          {selectedVoiceId === voice.id ? '✓ Seleccionada' : 'Usar'}
                        </Button>
                        <Button
                          size="sm"
                          color="danger"
                          variant="flat"
                          isIconOnly
                          onPress={(e) => {
                            e.stopPropagation();
                            handleDeleteVoice(voice.id);
                          }}
                        >
                          🗑️
                        </Button>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            </AccordionItem>
          </Accordion>
        )}

        {preloadedVoices.length === 0 && userVoices.length === 0 && !loading && (
          <Card className="border-2 border-dashed border-default-300">
            <CardBody className="text-center py-12">
              <p className="text-default-500 text-lg mb-2">No hay voces disponibles</p>
              <p className="text-default-400 text-sm">Agrega tu primera voz con audio de 3-10 segundos para mejor calidad</p>
            </CardBody>
          </Card>
        )}
      </CardBody>
    </Card>
  );
}
