// Source of the keys: ui.es.ts must match them or `satisfies UiStrings` fails
// the type check.
export const uiEn = {
  skipToContent: "Skip to content",
  nav: { label: "Sections", about: "About", resume: "Resume" },
  controls: {
    label: "Display settings",
    darkMode: "Dark mode",
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
  resume: { title: "Resume", education: "Education", experience: "Experience", projects: "Projects", skills: "Skills" },
  timeline: { present: "Present" },
  testimonials: {
    carouselLabel: "Testimonials",
    slideLabel: "{current} of {total}",
    goToSlide: "Go to slide {n}",
    readMore: "Read full testimonial from {author}",
    close: "Close",
  },
} as const;

// Same keys as uiEn, with string values instead of the English literals.
type DeepStringify<T> = {
  [K in keyof T]: T[K] extends string ? string : DeepStringify<T[K]>;
};
export type UiStrings = DeepStringify<typeof uiEn>;
