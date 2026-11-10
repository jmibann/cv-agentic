// Claves de interfaz en español. `satisfies UiStrings` hace que una clave
// de más o de menos rompa el typecheck (foundations/i18n.md → "Textos de
// interfaz"; plan de la pieza, decisión 5: paridad solo por tipo).
import type { UiStrings } from "./ui.en";

export const uiEs = {
  skipToContent: "Saltar al contenido",
  nav: { label: "Secciones", about: "Sobre mí", resume: "Currículum" },
  controls: {
    label: "Ajustes de visualización",
    darkMode: "Modo oscuro",
    // Cambio F3 (decisión 1=a): aria-label del toggle en tema oscuro
    // (lo consume ThemeToggle en F3).
    lightMode: "Modo claro",
    language: "Idioma",
  },
  sidebar: {
    region: "Perfil",
    showContacts: "Mostrar contactos",
    hideContacts: "Ocultar contactos",
    downloadCv: "Descargar CV",
    avatarAlt: "Retrato de {name}",
    social: "Perfiles sociales",
  },
  contact: {
    email: "Correo",
    phone: "Teléfono",
    whatsapp: "WhatsApp",
    location: "Ubicación",
  },
  about: { title: "Sobre mí", services: "Qué hago", testimonials: "Testimonios" },
  resume: {
    title: "Currículum",
    education: "Educación",
    experience: "Experiencia",
    skills: "Habilidades",
  },
  // "Actualidad" lo fija foundations/i18n.md → "Fechas y períodos" (RF-8).
  timeline: { present: "Actualidad" },
  testimonials: {
    carouselLabel: "Testimonios",
    slideLabel: "{current} de {total}",
    goToSlide: "Ir a la diapositiva {n}",
    readMore: "Leer el testimonio completo de {author}",
    close: "Cerrar",
  },
} satisfies UiStrings;
