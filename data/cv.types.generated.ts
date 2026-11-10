/* GENERADO — no editar. Regenerar con: npm run gen:types */

/**
 * Idioma del archivo. Debe coincidir con el nombre (cv.<locale>.json). Difiere entre archivos por definición (no entra en la comparación de paridad).
 */
export type Locale = "en" | "es";
/**
 * Ruta pública del sitio (empieza con /) o URL https. No traducible.
 */
export type PublicPath = string;
/**
 * Ruta pública del sitio (empieza con /) o URL https. No traducible.
 */
export type PublicPath1 = string;
/**
 * Identificador estable, en minúsculas con guiones. No traducible.
 */
export type Id = string;
/**
 * Lista cerrada: agregar un tipo exige código (ícono y label de interfaz). No traducible.
 */
export type ContactType = "email" | "phone" | "whatsapp" | "location";
/**
 * Lista cerrada: agregar una red exige código (logo en BrandIcon). No traducible.
 */
export type SocialNetwork = "github" | "linkedin" | "x" | "instagram" | "facebook" | "dribbble" | "behance";
/**
 * Lista cerrada de íconos de lucide-react: agregar uno exige código (mapa de Icon). No traducible.
 */
export type ServiceIcon =
  | "code"
  | "layout"
  | "palette"
  | "smartphone"
  | "server"
  | "database"
  | "cloud"
  | "pen-tool"
  | "camera"
  | "megaphone"
  | "gauge"
  | "shield";
/**
 * Fecha "YYYY" o "YYYY-MM" (año 1900–2099, mes 01–12). No traducible.
 */
export type YearMonth = string;

/**
 * Contenido del CV para un idioma (cv.en.json / cv.es.json). Fuente de verdad del formato: los tipos TS se generan desde este archivo (data/cv.types.generated.ts). Los campos 'No traducible' deben ser idénticos entre idiomas (lo verifica content.test.ts).
 */
export interface CvData {
  /**
   * Ruta a este esquema, para autocompletado y validación en el editor. No se usa en la app.
   */
  $schema?: string;
  locale: Locale;
  profile: Profile;
  /**
   * Datos de contacto del Sidebar, en el orden en que se muestran.
   */
  contact: ContactItem[];
  /**
   * Redes sociales del Sidebar, en el orden en que se muestran.
   */
  social: SocialLink[];
  /**
   * Tarjetas de 'What I'm Doing' en el panel About.
   */
  services: Service[];
  /**
   * Timeline de Education (orden de los datos = orden en pantalla).
   */
  education: TimelineEntry[];
  /**
   * Timeline de Experience (orden de los datos = orden en pantalla).
   */
  experience: TimelineEntry[];
  /**
   * Lista plana de chips, en el orden en que se muestran. Sin porcentajes ni categorías.
   */
  skills: string[];
  /**
   * Testimonios del carrusel (sin fecha).
   */
  testimonials: Testimonial[];
}
export interface Profile {
  /**
   * Nombre completo.
   */
  name: string;
  /**
   * Rol que se muestra en el Badge del Sidebar. Ej: "Frontend Developer".
   */
  headline: string;
  avatar: Image;
  /**
   * Párrafos del panel About.
   */
  about: string[];
  downloadCvUrl?: PublicPath1;
}
export interface Image {
  src: PublicPath;
}
export interface ContactItem {
  id: Id;
  type: ContactType;
  /**
   * Valor visible. Ej: "hello@example.com", "Buenos Aires, Argentina".
   */
  value: string;
  /**
   * Destino del link (no traducible). Si falta se deriva del tipo: email → mailto:, phone → tel:, whatsapp → https://wa.me/<dígitos>, location → sin link.
   */
  href?: string;
}
export interface SocialLink {
  id: Id;
  network: SocialNetwork;
  /**
   * URL del perfil (https). No traducible.
   */
  url: string;
}
export interface Service {
  id: Id;
  title: string;
  description: string;
  icon: ServiceIcon;
}
export interface TimelineEntry {
  id: Id;
  /**
   * Carrera (Education) o puesto (Experience).
   */
  title: string;
  /**
   * Institución o empresa.
   */
  organization: string;
  start: YearMonth;
  /**
   * Fecha de fin ("YYYY" o "YYYY-MM") o null si es la actualidad ("Present" / "Actualidad"). No traducible.
   */
  end: YearMonth | null;
  description: string;
}
export interface Testimonial {
  id: Id;
  /**
   * Nombre propio (normalmente igual en ambos idiomas).
   */
  author: string;
  /**
   * Rol y empresa del autor.
   */
  role: string;
  avatar: TestimonialAvatar;
  /**
   * Texto completo; la card muestra un extracto recortado por CSS.
   */
  text: string;
}
/**
 * Avatar de testimonio: solo src. Es decorativo (alt="") porque el nombre está al lado.
 */
export interface TestimonialAvatar {
  src: PublicPath;
}
