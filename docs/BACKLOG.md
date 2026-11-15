# Backlog

Sitio **entregado** (F1–F5 cerradas 2026-10-08; ver `docs/qa-report.md` y §XII
de `docs/diagnostics.md`). Estos son los **temas identificados y deliberadamente
postergados** para el loop de mantenimiento. Ninguno bloquea el sitio. Cada ítem
necesita decisión del usuario antes de implementarse (flujo por tipo de tarea:
"Modo mantenimiento" en `docs/agent-system.md`).

## Pendientes de contenido

- **Download CV / PDF.** ✅ Integrado: `profile.downloadCvUrl` apunta a
  `public/cv/Juan-Manuel-Ibanez-CV.pdf` y el botón del Sidebar lo descarga.
  Queda abierto: ¿un PDF por idioma? (`downloadCvUrl` distinto en cada
  `cv.<locale>.json`, que pasaría a ser campo traducible).
- **Imágenes.** El avatar del sitio ya es WebP (#119). Queda abierto: AVIF,
  tamaños para `srcset` del avatar y formato de los testimonios.

## Pendientes técnicos

- **Ícono de LinkedIn.** Confirmado (2026-09-30): no está en
  `simple-icons` 16.33.0 (retirado en la v14 a pedido de la marca); las demás
  redes de `SOCIAL_NETWORKS` sí están. Resuelto en BrandIcon T1 (`9f0cc0b`):
  `BrandIcon/paths.ts` usa el path canónico del logo "in" monocromo (el que
  distribuyó `simple-icons` hasta v14; geometría 24×24 validada por el
  reviewer), con comentario de origen. **Pendiente:** verificar la equivalencia
  exacta contra el SVG actual del kit de prensa de LinkedIn
  (`https://brand.linkedin.com/downloads` — el entorno de los agentes no tiene
  red) y revisar sus guías de uso del logo para enlazar a un perfil propio.
- **SEO por idioma.** (**Abierto**, 2026-11-14.) Hoy el idioma no está en la
  URL (`/es/…`) y los metadatos —un solo `<title>`/description, #117— existen
  solo en inglés. Si importa el SEO en español: rutas por idioma,
  `hreflang`, metadatos por idioma y posiblemente prerender.
- **Metadatos y Open Graph.** ✅ **Resuelto (2026-11-14, decisión #117,
  Foundation T19):** `meta description`, canonical, Open Graph (5 etiquetas),
  `twitter:card`, JSON-LD `Person` (cruzado con `cv.en.json`) y
  `public/og-image.png` 1200×630 en `index.html`, en inglés y con URLs
  absolutas fijas al deploy de GitHub Pages (detalle: fila #117 de
  `docs/README.md` y §XXVIII de `docs/diagnostics.md`). El favicon ya quedó
  resuelto en F5: `public/favicon.svg` + `<link rel="icon">` (`b93c510`,
  decisión #105a).
- **Deploy.** ✅ Resuelto: GitHub Pages con CI (`lint` → `test` → `build`,
  Node 26; #107, #110, #111). Queda abierto solo un dominio propio.
- **Test de contraste automatizado.** axe en jsdom no mide
  contraste; evaluar Playwright + axe en navegador real para QA automático
  en ambos temas.
- **Carga de idiomas.** Hoy ambos JSON de contenido van en el bundle (import
  estático). Si se suman idiomas o el contenido crece: `import()` dinámico por
  idioma en `content/index.ts`.
- **Aprendizajes entre tareas.** Hoy los aprendizajes viven en
  `docs/memory.md` ("Reglas no negociables para cualquier tarea futura", máximo ~50 líneas, solo
  lo edita el orchestrator al cerrar cada puerta F). Si se ve que se repiten
  errores y no alcanza, diseñar un mecanismo propio (por ejemplo, un
  `LEARNINGS.md` que el orchestrator cure con los hallazgos del reviewer, que
  no tiene permiso de escritura).

## Fuera de alcance (no reabrir sin decisión explícita)

Portfolio, Blog, página Contact, skills con porcentaje, clientes, preloader,
fondo de triángulos, fecha en testimonios, hamburguesa/drawer.
