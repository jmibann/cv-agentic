# AppLayout
Estado: implementada

## Propósito

Compone la página completa: skip link, ControlsBar, Sidebar, card de
contenido con NavTabs y el panel activo (AboutPage / ResumePage). Es el único
lugar que conecta **contenido** (`useCv`), **textos** (`useLocale`) y
**navegación** (`useHashTab`).

## Requisitos (EARS)

- RF-1: EL SISTEMA renderiza los landmarks `banner`, `complementary` y `main` (roles de los elementos `<header>`/`<aside>`/`<main>`). El documento contiene dos `h1` (el del panel activo y el del panel inactivo bajo `hidden`); la unicidad "visible por vez" se verifica con `getAllByRole("heading", { level: 1 })` de longitud 1: RTL y axe excluyen el subárbol oculto.
- RF-2: AL MONTAR, si el hash no corresponde a un tab, EL SISTEMA activa `about`; si `location.hash` es `#resume` antes de montar, arranca en Resume. Un hash inválido posterior mantiene el tab activo (lo gobierna `useHashTab` RF-3).
- RF-3: CUANDO el usuario cambia de tab, ENTONCES EL SISTEMA renderiza la página correspondiente en el tabpanel, actualiza `aria-labelledby` y sincroniza la URL con `history.replaceState` sin agregar historial.
- RF-4: CUANDO el usuario activa el skip link, ENTONCES EL SISTEMA mueve el foco al tabpanel sin modificar el hash de la URL.
- RF-5: EL SISTEMA mantiene la lista de tabs siempre con los dos ids de `TAB_IDS`, en ese orden, de modo que `aria-labelledby` del tabpanel nunca apunte a un tab inexistente.
- RF-6: EL SISTEMA monta `AccentGradientDefs` y `HexAvatarDefs` exactamente una vez en el documento.
- RF-7: EL SISTEMA se re-renderiza al cambiar el idioma (tabs, títulos y contenido, sin recargar) y presenta `data-theme` en `<html>` al cambiar el tema: ambas conductas las fijan los providers, que viven por encima de AppLayout; esta pieza no implementa nada del tema. El RF verifica el camino integrado (tests 5 y 6).
- RF-8: EL SISTEMA monta cada página exactamente una vez: la activa en el tabpanel (`data-print-page={active}`) y la inactiva en un bloque hermano con `hidden`, fuera del tabpanel (`data-print-only` + `data-print-page={inactiva}`). Ambos bloques cuelgan de una raíz común `data-print-stack`. En `@media print` se apilan **siempre en orden About → Resume, con independencia del tab activo** (reglas en `src/styles/global.css`, ver "Impresión"). Verificación: estructura y unicidad de `h1` en jsdom (test 12); reglas de impresión por inspección del CSS y QA F5.
- RF-9: CUANDO el usuario cambia de tab, ENTONCES EL SISTEMA entra el contenido del tabpanel con `opacity 0→1` y `translateX(±10px)→0` según la dirección (About→Resume desde la derecha; Resume→About desde la izquierda), con `--duration-slow` y `--ease-enter` y `animation-fill-mode: backwards`. El wrapper de entrada se remonta con `key={active}` — eso reinicia **la animación** de la entrada; el reset del estado interno de la página entre tabs (carrusel en 0, dialog cerrado) es comportamiento **preexistente** del intercambio de tipos `AboutPage`↔`ResumePage` que el `key` no altera. En el render inicial NO hay animación (el atributo de dirección no se renderiza sin cambio de tab). El foco, el `role="tabpanel"` y `aria-labelledby` no cambian. Con `prefers-reduced-motion: reduce` el cambio es instantáneo (colapso de `--duration-slow` a 0.01ms); en impresión no hay animación. Verificación: tests 13–17; reduced motion, print y flujo del `h1` junto a la solapa flotante ≥ 992px, por QA del reviewer con la app servida (#91) al cerrar el Cambio.

## Anatomía

Ver `foundations/layout.md` (estructura del documento y grilla por breakpoint).

```tsx
// Constante del módulo: orden e ids fijos de los tabs (nunca vacía)
const TAB_IDS = ["about", "resume"] as const;
type TabId = (typeof TAB_IDS)[number];

// Guard de estrechamiento (no exportado): frontera de tipos con NavTabs,
// que fija onChange: (id: string) => void. Sin casts (regla de specs/README.md).
const isTabId = (id: string): id is TabId =>
  (TAB_IDS as readonly string[]).includes(id);

// Dentro del componente
const { t } = useLocale();
const cv = useCv();
const [active, setActive] = useHashTab(TAB_IDS, "about");

// Dirección de entrada (RF-9): patrón oficial de React "ajuste de estado al
// cambiar una prop/estado" (setState condicional durante el render del PROPIO
// componente; no es un efecto). Prohibido leer/escribir refs durante el render
// (react-hooks/refs con recommended-latest, eslint.config.js:25). La dirección
// SOLO se recalcula cuando cambia `active`: un re-render ajeno (idioma, tema)
// conserva el valor y no corta la animación en curso.
const [prevActive, setPrevActive] = useState(active);
const [direction, setDirection] = useState<MotionDirection | null>(null);
if (active !== prevActive) {
  setPrevActive(active);
  setDirection(getTabDirection(TAB_IDS.indexOf(prevActive), TAB_IDS.indexOf(active)));
}

const tabs = [
  { id: "about", label: t.nav.about },
  { id: "resume", label: t.nav.resume },
] as const;
const sidebarLabels: SidebarLabels = {
  region: t.sidebar.region,
  social: t.sidebar.social,
  showContacts: t.sidebar.showContacts,
  hideContacts: t.sidebar.hideContacts,
  downloadCv: t.sidebar.downloadCv,
  avatarAlt: format(t.sidebar.avatarAlt, { name: cv.profile.name }),
  contact: t.contact,             // { email, phone, whatsapp, location }
};

return (
<>
  <AccentGradientDefs />
  <HexAvatarDefs />
  <a className={styles.skipLink} data-print-hide href="#main-panel" onClick={focusPanel}>{t.skipToContent}</a>
  <div className={styles.container}>
    <ControlsBar />
    <div className={styles.grid}>
      <Sidebar className={styles.aside} profile={cv.profile} contact={cv.contact} social={cv.social} labels={sidebarLabels} />
      <main className={styles.main}>
        <Box variant="outer" as="section" className={styles.contentCard}>
          <NavTabs items={tabs} activeId={active} onChange={(id) => { if (isTabId(id)) setActive(id); }} panelId="main-panel" label={t.nav.label} />
          <div data-print-stack>                                 {/* raíz del stack de impresión; sin clase propia (los nombres de módulo se hashean y global.css no puede apuntarlos) */}
            <div ref={panelRef} role="tabpanel" id="main-panel" aria-labelledby={getTabId(active)} tabIndex={0} data-print-page={active} className={styles.panel}>
              <div data-motion-panel key={active} {...(direction ? { "data-motion-direction": direction } : {})} className={styles.motionPanel}>
                {active === "about" ? <AboutPage /> : <ResumePage />}
              </div>
            </div>
            <div data-print-only data-print-page={active === "about" ? "resume" : "about"} hidden>   {/* panel inactivo preparado para impresión; ver "Impresión" */}
              {active === "about" ? <ResumePage /> : <AboutPage />}
            </div>
          </div>
        </Box>
      </main>
    </div>
  </div>
</>
);
```

- **Tabs (invariante):** la lista tiene siempre los 2 tabs de `TAB_IDS`, en
  ese orden; los labels salen de `t.nav`. Como nunca es vacía, el
  `aria-labelledby` del tabpanel siempre apunta a un tab existente (el caso
  "NavTabs con `items` vacío → `null`" solo aplica a NavTabs aislado).
- **Labels del Sidebar:** mapeo explícito de `t.sidebar.*` y `t.contact`
  (arriba). Todas las claves de UI de `foundations/i18n.md` quedan usadas.
  `avatarAlt` se compone acá con `format(t.sidebar.avatarAlt, { name: cv.profile.name })`:
  el alt del avatar sigue al `profile.name` de cada idioma y el Sidebar no
  compone textos (RF-8 de su spec).
- **Skip link sin tocar la URL:** `focusPanel` hace `event.preventDefault()`
  y `panelRef.current?.focus()`. El `href="#main-panel"` queda como respaldo
  sin JS. Así el hash conserva `#about` / `#resume` y el link compartible no
  se pierde.
- **Frontera de tipos con NavTabs:** NavTabs implementada fija
  `onChange: (id: string) => void`; `setActive` exige `TabId`. El estrechamiento
  es de AppLayout con el guard de módulo `isTabId` (no exportado): NavTabs no
  se toca y no hay casts.
- **Panel inactivo montado una sola vez:** no hay copias adicionales de las
  páginas; los ids que generan (`about-services-title`,
  `resume-education-title`, ítems de Timeline, etc.) nunca se duplican en el
  documento (RF-8).
- **`getTabDirection` (nueva, pura):** vive en **`src/lib/tabDirection.ts`**
  (`.ts`: no toca `allowExportNames` de react-refresh, #96/#100; dueño:
  integrator). Firma `getTabDirection(prev: number | null, next: number):
  "from-left" | "from-right" | null` — `null` si no hay índice previo (primer
  render) o si los índices coinciden. `MotionDirection` es el tipo del unión de
  las dos cuerdas, exportado desde el mismo archivo.
- **`key` en el wrapper, no en el tabpanel ni en NavTabs ni en las páginas:**
  remonta solo el nodo del wrapper; el tabpanel conserva el foco y los atributos.
- **El reset de estado entre tabs NO lo produce el `key`:** hoy la página
  activa y la inactiva ya intercambian tipos de componente en cada posición
  (`AppLayout.tsx:200/:205`), y React ya desmonta/remonta ambas; el carrusel
  vuelve a 0 y el dialog se cierra desde F4. El `key` solo reinicia la
  animación en el nodo wrapper.
- El wrapper **no tiene `role`, `tabIndex` ni texto propio**: el árbol de
  accesibilidad es idéntico antes, durante y después de la animación.

## API

```ts
export interface AppLayoutProps {
  className?: string;
}
```

`className` se aplica al `div.container` de la Anatomía (la raíz del componente
es un fragment; el lugar de la unión es deliberado, no un accidente).

Requiere `ThemeProvider` y `LocaleProvider` por encima (los monta `main.tsx`).

## Páginas

`AboutPage` y `ResumePage` (en `src/pages/`) tienen spec propia:

- [specs/pages/AboutPage/spec.md](../../pages/AboutPage/spec.md)
- [specs/pages/ResumePage/spec.md](../../pages/ResumePage/spec.md)

AppLayout solo decide cuál renderizar en el tabpanel según el tab activo
(`useHashTab`, spec en [specs/hooks/useHashTab/spec.md](../../hooks/useHashTab/spec.md)).

## Estilos y tokens

- Contenedor, gutter, grilla, sticky: según `foundations/layout.md`.
- **Header del panel y CornerTab:**
  - **< lg**: la tab está en absoluto sobre la esquina y `.panel` tiene
    `padding-top: calc(var(--size-nav-tab-height) - var(--box-padding) + var(--space-4))`
    para que el `h1` quede debajo de la tab (fórmula única; A2 de diagnostics).
  - **≥ lg**: NavTabs usa `CornerTab placement="float"`: la tab flota a la
    derecha y el `h1` fluye a su izquierda con el ancho **real** de la tab
    (sin reservas fijas ni números mágicos). `.panel` vuelve a
    `padding-top: 0` en `@media (min-width: 992px)` (cambio de layout).
  - Para que el flujo funcione, `.panel` y el contenedor raíz de cada página
    **no** pueden ser flex/grid ni tener `overflow` distinto de `visible`
    (ver `specs/pages/*.md` → "Estilos y tokens").
- **Skip link:** visualmente oculto hasta recibir foco; con foco aparece
  arriba a la izquierda con fondo `--color-surface`, texto `--color-accent-text`,
  radio `--radius-8`, `--shadow-control`, `z-index: var(--z-skip)` (30: por
  encima de `--z-controls` —el token es nuevo en `tokens.css`, decisión de
  Clarificación F4—; el skip link enfocado debe ganar el apilamiento siempre,
  y `--z-controls` documenta específicamente la capa de ControlsBar) y **con el
  anillo estándar del kit** (`--focus-ring-*` en `:focus`; Cambio F5, hallazgo
  D2: el botón era enfocable vía `:focus` programático/click y el `:focus-visible`
  no lo garantiza siempre — regla dura 7 de `docs/DESIGN.md`: un único anillo.
  Verificación: inspección del CSS + QA F5).
- Foco del tabpanel: anillo estándar (`--focus-ring-*`) solo con `:focus-visible`.
- **Entrada de panel (RF-9), todo en `AppLayout.module.css`:**
  - `.motionPanel[data-motion-direction="from-left"]` **(0,2,0)**:
    `--panel-enter-x: -10px`; `.motionPanel[data-motion-direction="from-right"]`
    **(0,2,0)**: `--panel-enter-x: 10px`. El atributo **solo define la
    variable**; no declara `animation`. Los selectores van acotados por la
    clase: un selector de atributo suelto en un CSS Module es global
    (precedente `.contacts p`). Una variable no es una `transition`: #116 se
    cumple.
  - Un único `@keyframes panel-enter`: `from { opacity: 0;
    transform: translateX(var(--panel-enter-x)) }` → `to { opacity: 1;
    transform: translateX(0) }`.
  - `.motionPanel[data-motion-direction]` **(0,2,0)**:
    `animation: panel-enter var(--duration-slow) var(--ease-enter) backwards`.
    La animación **solo corre con el atributo presente** (nada anima en el
    primer render). `backwards` —no `both`—: no deja `transform` permanente ni
    contexto de apilamiento extra.
  - **Sin `transition`** en ninguna regla del wrapper: #116 rige transiciones y
    acá no hay ninguna (las reglas (0,2,0) existentes son de `animation` y de
    definición de variable).
  - `10px` es un literal fijado por la spec (como las medidas de
    `docs/tokens/breakpoints.md`); no cambia por breakpoint.
  - **Impresión:** `@media print { .motionPanel[data-motion-direction] {
    animation: none } }` **(0,2,0), ubicada después de la regla de `animation`
    dentro del módulo**: gana por orden. NO va en `global.css`: se importa en
    `main.tsx` antes que los módulos y empataría en especificidad con la del
    módulo, que ganaría (mismo patrón que `.social a` en la etapa 1).

## Estados

| Estado | Efecto |
|---|---|
| Tab activo `about` / `resume` | el tabpanel renderiza AboutPage / ResumePage; la otra queda montada en el bloque hermano `hidden` (`data-print-only`) |
| Cambio de tab | el wrapper `data-motion-panel` se remonta (`key={active}`) y anima la entrada según `data-motion-direction` (`from-right` About→Resume, `from-left` Resume→About) |
| Render inicial | el wrapper existe y **no** lleva `data-motion-direction`: sin animación |
| Skip link sin foco | visualmente oculto |
| Skip link con foco | visible arriba a la izquierda |
| Tabpanel con foco (teclado) | anillo estándar |

## Responsive

| Viewport | Layout |
|---|---|
| < lg | Una columna: ControlsBar, Sidebar, card de contenido. Tab en absoluto; `h1` debajo (padding-top de `.panel`). |
| lg (992–1199) | Una columna; tab flotante con el `h1` a su lado. |
| ≥ xl (1200) | Grilla sidebar 3/12 + contenido 9/12. Sidebar **sticky solo si el alto de la pantalla es ≥ 900px** (si no, scrollea con la página). Ver `foundations/layout.md`. |

## Impresión

El contrato de impresión habla en `data-*`, no en clases de CSS Modules (los
nombres de módulo se hashean y `global.css` no puede apuntarlos):

- Cada página se monta **una sola vez** en el documento: la activa en el
  tabpanel (`data-print-page={active}`) y la inactiva en el bloque hermano
  (`data-print-only` + `data-print-page={inactiva}`, con `hidden`: fuera del
  árbol de accesibilidad y no visible en pantalla). Sin ids duplicados.
- Orden impreso **siempre About → Resume, con independencia del tab activo**:
  en `@media print`, `[data-print-stack]` es `flex` en columna y el `order`
  sale del `data-print-page` (`about: 0`, `resume: 1`).
- El bloque inactivo se muestra en print: `[data-print-only] { display: block }`
  (regla de autor: gana al `display: none` del atributo `hidden`).
- Todos los `@media print` transversales viven en `src/styles/global.css`
  (regla dura 3 de `docs/DESIGN.md`); la paleta de impresión ya la reasigna
  `tokens/tokens.css`. Ninguna pieza F2/F3 se edita. **Excepción de RF-9:** la
  anulación de la animación de entrada vive en `AppLayout.module.css` porque su
  portador es una clase hasheada del propio módulo (ver "Estilos y tokens").
- Los selectores para ocultar piezas de otras piezas son **deliberados y forman parte del contrato**. **Actualización del Cambio F5 2026-10-08** (hallazgos B-2/B-3/M-1 de `docs/qa-report.md`): los nativos `header`, `[role="tablist"]` y `aside button` **perdían por especificidad** contra las clases hasheadas de los CSS Modules (los controles y el botón se imprimían; la solapa quedaba como franja vacía). El contrato pasa a **hooks `data-print-hide`** en las raíces de las piezas (attribute (0,1,0) + elemento (0,1,1) gana siempre a la clase): `global.css` oculta `header[data-print-hide]` (ControlsBar), `div[data-print-hide]` (CornerTab — la tab entera, contenido y fondo) y `button[data-print-hide]` (disclosure del Sidebar), además de `[data-print-hide]` del skip link (este ya funcionaba: el módulo no le fija `display`) y `aside [download]` (el CTA Download CV, `<a>` polimórfico de `Button`: el atributo `download` es el hook nativo, estable y único del CTA — deliberado). Las piezas afectadas renderizan el atributo según sus specs (Cambios en ControlsBar RF-6, CornerTab RF-7, Sidebar RF-4/RF-10). `[role="tablist"]` se conserva en el bloque como **redundancia defensiva** (su portador cuelga hoy de `div[data-print-hide]`; decisión de builder autorizada por T7). `TestimonialDialog` y `TestimonialCarousel` ya resuelven su impresión en sus propios módulos (excepción documentada G-D-1).
- La expansión forzada de contactos de Sidebar y el resto de la lista de
  `foundations/layout.md` → "Impresión" las implementa el integrator en la
  tarea de impresión de F4 y las verifica **QA F5** con la app servida
  (decisión #91): F4 fija el contrato, F5 verifica el resultado real.

## Accesibilidad

- Landmarks: `header` (ControlsBar), `aside` (Sidebar), `main`.
- Un solo `h1` visible por vez: el documento tiene dos (activo + inactivo en
  `hidden`); se verifica con `getAllByRole("heading", { level: 1 })` de
  longitud 1 (RTL y axe excluyen el subárbol oculto).
- Skip link apunta a `#main-panel`, es el primer elemento enfocable y mueve el foco al tabpanel sin cambiar el hash.
- `AccentGradientDefs` y `HexAvatarDefs` montados **una sola vez**.
- Al cambiar de idioma, `<html lang>` cambia (lo hace el provider) y todo el
  contenido se re-renderiza en el nuevo idioma sin recargar.
- El wrapper de entrada es un `div` de bloque neutro (sin `role` ni foco): el
  tabpanel sigue siendo la única superficie enfocable del panel.

## Tests esperados

1. Renderiza los landmarks `banner`, `complementary` y `main`, con `getAllByRole("banner")` de longitud 1 (unicidad delegada por ControlsBar RF-2; el `<header>` de ControlsBar es el único del documento).
2. El tab inicial es `about` (sin hash) y el panel muestra el `h1` de About.
3. Con `location.hash = "#resume"` antes de montar, arranca en Resume.
4. Click en el tab Resume → el panel muestra el `h1` de Resume, `aria-labelledby` del panel = `tab-resume`, y `history.replaceState` fue llamado con `#resume`.
5. Cambiar el idioma a `es` → los tabs, títulos y contenido pasan al español (verificar un texto de `ui.es` y uno de `cv.es`).
6. Cambiar el tema → `data-theme="dark"` en `<html>`.
7. Existe exactamente un `linearGradient#accent-gradient`, un `clipPath#hex-avatar-outer` y un `clipPath#hex-avatar-inner` en el documento.
8. El primer elemento enfocable es el skip link con `href="#main-panel"`; al activarlo, el foco pasa al tabpanel y `location.hash` **no** cambia.
9. No hay ningún elemento con `id="about"` ni `id="resume"`.
10. `expectNoA11yViolations` sin violaciones en About y en Resume, en ambos idiomas.
11. El tablist contiene exactamente dos tabs en orden About→Resume y el `aria-labelledby` del tabpanel coincide con el `id` del tab activo, antes y después de cambiar de tab (RF-5).
12. Con tab activo `about`: la página Resume está montada con `hidden` fuera del tabpanel (bloque `data-print-only`, `data-print-page="resume"`) y `getAllByRole("heading", { level: 1 })` es de longitud 1; simétrico con `resume` (RF-1 criterio, RF-8 capa DOM; las reglas `@media print` se verifican por inspección del CSS y en QA F5).
13. Click About→Resume: el wrapper lleva `data-motion-panel` y `data-motion-direction="from-right"`; Resume→About: `"from-left"`. Dos clicks rápidos: el atributo final es coherente con el tab alcanzado y el nodo wrapper anterior **ya no está en el documento** (prueba del `key`).
14. **NO REGRESIÓN (verde on-arrival, régimen #101):** avanzo el carrusel de About, voy a Resume y vuelvo → el carrusel está en el índice 0. Verifica el comportamiento preexistente del intercambio de páginas; **no** prueba el `key` (esa es la segunda parte del test 13).
15. `getTabDirection` pura (`src/lib/tabDirection.ts`): `(0, 1)` → `"from-right"`; `(1, 0)` → `"from-left"`; `(null, 0)` → `null` (primer render); `(0, 0)` → `null` (mismo índice).
16. Render inicial: el wrapper existe y **no** tiene `data-motion-direction`. Tras un cambio de tab, un re-render por **cambio de idioma** conserva el valor de `data-motion-direction` (la dirección no se recalcula fuera del cambio de tab y no corta la animación).
17. El cierre `expectNoA11yViolations` (test 10) sigue presente y cubre el markup nuevo.

## No hacer

- No dejar la lista de tabs vacía ni cambiar su orden: siempre los dos de `TAB_IDS`.
- No cambiar el hash al activar el skip link: `preventDefault` y foco al tabpanel.
- No montar `AccentGradientDefs` ni `HexAvatarDefs` más de una vez.
- No dar `id="about"` ni `id="resume"` a ningún elemento.
- No hacer `.panel` (ni el raíz de las páginas) flex/grid ni con `overflow` distinto de `visible`: rompe el flujo del `h1` junto a la tab flotante.
- No reservar el espacio de la tab con números mágicos: fórmula única con tokens (< lg) y ancho real de la tab (≥ lg).
- No poner el `key` ni la animación en el tabpanel, NavTabs o las páginas: romperían foco/ARIA o duplicarían animaciones.
- No animar en el render inicial: la `animation` solo se declara con `data-motion-direction` presente.
- No usar `fill-mode: both` (dejaría `transform` permanente y crearía contexto de apilamiento): usar `backwards`.
- No usar `flushSync` ni la API de View Transitions.
- No dar al wrapper `role`, `tabIndex` ni texto propio.
- No poner ninguna `transition` en selectores de especificidad (0,2,0) o mayor (#116); en este Cambio no hay transición alguna.
