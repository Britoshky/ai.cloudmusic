/**
 * Configuración del API backend
 * En producción usa proxy local, en desarrollo usa URL directa
 */

export const getApiUrl = () => {
  // En el cliente, detectar si estamos en producción por el protocolo
  if (typeof window !== 'undefined') {
    // Si el frontend está en HTTPS, usar proxy local
    if (window.location.protocol === 'https:') {
      return '/api/proxy';
    }
  }
  
  // En desarrollo o localhost, usar URL directa
  return process.env.NEXT_PUBLIC_TTS_API_URL || 'http://localhost:4000';
};

export const API_URL = getApiUrl();
