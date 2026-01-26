# GUÍA DE DESPLIEGUE: GYM 3.0

Sigue estos pasos para llevar GYM 3.0 a producción en GitHub y Vercel.

## 1. Subir a GitHub

El proyecto ya está inicializado localmente con Git. Sigue estos pasos para subirlo a la nube:

1. **Crea un nuevo repositorio** en [GitHub](https://github.com/new). No marques "Initialize with README".
2. **Conecta tu repositorio local** (reemplaza la URL):
   ```bash
   git remote add origin https://github.com/tu-usuario/tu-repositorio.git
   ```
3. **Sube el código:**
   ```bash
   git push -u origin main
   ```

## 2. Desplegar en Vercel

1. Inicia sesión en [Vercel](https://vercel.com).
2. Haz clic en **"Add New"** -> **"Project"**.
3. Importa el repositorio que acabas de subir a GitHub.
4. **Configura las Variables de Entorno**:
   En la sección "Environment Variables", agrega las siguientes (con los valores de tu `.env.local`):
   - `VITE_GEMINI_API_KEY`
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Haz clic en **"Deploy"**.

## 3. Configuración de Supabase

Asegúrate de haber ejecutado el script en `supabase/schema.sql` en el SQL Editor de tu proyecto Supabase para que la base de datos funcione correctamente una vez migrados los componentes.

---
**Nota:** El proyecto está optimizado con `terser` para minificación agresiva y `manualChunks` para una carga eficiente en Vercel.
