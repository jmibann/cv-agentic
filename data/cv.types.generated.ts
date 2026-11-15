/* GENERATED — do not edit. Regenerate with: npm run gen:types */

/**
 * Language of the file. Must match its name (cv.<locale>.json). Differs between files by definition (it is left out of the parity comparison).
 */
export type Locale = "en" | "es";
/**
 * Public path of the site (starts with /) or an https URL. Not translatable.
 */
export type PublicPath = string;
/**
 * Public path of the site (starts with /) or an https URL. Not translatable.
 */
export type PublicPath1 = string;
/**
 * Stable identifier, lowercase with hyphens. Not translatable.
 */
export type Id = string;
/**
 * Closed list: adding a type requires code (icon and interface label). Not translatable.
 */
export type ContactType = "email" | "phone" | "whatsapp" | "location";
/**
 * Closed list: adding a network requires code (logo in BrandIcon). Not translatable.
 */
export type SocialNetwork = "github" | "linkedin" | "x" | "instagram" | "facebook" | "dribbble" | "behance";
/**
 * Closed list of lucide-react icons: adding one requires code (Icon map). Not translatable.
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
 * Date as "YYYY" or "YYYY-MM" (year 1900–2099, month 01–12). Not translatable.
 */
export type YearMonth = string;

/**
 * CV content for one language (cv.en.json / cv.es.json). Source of truth for the format: the TypeScript types are generated from this file (data/cv.types.generated.ts). Fields marked 'Not translatable' must be identical across languages (content.test.ts checks it).
 */
export interface CvData {
  /**
   * Path to this schema, for autocompletion and validation in the editor. Not used by the app.
   */
  $schema?: string;
  locale: Locale;
  profile: Profile;
  /**
   * Sidebar contact details, in display order.
   */
  contact: ContactItem[];
  /**
   * Sidebar social links, in display order.
   */
  social: SocialLink[];
  /**
   * Cards of 'What I'm Doing' in the About panel.
   */
  services: Service[];
  /**
   * Education timeline (data order = display order).
   */
  education: TimelineEntry[];
  /**
   * Experience timeline (data order = display order).
   */
  experience: TimelineEntry[];
  /**
   * Projects timeline: personal projects, apart from work experience (data order = display order).
   */
  projects: TimelineEntry[];
  /**
   * Flat list of chips, in display order. No percentages or categories.
   */
  skills: string[];
  /**
   * Carousel testimonials (no date).
   */
  testimonials: Testimonial[];
}
export interface Profile {
  /**
   * Full name.
   */
  name: string;
  /**
   * Role shown in the Sidebar badge. E.g. "Frontend Developer".
   */
  headline: string;
  avatar: Image;
  /**
   * Paragraphs of the About panel.
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
   * Visible value. E.g. "hello@example.com", "Buenos Aires, Argentina".
   */
  value: string;
  /**
   * Link target (not translatable). If missing it is derived from the type: email → mailto:, phone → tel:, whatsapp → https://wa.me/<digits>, location → no link.
   */
  href?: string;
}
export interface SocialLink {
  id: Id;
  network: SocialNetwork;
  /**
   * Profile URL (https). Not translatable.
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
   * Degree (Education), position (Experience) or project name (Projects).
   */
  title: string;
  /**
   * Institution, company or, in Projects, the project's context.
   */
  organization: string;
  start: YearMonth;
  /**
   * End date ("YYYY" or "YYYY-MM") or null if ongoing ("Present" / "Actualidad"). Not translatable.
   */
  end: YearMonth | null;
  description: string;
}
export interface Testimonial {
  id: Id;
  /**
   * Person's name (normally the same in both languages).
   */
  author: string;
  /**
   * Author's role and company.
   */
  role: string;
  avatar: TestimonialAvatar;
  /**
   * Full text; the card shows an excerpt clamped with CSS.
   */
  text: string;
}
/**
 * Testimonial avatar: src only. It is decorative (alt="") because the name is next to it.
 */
export interface TestimonialAvatar {
  src: PublicPath;
}
