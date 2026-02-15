'use client';

import { useState, useEffect } from 'react';
import { Button, Card, CardBody, Textarea, Select, SelectItem, Slider, Chip } from '@nextui-org/react';
import Script from 'next/script';
import { getApiUrl } from '@/lib/config';

interface Voice {
  id: string;
  name: string;
  description?: string;
  language?: string;
  duration?: number;
  filename: string;
  type?: string;
}

export default function TTSInterface() {
  const [text, setText] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [language, setLanguage] = useState('es');
  const [temperature, setTemperature] = useState(0.75);
  const [speed, setSpeed] = useState(1.0);
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [preloadedVoices, setPreloadedVoices] = useState<Voice[]>([]);
  const [selectedVoiceId, setSelectedVoiceId] = useState<string | null>(null);
  const [usePreloadedVoice, setUsePreloadedVoice] = useState(false);
  const [clientId, setClientId] = useState<string>('');
  const [turnstileToken, setTurnstileToken] = useState<string>('');
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '';

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedId = localStorage.getItem('tts_client_id');
      if (storedId) {
        setClientId(storedId);
      } else {
        const generatedId = crypto.randomUUID();
        localStorage.setItem('tts_client_id', generatedId);
        setClientId(generatedId);
      }
    }
  }, []);

  useEffect(() => {
    if (!turnstileSiteKey) return;

    (window as any).onTurnstileSuccess = (token: string) => {
      setTurnstileToken(token);
    };
    (window as any).onTurnstileExpired = () => {
      setTurnstileToken('');
    };
    (window as any).onTurnstileError = () => {
      setTurnstileToken('');
    };
  }, [turnstileSiteKey]);

  useEffect(() => {
    if (clientId) {
      loadVoices();
    }
  }, [clientId]);

  const getApiErrorMessage = async (response: Response, fallback: string) => {
    try {
      const data = await response.json();
      if (response.status === 429) {
        return data.error || 'Límite de 10 peticiones alcanzado para este usuario';
      }
      return data.error || fallback;
    } catch {
      return response.status === 429
        ? 'Límite de 10 peticiones alcanzado para este usuario'
        : fallback;
    }
  };

  const loadVoices = async () => {
    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/voices`, {
        headers: {
          ...(clientId ? { 'X-User-Id': clientId } : {}),
        },
      });

      if (!response.ok) {
        throw new Error(await getApiErrorMessage(response, 'Error obteniendo voces'));
      }

      const data = await response.json();
      if (data?.preloaded_voices) {
        setPreloadedVoices(data.preloaded_voices);
      }
    } catch (error) {
      console.error('Error loading voices:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (turnstileSiteKey && !turnstileToken) {
        throw new Error('Completa el desafío anti-bots (Turnstile) antes de generar audio');
      }

      if (usePreloadedVoice && selectedVoiceId) {
        // Usar voz pre-definida
        const apiUrl = getApiUrl();
        const response = await fetch(`${apiUrl}/voices/${selectedVoiceId}/use`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(clientId ? { 'X-User-Id': clientId } : {}),
            ...(turnstileToken ? { 'X-Turnstile-Token': turnstileToken } : {}),
          },
          body: JSON.stringify({
            text,
            language,
            temperature,
            speed,
          }),
        });

        if (!response.ok) {
          throw new Error(await getApiErrorMessage(response, 'Error generando audio'));
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
      } else {
        // Usar archivo de audio subido
        if (!audioFile) {
          setError('Selecciona un archivo de audio o una voz pre-definida');
          setLoading(false);
          return;
        }

        const formData = new FormData();
        formData.append('audio', audioFile);
        formData.append('text', text);
        formData.append('language', language);
        formData.append('temperature', temperature.toString());
        formData.append('speed', speed.toString());

        const apiUrl = getApiUrl();
        const response = await fetch(`${apiUrl}/clone`, {
          method: 'POST',
          headers: {
            ...(clientId ? { 'X-User-Id': clientId } : {}),
            ...(turnstileToken ? { 'X-Turnstile-Token': turnstileToken } : {}),
          },
          body: formData,
        });

        if (!response.ok) {
          throw new Error(await getApiErrorMessage(response, 'Error generando audio'));
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error generando audio');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">

      {turnstileSiteKey && (
        <>
          <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer />
          <div className="mb-6 flex justify-center">
            <div
              className="cf-turnstile"
              data-sitekey={turnstileSiteKey}
              data-callback="onTurnstileSuccess"
              data-expired-callback="onTurnstileExpired"
              data-error-callback="onTurnstileError"
            />
          </div>
        </>
      )}
      
      <Card className="backdrop-blur-xl border border-primary-500/20">
        <CardBody className="p-8 space-y-6">
          <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
            🎙️ Clon de Voz con IA
          </h1>

          <div className="flex gap-3">
            <Button
              color={!usePreloadedVoice ? "primary" : "default"}
              variant={!usePreloadedVoice ? "shadow" : "flat"}
              onPress={() => {
                setUsePreloadedVoice(false);
                setSelectedVoiceId(null);
              }}
              className="flex-1"
              startContent={<span>📤</span>}
            >
              Subir Audio
            </Button>
            <Button
              color={usePreloadedVoice ? "secondary" : "default"}
              variant={usePreloadedVoice ? "shadow" : "flat"}
              onPress={() => setUsePreloadedVoice(true)}
              className="flex-1"
              startContent={<span>🎭</span>}
              endContent={selectedVoiceId && <Chip size="sm" color="success">✓</Chip>}
            >
              Locutores Profesionales
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {usePreloadedVoice && preloadedVoices.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-lg font-bold flex items-center gap-2">
                    <span>🎭</span>
                    <span>Locutores Profesionales</span>
                  </label>
                  <Chip color="success" variant="flat" size="sm">
                    {preloadedVoices.length} disponibles
                  </Chip>
                </div>
                
                <Card className="border border-default-200">
                  <CardBody className="p-0">
                    <div className="max-h-96 overflow-y-auto">
                      {preloadedVoices.map((voice, index) => (
                        <div
                          key={voice.id}
                          onClick={() => setSelectedVoiceId(voice.id)}
                          className={`
                            flex items-center gap-4 p-4 cursor-pointer transition-all duration-200
                            ${index !== 0 ? 'border-t border-default-100' : ''}
                            ${selectedVoiceId === voice.id 
                              ? 'bg-gradient-to-r from-success-500/20 to-primary-500/10 border-l-4 border-l-success-500' 
                              : 'hover:bg-default-100'
                            }
                          `}
                        >
                          <div className={`
                            w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-xl
                            ${selectedVoiceId === voice.id 
                              ? 'bg-success-500 text-white' 
                              : 'bg-primary-500/20'
                            }
                          `}>
                            {selectedVoiceId === voice.id ? '✓' : '🎙️'}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className={`font-semibold text-sm truncate ${
                                selectedVoiceId === voice.id ? 'text-success-400' : ''
                              }`}>
                                {voice.name}
                              </h4>
                              <span className="text-xs">🇨🇱</span>
                            </div>
                            {voice.description && (
                              <p className="text-xs text-default-400 truncate">{voice.description}</p>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {voice.duration && (
                              <span className="text-xs text-default-400">⏱️ {voice.duration}s</span>
                            )}
                            {selectedVoiceId === voice.id && (
                              <Chip color="success" size="sm" variant="flat">
                                Activo
                              </Chip>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardBody>
                </Card>
                
                {!selectedVoiceId && (
                  <Card className="bg-warning-500/10 border border-warning-500/30">
                    <CardBody className="p-3 text-center">
                      <p className="text-warning-400 text-xs flex items-center justify-center gap-2">
                        <span>👆</span>
                        <span>Selecciona un locutor para continuar</span>
                      </p>
                    </CardBody>
                  </Card>
                )}
              </div>
            )}

            {!usePreloadedVoice && (
              <div className="space-y-2">
                <label className="block text-sm font-semibold flex items-center gap-2">
                  <span>🎵</span>
                  <span>Audio de referencia (3-10 seg recomendado)</span>
                </label>
                <input
                  type="file"
                  accept=".mp3,.wav,.m4a,.ogg,.flac,.aac,.wma"
                  onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                  className="w-full px-4 py-3 border-2 border-primary-500/30 rounded-xl bg-dark-900/50 text-slate-200 focus:border-primary-500 focus:outline-none transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary-600 file:text-white file:cursor-pointer hover:file:bg-primary-700"
                />
                <p className="text-xs text-slate-400 flex items-center gap-1">
                  <span>💿</span>
                  <span>Formatos: MP3, WAV, M4A, OGG, FLAC, AAC, WMA</span>
                </p>
              </div>
            )}

            <Textarea
              label={<span className="flex items-center gap-2"><span>✍️</span><span>Texto a convertir</span></span>}
              placeholder="Escribe el texto que quieres convertir a voz..."
              value={text}
              onValueChange={setText}
              minRows={4}
              required
              classNames={{
                input: "text-slate-200",
                inputWrapper: "border-2 border-primary-500/30 bg-dark-900/50"
              }}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select
                label={<span className="flex items-center gap-2"><span>🌍</span><span>Idioma</span></span>}
                selectedKeys={[language]}
                onChange={(e) => setLanguage(e.target.value)}
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

              <Slider
                label={<span className="flex items-center gap-2"><span>🎚️</span><span>Calidad de voz</span></span>}
                step={0.05}
                minValue={0.1}
                maxValue={1.0}
                value={temperature}
                onChange={(value) => setTemperature(value as number)}
                marks={[
                  { value: 0.1, label: "Estable" },
                  { value: 1.0, label: "Creativa" }
                ]}
                className="max-w-md"
                classNames={{
                  track: "bg-dark-800",
                  filler: "bg-gradient-to-r from-primary-500 to-primary-600"
                }}
                formatOptions={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }}
              />
            </div>

            <Slider
              label={<span className="flex items-center gap-2"><span>⚡</span><span>Velocidad</span></span>}
              step={0.1}
              minValue={0.5}
              maxValue={2.0}
              value={speed}
              onChange={(value) => setSpeed(value as number)}
              marks={[
                { value: 0.5, label: "Lento" },
                { value: 1.0, label: "Normal" },
                { value: 2.0, label: "Rápido" }
              ]}
              className="max-w-md"
              classNames={{
                track: "bg-dark-800",
                filler: "bg-gradient-to-r from-accent-500 to-accent-600"
              }}
              formatOptions={{ minimumFractionDigits: 1, maximumFractionDigits: 1 }}
            />

            <Button
              type="submit"
              color="primary"
              size="lg"
              isLoading={loading}
              isDisabled={(!audioFile && !selectedVoiceId)}
              className="w-full bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500 font-bold text-lg shadow-glow"
              startContent={loading ? <span className="animate-spin">⚙️</span> : <span>🎙️</span>}
            >
              {loading ? 'Generando...' : 'Generar Voz'}
            </Button>
          </form>

          {error && (
            <Card className="bg-danger-500/10 border-2 border-danger-500/30">
              <CardBody>
                <p className="text-danger-300 font-semibold flex items-center gap-2">
                  <span>⚠️</span>
                  <span>{error}</span>
                </p>
              </CardBody>
            </Card>
          )}

          {audioUrl && (
            <>
              <Card className="bg-gradient-to-br from-success-500/10 to-primary-500/10 border-2 border-success-500/30">
                <CardBody className="space-y-4">
                  <h2 className="text-xl font-bold text-success-300 flex items-center gap-2">
                    <span>🎵</span>
                    <span>Audio generado</span>
                  </h2>
                  <audio 
                    controls 
                    className="w-full rounded-lg bg-dark-900/50 border border-primary-500/30"
                    src={audioUrl}
                  >
                    Tu navegador no soporta el elemento de audio.
                  </audio>
                  <Button
                    as="a"
                    href={audioUrl}
                    download="voz_clonada.wav"
                    color="success"
                    variant="shadow"
                    startContent={<span>💾</span>}
                    className="font-semibold"
                  >
                    Descargar Audio
                  </Button>
                </CardBody>
              </Card>
            </>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
