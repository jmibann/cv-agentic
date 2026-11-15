import type { UiStrings } from "./ui.en";

export const uiEs = {
  skipToContent: "Saltar al contenido",
  nav: { label: "Secciones", about: "Sobre mí", resume: "Currículum" },
  controls: {
    label: "Ajustes de visualización",
    darkMode: "Modo oscuro",
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
    projects: "Proyectos",
    skills: "Habilidades",
  },
  timeline: { present: "Actualidad" },
  testimonials: {
    carouselLabel: "Testimonios",
    slideLabel: "{current} de {total}",
    goToSlide: "Ir a la diapositiva {n}",
    readMore: "Leer el testimonio completo de {author}",
    close: "Cerrar",
  },
} satisfies UiStrings;
