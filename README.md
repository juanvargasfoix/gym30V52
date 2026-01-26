# GYM 3.0 - Laboratorio de Habilidades Blandas

GYM 3.0 es una plataforma B2B de entrenamiento en competencias blandas (soft skills) con gamificación inspirada en Management 3.0. Utiliza inteligencia artificial (Google Gemini) para evaluar respuestas y simular situaciones de liderazgo, comunicación y negociación.

## 🚀 Características
- **Mapa de Competencias**: 24 habilidades divididas en Comunicación, Liderazgo, Autoliderazgo y Negociación.
- **Evaluación por IA**: Integración con Google Gemini para feedback en tiempo real.
- **Gamificación**: Sistema de XP, rangos y kudos entre colaboradores.
- **Arquitectura**: React 19 + Tailwind CSS + Supabase (Auth/DB).

## 🛠️ Instalación y Desarrollo Local

1. **Clonar el repositorio y entrar en la carpeta:**
   ```bash
   git clone [URL_REPOSITORIO]
   cd gym-3.0
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno:**
   Crea un archivo `.env.local` basado en `.env.example`:
   ```env
   VITE_GEMINI_API_KEY=tu_api_key_de_gemini
   VITE_SUPABASE_URL=tu_url_de_supabase
   VITE_SUPABASE_ANON_KEY=tu_anon_key_de_supabase
   ```

4. **Ejecutar en desarrollo:**
   ```bash
   npm run dev
   ```

## 📦 Despliegue
Consulta [DEPLOYMENT.md](DEPLOYMENT.md) para instrucciones detalladas sobre cómo desplegar en GitHub y Vercel.

## 📄 Licencia
Privado - Todos los derechos reservados.
