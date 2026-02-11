/**
 * Configuración del API backend
 */

export const getApiUrl = () => {
  // En producción usar el dominio público, en desarrollo usar IP local
  if (typeof window !== 'undefined' && window.location.hostname === 'ai.cloudmusic.cl') {
    return 'https://api-voz.cloudmusic.cl';
  }
  return 'http://192.168.30.254:4000';
};

export const API_URL = getApiUrl();
