"use server";

// URL del backend TTS - Server Actions usan IP directa (sin CORS)
const API_URL = process.env.TTS_BACKEND_URL || 'http://192.168.30.254:4000';

export async function generateSpeech(text: string, language: string = "es") {
  try {
    const response = await fetch(`${API_URL}/tts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        language,
      }),
    });

    if (!response.ok) {
      throw new Error("Error generando audio");
    }

    const blob = await response.blob();
    const buffer = Buffer.from(await blob.arrayBuffer());
    
    return {
      success: true,
      audio: buffer.toString("base64"),
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}

export async function cloneVoice(formData: FormData) {
  try {
    const response = await fetch(`${API_URL}/clone`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Error clonando voz");
    }

    const blob = await response.blob();
    const buffer = Buffer.from(await blob.arrayBuffer());
    
    return {
      success: true,
      audio: buffer.toString("base64"),
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}

export async function useVoiceFromGallery(
  voiceId: string,
  text: string,
  language: string,
  temperature: number,
  speed: number
) {
  const response = await fetch(`${API_URL}/voices/${voiceId}/use`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
      language,
      temperature,
      speed,
    }),
  });

  if (!response.ok) {
    throw new Error('Error usando voz de la galería');
  }

  return await response.blob();
}

// Obtener voces disponibles
export async function getVoices() {
  try {
    const response = await fetch(`${API_URL}/voices`);
    
    if (!response.ok) {
      throw new Error('Error obteniendo voces');
    }
    
    const data = await response.json();
    return {
      success: true,
      user_voices: data.user_voices || [],
      preloaded_voices: data.preloaded_voices || [],
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
      user_voices: [],
      preloaded_voices: [],
    };
  }
}

// Agregar nueva voz
export async function addVoice(formData: FormData) {
  try {
    const response = await fetch(`${API_URL}/voices`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error agregando voz');
    }

    const data = await response.json();
    return {
      success: true,
      voice: data,
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}

// Eliminar voz
export async function deleteVoice(voiceId: string) {
  try {
    const response = await fetch(`${API_URL}/voices/${voiceId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Error eliminando voz');
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}
