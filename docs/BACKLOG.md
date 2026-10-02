# Backlog

Temas identificados y **deliberadamente postergados**. Ninguno bloquea las
fases F1–F5. Cada ítem necesita decisión del usuario antes de implementarse.

## Pendientes de contenido

- **Download CV / PDF.** El PDF existe pero su integración se resuelve en una
  etapa futura. Hoy la spec condiciona el botón a `profile.downloadCvUrl`
  (si falta, no se muestra). Decidir:
  - ¿Un PDF por idioma? (probable: `downloadCvUrl` en cada `cv.<locale>.json`,
    que pasa a ser campo traducible).
  - Ubicación (`public/cv/…`), nombre de archivo, tamaño, y si abre en pestaña
    nueva o descarga.
- **Contenido real.** Reemplazar `cv.example.*` por el CV real (textos,
  avatar, testimonios con permiso de sus autores).
- **Imágenes.** Formato (`.webp`/`.avif`), tamaños para `srcset` del avatar y
  de los testimonios.

## Pendientes técnicos

- **Ícono de LinkedIn.** Confirmado (2026-09-30): no está en
  `simple-icons` 16.33.0 (retirado en la v14 a pedido de la marca); las demás
  redes de `SOCIAL_NETWORKS` sí están. Usar el SVG oficial del kit de marca de
  LinkedIn en `BrandIcon/paths.ts`, con comentario de origen, y revisar sus
  guías de uso del logo para enlazar a un perfil propio.
- **SEO por idioma.** Hoy el idioma no está en la URL (`/es/…`) y hay un solo
  `<title>`/meta description. Si importa el SEO en español: rutas por idioma,
  `hreflang`, metadatos por idioma y posiblemente prerender.
- **Metadatos y Open Graph.** Título, descripción, imagen para compartir,
  favicon/ícono de la app.
- **Deploy.** Plataforma (Netlify, Vercel, GitHub Pages…), dominio, CI.
- **Test de contraste automatizado.** axe en jsdom no mide
  contraste; evaluar Playwright + axe en navegador real para QA automático
  en ambos temas.
- **Carga de idiomas.** Hoy ambos JSON de contenido van en el bundle (import
  estático). Si se suman idiomas o el contenido crece: `import()` dinámico por
  idioma en `content/index.ts`.
- **Aprendizajes entre tareas.** El proyecto arranca sin base de
  aprendizajes para los agentes. Si se ve que se repiten errores, diseñar un
  mecanismo propio (por ejemplo, un `LEARNINGS.md` curado por el reviewer).

## Fuera de alcance (no reabrir sin decisión explícita)

Portfolio, Blog, página Contact, skills con porcentaje, clientes, preloader,
fondo de triángulos, fecha en testimonios, hamburguesa/drawer.
