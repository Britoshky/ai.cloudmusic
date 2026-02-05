"use server";

// Usar proxy interno de Next.js
function getApiUrl() {
  // En server actions, usar directamente la IP local
  return process.env.TTS_BACKEND_URL || "http://192.168.30.188:5000";
}

const API_URL = getApiUrl();

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
