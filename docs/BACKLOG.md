# Backlog

Sitio **entregado** (F1–F5 cerradas 2026-10-08; ver `docs/qa-report.md` y §XII
de `docs/diagnostics.md`). Estos son los **temas identificados y deliberadamente
postergados** para el loop de mantenimiento. Ninguno bloquea el sitio. Cada ítem
necesita decisión del usuario antes de implementarse (flujo por tipo de tarea:
"Modo mantenimiento" en `docs/agent-system.md`).

## Primer mantenimiento (recomendado al tomar el control)

- **Push** de las ~57+ commits locales (`git push`).
- **Contenido real**: reemplazar `cv.example.*` por el CV real (textos, avatar,
  testimonios con permiso de sus autores) → `npm run validate:content` + suite.
  Con el nombre definitivo: **re-observar 375px es/en** el gap chevron↔nombre
  (23px medidos con "Alex Rivera"; fila "Pendientes post-F5" de diagnostics).
- **Opcional**: `profile.downloadCvUrl` (activa el CTA y ejercita la regla print
  `aside [download]`, hoy latente); un pase de deudas de forma registrado en
  Abiertos (comentario inglés `useHashTab.test.ts:143`, jerga "asiértan", F1/F2).

## Pendientes de contenido

- **Download CV / PDF.** El PDF existe pero su integración se resuelve en una
  etapa futura. Hoy la spec condiciona el botón a `profile.downloadCvUrl`
  (si falta, no se muestra). Decidir:
  - ¿Un PDF por idioma? (probable: `downloadCvUrl` en cada `cv.<locale>.json`,
    que pasa a ser campo traducible).
  - Ubicación (`public/cv/…`), nombre de archivo, tamaño, y si abre en pestaña
    nueva o descarga.
- **Contenido real** → ver "Primer mantenimiento" (arriba).
- **Imágenes.** Formato (`.webp`/`.avif`), tamaños para `srcset` del avatar y
  de los testimonios.

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
- **Deploy.** Plataforma (Netlify, Vercel, GitHub Pages…), dominio, CI.
- **Test de contraste automatizado.** axe en jsdom no mide
  contraste; evaluar Playwright + axe en navegador real para QA automático
  en ambos temas.
- **Carga de idiomas.** Hoy ambos JSON de contenido van en el bundle (import
  estático). Si se suman idiomas o el contenido crece: `import()` dinámico por
  idioma en `content/index.ts`.
- **Aprendizajes entre tareas.** Hoy los aprendizajes viven en
  `docs/memory.md` ("Aprendizajes y errores a evitar", máximo ~50 líneas, solo
  lo edita el orchestrator al cerrar cada puerta F). Si se ve que se repiten
  errores y no alcanza, diseñar un mecanismo propio (por ejemplo, un
  `LEARNINGS.md` que el orchestrator cure con los hallazgos del reviewer, que
  no tiene permiso de escritura).

## Fuera de alcance (no reabrir sin decisión explícita)

Portfolio, Blog, página Contact, skills con porcentaje, clientes, preloader,
fondo de triángulos, fecha en testimonios, hamburguesa/drawer.
