/**
 * Configuración del API backend
 * En producción usa proxy local, en desarrollo usa URL directa
 */

export const getApiUrl = () => {
  // En producción, usar el subdominio con HTTPS
  if (typeof window !== 'undefined') {
    if (window.location.protocol === 'https:') {
      return 'https://api-voz.cloudmusic.cl';
    }
  }
  
  // En desarrollo, usar URL directa al servidor con GPU
  return process.env.NEXT_PUBLIC_TTS_API_URL || 'http://192.168.30.254:4000';
};

export const API_URL = getApiUrl();
