# 🎬 VideoForum - Foro Web para Alojar Videos (24/7 en GitHub Pages)

Un foro web moderno y ligero para alojar videos (archivos directos o enlaces de YouTube/directos) y debatir en comunidad, con un único enlace público disponible 24/7 en la nube gratuita de **GitHub Pages**, sin necesidad de ejecutar archivos `.bat` ni tener tu PC encendida.

---

## 🌐 Cómo Alojarlo en GitHub Pages (Un solo enlace 24/7 Gratis)

### Pasos rápidos:

1. **Coloca tu video (Opcional)**:
   - Si tienes tu archivo de video en la computadora, cópialo dentro de la carpeta `video-forum` con el nombre `video.mp4` (o usa enlaces directos/YouTube desde el foro).
   - *Nota*: GitHub permite archivos de hasta 100 MB directamente por archivo y hasta 1-2 GB por repositorio, lo cual es más que suficiente para videos web.

2. **Súbelo con el asistente automático**:
   - Haz doble clic en el archivo:
     👉 **`subir-a-github.bat`**
   - Te pedirá la URL de tu repositorio de GitHub (ejemplo: `https://github.com/tu-usuario/mi-foro.git`).

3. **Activa GitHub Pages en 1 clic**:
   - Entra en tu repositorio en GitHub desde el navegador.
   - Ve a **Settings** (Configuración) > pestaña **Pages** (menú izquierdo).
   - En **Build and deployment > Branch**, selecciona:
     - Rama: `main`
     - Carpeta: `/ (root)`
   - Haz clic en **Save**.

4. **¡Listo!** En 1 minuto tendrás tu enlace único público:
   👉 **`https://tu-usuario.github.io/tu-repositorio/`**

Podrás enviar ese enlace a cualquier persona en internet. Estará online 24/7 sin gastar nada y sin abrir programas en tu PC.

---

## 💬 Cómo funcionan los comentarios en la nube de GitHub

GitHub Pages almacena y sirve la web de forma estática y ultrarrápida. Para los debates:
- **Discusiones integradas en la nube**: Puedes activar **Giscus / GitHub Discussions** (100% nativo de GitHub) en tu repositorio para que todas las respuestas y comentarios se almacenen en la nube oficial de GitHub sin costo.
- **Modo nube instantáneo**: También puedes conectar tu repositorio de GitHub a plataformas gratuitas como **Vercel** o **Render** con 1 solo clic ("Import from GitHub"), lo que te da un enlace permanente adicional como `https://tu-foro.vercel.app` ejecutando el backend completo 24/7.
- **Pruebas locales**: Puedes seguir usando `iniciar-foro.bat` en tu computadora siempre que quieras probar cambios antes de subirlos a GitHub.

---

## 📁 Archivos Principales

```text
video-forum/
├── index.html              # Web principal lista para GitHub Pages
├── style.css               # Estilos modernos responsivos (dark/light)
├── app.js                  # Lógica con soporte para GitHub Pages y servidor
├── data/
│   └── forum_data.json     # Datos y videos iniciales
├── subir-a-github.bat      # Asistente automático para subir a GitHub
├── iniciar-foro.bat        # Para probar en local si lo deseas
├── vercel.json             # Configuración lista para Vercel
└── package.json            # Dependencias
```
