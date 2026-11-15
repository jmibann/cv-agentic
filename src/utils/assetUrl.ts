// Antepone el `base` de Vite a rutas de assets de /public.
// "/images/avatar.webp" → "/cv-agentic/images/avatar.webp" en GitHub Pages,
// y queda igual en local o en Vercel (base "/").
// Las URLs externas (http, //, data:) no se tocan.
export function assetUrl(path: string): string {
  if (/^(https?:)?\/\//.test(path) || path.startsWith("data:")) return path;
  return import.meta.env.BASE_URL + path.replace(/^\//, "");
}