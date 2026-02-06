# 🎙️ TTS Frontend - Clonación de Voz

Frontend Next.js 15 para el servicio de Text-to-Speech con clonación de voz usando XTTS-v2.

## 🚀 Inicio Rápido

### 1. Configuración

```bash
# Copiar archivo de ejemplo
cp .env.example .env.local

# Editar .env.local con la URL del backend
nano .env.local
```

**Configuración actual (Red Local):**
```env
NEXT_PUBLIC_TTS_API_URL=http://192.168.30.254:5000
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Ejecutar en Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

### 4. Build para Producción

```bash
npm run build
npm start
```

## 🔧 Variables de Entorno

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `NEXT_PUBLIC_TTS_API_URL` | URL del backend TTS | `http://192.168.30.254:5000` |

### Configuraciones según entorno:

- **Desarrollo Local:** `http://localhost:5000`
- **Red Local (Servidor AI):** `http://192.168.30.254:5000`
- **Producción Pública:** `https://api-voz.cloudmusic.cl`

## 📁 Estructura del Proyecto

```
tts-frontend/
├── app/
│   ├── actions/tts.ts      # Server Actions para TTS
│   ├── page.tsx             # Página principal
│   └── layout.tsx           # Layout global
├── src/
│   └── components/          # Componentes React
├── public/                  # Archivos estáticos
├── .env.local              # Variables de entorno (NO commitear)
├── .env.example            # Ejemplo de configuración
└── next.config.ts          # Configuración de Next.js
```

## 🔌 Backend TTS

El frontend se conecta al servicio TTS que debe estar corriendo en:
- **IP:** `192.168.30.254`
- **Puerto:** `5000`
- **Health Check:** `http://192.168.30.254:5000/health`

### Verificar Backend:
```bash
curl http://192.168.30.254:5000/health
# Respuesta esperada: {"service":"tts-voice-cloning","status":"healthy"}
```

## 🐳 Deploy

### Opción 1: Coolify
El archivo `coolify.json` contiene la configuración para despliegue automático.

### Opción 2: Vercel/Netlify
1. Conectar repositorio
2. Agregar variable de entorno `NEXT_PUBLIC_TTS_API_URL`
3. Deploy automático

## 📚 Documentación

- [Next.js 15](https://nextjs.org/docs)
- [React 19](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)

---

**Autor:** CloudMusic.cl  
**Backend:** TTS Voice Cloning Service (XTTS-v2)
