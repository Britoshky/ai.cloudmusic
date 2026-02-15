/**
 * Configuración del API backend
 */

export const getApiUrl = () => {
  // Siempre usar proxy same-origin para evitar exponer secretos/firmas al navegador
  return '/api/tts';
};

export const API_URL = getApiUrl();
