// AppLayout — composición de la página completa (specs/layout/AppLayout/spec.md).
// Único lugar que conecta contenido (`useCv`), textos (`useLocale`) y
// navegación (`useHashTab`). T1 (RF-1, RF-6): Anatomía literal completa — defs
// compartidas montadas UNA vez (`AccentGradientDefs` + `HexAvatarDefs`), skip
// link con `data-print-hide` (contrato "Impresión": el atributo, no la clase,
// porque global.css no puede apuntar nombres hasheados), `div.container` que
// recibe la `className` del consumidor (G-B; la raíz del componente es un
// fragment — decisión A7 de la Clarificación: el lugar de la unión es
// deliberado), `ControlsBar` (banner único), `div.grid` con `Sidebar`
// (`profile`/`contact`/`social` de `useCv()` + `sidebarLabels` mapeadas de
// `t.sidebar.*` + `t.contact` — spec → Anatomía, todas las claves de UI quedan
// usadas) y `main > Box outer as="section" > NavTabs + div[data-print-stack]`:
// el tabpanel `#main-panel` con la página ACTIVA (`data-print-page={active}`)
// y el bloque hermano `data-print-only` + `hidden` con la INACTIVA
// (`data-print-page={inactiva}`) — RF-8 capa DOM: cada página montada UNA vez,
// sin ids duplicados; las reglas `@media print` viven en global.css (T5).
// El cableado de navegación EXISTE ya en T1 (`useHashTab(TAB_IDS, "about")`
// dirige qué se monta; `history`/hash y el tablist se verifican en T2 con sus
// tests; el handler del skip link se escribe acá y su test es T3): `NavTabs`
// recibe la lista SIEMPRE no-vacía de los 2 ids de `TAB_IDS` en orden About→
// Resume (RF-5) con `onChange` estrechado por el guard de módulo `isTabId`
// (A1: sin casts, NavTabs intacta con su firma `onChange: (id: string)`) y
// `aria-labelledby={getTabId(active)}` del panel apuntando siempre a un tab
// existente.
// T5 hecha: `AppLayout.module.css` declara el layout de foundations/layout.md
// y la tabla "Estilos y tokens" de la spec AL PIE (contenedor/gutter con la
// fórmula `padding-top: calc(--gutter-top - --size-control - --space-4)` y el
// `margin-bottom: --space-4` aplicado al `<header>` hijo (el padre posiciona;
// su propio módulo declara cero margen); `.grid` una columna con
// `gap: --stack-gap` < 1200 → grid 3/9 con la fórmula EXACTA de foundations ≥
// 1200; sticky `.aside` solo `@media (min-width: 1200px) and (min-height:
// 900px)` con `top: calc(--size-avatar-sidebar * 0.71 + --space-7)` y
// `--z-sticky`; `.panel` con la ÚNICA fórmula de la solapa < lg y `padding-
// top: 0` en `@media (min-width: 992px)` — sin flex/grid/overflow en la cadena
// del h1 (no-BFC); skip link oculto por `clip-path` (jamás `display:none`:
// debe seguir siendo primer enfocable, test 8) → visible con `:focus` arriba
// a la izquierda con `--color-surface`/`--color-accent-text`/`--radius-8`/
// `--shadow-control`/`--z-skip`; tabpanel con anillo `--focus-ring-*` solo
// `:focus-visible`). Los LITERALES de T1 se reemplazaron por `styles.*` sin
// cambiar la estructura (menor registrada en la aprobación de T1) y la unión
// del container pasó a base `styles.container` (su test: el de unión #99 del
// archivo de tests, T5). El print transversal del contrato vive en
// `src/styles/global.css` (T5; la paleta la reasigna tokens.css). `index.ts`
// re-exporta la superficie pública (AppLayout + AppLayoutProps).
// Diferido: T6 (reemplazo de `App.tsx`) NO se toca: aprobación pendiente del
// usuario.
// T11 hecha (Cambio motion 2, RF-9, tests 13/16): dentro del tabpanel, la
// página activa viaja envuelta en el `div[data-motion-panel]` de la Anatomía —
// `key={active}` SOLO en el wrapper (P4: ni en el panel ni en las páginas, que
// romperían foco/ARIA) y `data-motion-direction` renderizado ÚNICAMENTE cuando
// la dirección no es `null` (P5 en capa markup: el render inicial no lleva
// atributo → sin animación; la `animation` se declara en T12 sobre el
// atributo). La dirección se fija con el patrón oficial de React "ajuste de
// estado al cambiar una prop/estado" (P1): `useState` + `setState` condicional
// EN RENDER del propio componente — no es un efecto, no lee ni escribe refs en
// render (`react-hooks/refs`), no usa `flushSync` ni View Transitions (spec →
// No hacer) — recalculando con la función pura `getTabDirection` (T10) sobre
// los índices en `TAB_IDS`; un re-render ajeno (idioma, tema) NO la recalcula
// y conserva el valor (test 16: la animación en curso no se corta). El bloque
// inactivo `data-print-only` no se toca (RF-8: el wrapper vive solo en el
// tabpanel).

import type { MouseEvent, ReactNode } from "react";
import { useRef, useState } from "react";

import { useCv, useLocale } from "../../providers/LocaleProvider";
import { AboutPage } from "../../pages/AboutPage";
import { ResumePage } from "../../pages/ResumePage";
import { useHashTab } from "../../lib/useHashTab";
import { getTabDirection } from "../../lib/tabDirection";
import type { MotionDirection } from "../../lib/tabDirection";
import { format } from "../../i18n/format";

import { AccentGradientDefs } from "../Icon";
import { HexAvatarDefs } from "../HexAvatar";
import { Box } from "../Box";
import { ControlsBar } from "../ControlsBar";
import { NavTabs, getTabId } from "../NavTabs";
import { Sidebar } from "../Sidebar";
import type { SidebarLabels } from "../Sidebar";

import styles from "./AppLayout.module.css";

// Constante del módulo: orden e ids fijos de los tabs (nunca vacía — RF-5).
const TAB_IDS = ["about", "resume"] as const;
type TabId = (typeof TAB_IDS)[number];

// Guard de estrechamiento (no exportado): frontera de tipos con NavTabs, que
// fija `onChange: (id: string) => void`. Sin casts (regla de specs/README.md;
// spec → Anatomía literal).
const isTabId = (id: string): id is TabId =>
  (TAB_IDS as readonly string[]).includes(id);

// API (spec → API): `className` se aplica al `div.container` de la Anatomía
// (la raíz es un fragment; el lugar de la unión es deliberado, A7), unida a
// la base del módulo `styles.container` (T5: unión canónica + su test #99).
export interface AppLayoutProps {
  className?: string;
}

export function AppLayout({ className }: AppLayoutProps): ReactNode {
  // RF-2/RF-3: textos e idioma del provider, contenido de `useCv()` y
  // navegación por hash con inicial "about" (sin hash → default; `#resume` →
  // Resume al montar — lo gobierna useHashTab, verificado en T2).
  const { t } = useLocale();
  const cv = useCv();
  const [active, setActive] = useHashTab(TAB_IDS, "about");

  // RF-9 (T11, plan → P1): dirección de entrada con el patrón oficial de
  // React "ajuste de estado al cambiar una prop/estado" — `setState`
  // condicional durante el render del PROPIO componente (no es un efecto;
  // spec → Anatomía). Prohibido leer/escribir refs acá (`react-hooks/refs`).
  // La dirección SOLO se recalcula cuando cambia `active`: un re-render ajeno
  // (idioma, tema) conserva el valor y no corta la animación en curso (test
  // 16). En el render inicial `prevActive === active` → `direction` sigue
  // `null` y el atributo no se renderiza (sin animación al montar, RF-9).
  const [prevActive, setPrevActive] = useState(active);
  const [direction, setDirection] = useState<MotionDirection | null>(null);
  if (active !== prevActive) {
    setPrevActive(active);
    setDirection(
      getTabDirection(TAB_IDS.indexOf(prevActive), TAB_IDS.indexOf(active)),
    );
  }

  // RF-4: foco al tabpanel desde el skip link. La ref existe ya en T1 (el
  // tabpanel la conecta); el handler hace `preventDefault()` (el hash NO debe
  // cambiar: `#about`/`#resume` se conserva para el link compartible) y
  // enfoca el panel; el `href="#main-panel"` queda como respaldo sin JS
  // (spec → Anatomía). Su test es el 8 (T3).
  const panelRef = useRef<HTMLDivElement>(null);

  const focusPanel = (event: MouseEvent<HTMLAnchorElement>): void => {
    event.preventDefault();
    panelRef.current?.focus();
  };

  // RF-5 invariante: la lista tiene SIEMPRE los 2 tabs de `TAB_IDS`, en ese
  // orden, con labels de `t.nav` (nunca vacía: el caso `items=[] → null` de
  // NavTabs no aplica acá — spec → Anatomía "Tabs (invariante)").
  const tabs = [
    { id: "about", label: t.nav.about },
    { id: "resume", label: t.nav.resume },
  ] as const;

  // Mapeo explícito spec → Anatomía: todas las claves de `foundations/i18n.md`
  // de la interfaz quedan usadas (`t.contact` viaja completo para los labels
  // por tipo de contacto del Sidebar). `avatarAlt` se compone acá con la
  // plantilla i18n y el nombre del idioma activo: el alt sigue a
  // `cv.profile.name` sin guardarse en el contenido (Cambio 2026-11-10).
  const sidebarLabels: SidebarLabels = {
    region: t.sidebar.region,
    social: t.sidebar.social,
    showContacts: t.sidebar.showContacts,
    hideContacts: t.sidebar.hideContacts,
    downloadCv: t.sidebar.downloadCv,
    avatarAlt: format(t.sidebar.avatarAlt, { name: cv.profile.name }),
    contact: t.contact,
  };

  // RF-8: la página INACTIVA es la otra respecto del tab activo (cada una se
  // monta exactamente una vez en el documento: activa en el tabpanel, inactiva
  // en el bloque hermano `hidden`).
  const inactive: TabId = active === "about" ? "resume" : "about";

  // G-B/#99 (spec → API): unión canónica en el `div.container` — array +
  // filtro de undefined + join, base primero (mecanismo canónico de
  // Box/AboutPage/ResumePage); con `className` externa ambas COEXISTEN (test
  // de unión en el archivo). T5 cambió solo la BASE: literal "container" →
  // `styles.container` (el nombre resuelto por CSS Modules), misma estructura.
  const containerClassName = [styles.container, className]
    .filter((cls): cls is string => cls !== undefined)
    .join(" ");

  return (
    <>
      {/* RF-6: defs compartidas, UNA sola vez en el documento (los hijos con
          tone="gradient" y hexágonos las referencian por id). */}
      <AccentGradientDefs />
      <HexAvatarDefs />

      {/* Skip link: primer enfocable del documento (test 8, T3), sin tocar el
          hash (preventDefault + foco al panel). `data-print-hide` = contrato
          de impresión (global.css, T5). */}
      <a
        className={styles.skipLink}
        data-print-hide
        href="#main-panel"
        onClick={focusPanel}
      >
        {t.skipToContent}
      </a>

      {/* Contenedor de página (unión #99 con la base styles.container):
          ControlsBar + grid Sidebar/contenido. */}
      <div className={containerClassName}>
        <ControlsBar />
        <div className={styles.grid}>
          <Sidebar
            className={styles.aside}
            profile={cv.profile}
            contact={cv.contact}
            social={cv.social}
            labels={sidebarLabels}
          />
          <main className={styles.main}>
            <Box variant="outer" as="section" className={styles.contentCard}>
              {/* RF-2/RF-3: NavTabs controlada; el onChange de string se
                  estrecha con el guard de módulo (A1: sin casts). */}
              <NavTabs
                items={tabs}
                activeId={active}
                onChange={(id) => {
                  if (isTabId(id)) {
                    setActive(id);
                  }
                }}
                panelId="main-panel"
                label={t.nav.label}
              />
              {/* RF-8: raíz común del stack de impresión (contrato por
                  data-*, sin clase propia: los nombres de módulo se hashean y
                  global.css no puede apuntarlos). */}
              <div data-print-stack>
                <div
                  ref={panelRef}
                  role="tabpanel"
                  id="main-panel"
                  aria-labelledby={getTabId(active)}
                  tabIndex={0}
                  data-print-page={active}
                  className={styles.panel}
                >
                  {/* RF-9 (T11, plan → P4): wrapper de entrada SOLO alrededor
                      de la página activa del tabpanel — `key={active}` remonta
                      el nodo al cambiar de tab (prueba: test 13, el nodo
                      anterior sale del documento) y `data-motion-direction`
                      se renderiza ÚNICAMENTE cuando la dirección no es `null`
                      (render inicial sin atributo → sin animación; la
                      `animation` se declara en T12 sobre el atributo). Sin
                      `role`, `tabIndex` ni texto propio (spec → No hacer). El
                      nombre de clase lo resuelve el módulo (T12 declara
                      `.motionPanel`; en jsdom la query va por el atributo, no
                      por la clase). */}
                  <div
                    data-motion-panel
                    key={active}
                    {...(direction
                      ? { "data-motion-direction": direction }
                      : {})}
                    className={styles.motionPanel}
                  >
                    {active === "about" ? <AboutPage /> : <ResumePage />}
                  </div>
                </div>
                {/* Panel inactivo montado UNA vez, fuera del tabpanel, con
                    `hidden` (excluido del árbol de accesibilidad en pantalla;
                    global.css lo muestra en print con [data-print-only]). */}
                <div data-print-only data-print-page={inactive} hidden>
                  {active === "about" ? <ResumePage /> : <AboutPage />}
                </div>
              </div>
            </Box>
          </main>
        </div>
      </div>
    </>
  );
}
