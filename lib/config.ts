/**
 * Configuración del API backend
 * Usa api-voz.cloudmusic.cl en producción y local
 */

export const getApiUrl = () => {
  // Verificar si estamos en el navegador
  if (typeof window !== 'undefined') {
    // En producción (HTTPS), usar el dominio con HTTPS
    if (window.location.protocol === 'https:') {
      return 'https://api-voz.cloudmusic.cl';
    }
    // En desarrollo local, usar HTTP
    return 'http://api-voz.cloudmusic.cl';
  }
  
  // En servidor (SSR), usar HTTP por defecto
  return 'http://api-voz.cloudmusic.cl';
};

export const API_URL = getApiUrl();
