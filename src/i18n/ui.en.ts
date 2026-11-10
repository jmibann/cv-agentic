// Claves de interfaz en inglés — fuente de las claves y de UiStrings
// (foundations/i18n.md → "Textos de interfaz"). No se agregan claves aquí
// sin actualizar ui.es.ts: `satisfies UiStrings` rompe el typecheck.
export const uiEn = {
  skipToContent: "Skip to content",
  nav: { label: "Sections", about: "About", resume: "Resume" },
  controls: {
    label: "Display settings",
    darkMode: "Dark mode",
    // Cambio F3 (decisión 1=a): aria-label del toggle en tema oscuro
    // (lo consume ThemeToggle en F3).
    lightMode: "Light mode",
    language: "Language",
  },
  sidebar: {
    region: "Profile",
    showContacts: "Show Contacts",
    hideContacts: "Hide Contacts",
    downloadCv: "Download CV",
    avatarAlt: "Portrait of {name}",
    social: "Social profiles",
  },
  contact: { email: "Email", phone: "Phone", whatsapp: "WhatsApp", location: "Location" },
  about: { title: "About Me", services: "What I'm Doing", testimonials: "Testimonials" },
  resume: { title: "Resume", education: "Education", experience: "Experience", skills: "Skills" },
  timeline: { present: "Present" },
  testimonials: {
    carouselLabel: "Testimonials",
    slideLabel: "{current} of {total}",
    goToSlide: "Go to slide {n}",
    readMore: "Read full testimonial from {author}",
    close: "Close",
  },
} as const;

// Mismas claves que uiEn, pero con valores string (no los literales en inglés)
type DeepStringify<T> = {
  [K in keyof T]: T[K] extends string ? string : DeepStringify<T[K]>;
};
export type UiStrings = DeepStringify<typeof uiEn>;
