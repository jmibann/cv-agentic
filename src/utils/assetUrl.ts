// Prefixes Vite's base to public asset paths so they resolve when the site is
// served from a sub-path (GitHub Pages). External and data URLs are left alone.
export function assetUrl(path: string): string {
  if (/^(https?:)?\/\//.test(path) || path.startsWith("data:")) return path;
  return import.meta.env.BASE_URL + path.replace(/^\//, "");
}
