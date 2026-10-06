# Tareas — Sidebar

- [ ] **T1. `getContactHref` (pura).** RF-5
  - Hecho cuando: `src/components/Sidebar/getContactHref.ts` exporta la función sin React; pasan sus tests con la tabla exacta de spec → API (explícito prioriza; `mailto`; `tel:+5411…` con `+` solo inicial y sin otros no-dígitos; tel sin dígitos → `undefined`; `wa.me` solo dígitos sin `+`; location → `undefined`); verde tras `feat(Sidebar): T1`.

- [ ] **T2. Estructura base: aside, identidad y redes.** RF-1, RF-6 (redes), RF-8
  - Hecho cuando: `getByRole("complementary", { name: labels.region })`; avatar `<img>` con `alt` de `profile.avatar.alt` **sin** atributos `width`/`height` (RF: decisión 9); nombre `<p>`; `Badge` con headline; `ul` de redes nombrada con un `li` por entrada: `<a aria-label={marca}>` externo con `target="_blank"` + `rel="noopener noreferrer"` y `BrandIcon`; la pieza no importa `useCv`/`useLocale` (inspección); verde tras `feat(Sidebar): T2`.

- [ ] **T3. Contactos: IconBox + Overhead + links derivados.** RF-5 (uso), RF-6 (mailto/tel sin target), RF-9
  - Hecho cuando: un `<li>` por contacto con `IconBox` del mapa (mail/phone/message-circle/map-pin), `Overhead` con el label traducido y el valor (`--color-heading`, ellipsis + `title`); email/phone links **sin** `target`/`rel`; whatsapp y `href` explícitos de sitio con target externo (test de atributos); location como texto plano sin link; `contact`/`social` vacíos no renderizan sus listas y sin contactos **y** sin CV no hay `Separator` (RF-9); verde tras `feat(Sidebar): T3`.

- [ ] **T4. Disclosure con CornerTab.** RF-3, RF-4
  - Hecho cuando: `CornerTab size="sm"` montada con `<button aria-expanded="false" aria-controls="sidebar-contacts">` + texto `showContacts` + chevron `Icon name="chevron-down"` decorativo; click → `aria-expanded="true"`, texto `hideContacts` y `.additional` pasa de la **clase** de colapso a visible (la visibilidad ≥ xl la da el `@media` del módulo, inspección — en jsdom el estado es por clase); segundo click revierte; el colapso no usa `style` inline (inspección: decisión RF-10); verde tras `feat(Sidebar): T4`.

- [ ] **T5. Download CV.** RF-2
  - Hecho cuando: con `profile.downloadCvUrl` existe `getByRole("link", { name: labels.downloadCv })` con ese `href` y atributo `download` (`Button href… download icon="download" fullWidth`); sin URL no existe; verde tras `feat(Sidebar): T5`.

- [ ] **T6. Estilos por tokens, responsive CSS-only y cierre a11y.** RF-7, RF-10
  - Hecho cuando: el módulo declara grilla `< md`/`md–lg`, columna xl con avatar sobresaliente (`margin-top: calc(var(--size-avatar-sidebar) * -0.71)`, fórmula compartida con `foundations/layout.md`), `--sidebar-*` tokens, redes/links con hover/foco (`--color-accent-text`, subrayado en contacto, anillo), transiciones por tokens, `@media (min-width: 1200px)` único media (layout: oculta CornerTab, fuerza `.additional`, sin literales), tramo del Separator sin acumular el `gap` de `.additional` (mecanismo documentado en comentario; Separator RF-4), cero `@media print` (RF-10: lo cubren estilos compartidos, inspección); el archivo termina con `expectNoA11yViolations` (colapsado y expandido, con `AccentGradientDefs` de armazón); `index.ts` re-exporta `Sidebar`, tipos y `getContactHref`; lint + typecheck + test verdes tras `feat(Sidebar): T6`.
