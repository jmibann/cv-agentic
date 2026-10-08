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
              {active === "about" ? <AboutPage /> : <ResumePage />}
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
  radio `--radius-8`, `--shadow-control` y `z-index: var(--z-skip)` (30: por
  encima de `--z-controls` —el token es nuevo en `tokens.css`, decisión de
  Clarificación F4—; el skip link enfocado debe ganar el apilamiento siempre,
  y `--z-controls` documenta específicamente la capa de ControlsBar).
- Foco del tabpanel: anillo estándar (`--focus-ring-*`) solo con `:focus-visible`.

## Estados

| Estado | Efecto |
|---|---|
| Tab activo `about` / `resume` | el tabpanel renderiza AboutPage / ResumePage; la otra queda montada en el bloque hermano `hidden` (`data-print-only`) |
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
  `tokens/tokens.css`. Ninguna pieza F2/F3 se edita.
- Los selectores de elemento/rol nativo para ocultar piezas ya implementadas
  son **deliberados y forman parte del contrato**, no accidentes de
  estructura: `header` (ControlsBar: único `<header>` del documento),
  `[role="tablist"]` (NavTabs/CornerTab), `aside button` (Show Contacts /
  Download CV de Sidebar). El skip link se oculta con `[data-print-hide]` en
  su raíz. `TestimonialDialog` y `TestimonialCarousel` ya resuelven su
  impresión en sus propios módulos (excepción documentada G-D-1).
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

## No hacer

- No dejar la lista de tabs vacía ni cambiar su orden: siempre los dos de `TAB_IDS`.
- No cambiar el hash al activar el skip link: `preventDefault` y foco al tabpanel.
- No montar `AccentGradientDefs` ni `HexAvatarDefs` más de una vez.
- No dar `id="about"` ni `id="resume"` a ningún elemento.
- No hacer `.panel` (ni el raíz de las páginas) flex/grid ni con `overflow` distinto de `visible`: rompe el flujo del `h1` junto a la tab flotante.
- No reservar el espacio de la tab con números mágicos: fórmula única con tokens (< lg) y ancho real de la tab (≥ lg).
