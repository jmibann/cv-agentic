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
// Clases: en T1 el markup usa los LITERALES de los nombres de la Anatomía
// (`skipLink`/`container`/`grid`/`aside`/`main`/`contentCard`/`panel`) — el
// módulo `AppLayout.module.css` llega en T5 (criterio páginas F4: markup
// primero, estilos después; `styles.*` se conecta ahí sin cambiar estructura).
// `index.ts`, unión `className` assertada (test de T5) y cierre a11y (test 10)
// tampoco existen aún. T6 (reemplazo de `App.tsx`) NO se toca: aprobación
// pendiente del usuario.

import type { MouseEvent, ReactNode } from "react";
import { useRef } from "react";

import { useCv, useLocale } from "../../providers/LocaleProvider";
import { AboutPage } from "../../pages/AboutPage";
import { ResumePage } from "../../pages/ResumePage";
import { useHashTab } from "../../lib/useHashTab";

import { AccentGradientDefs } from "../Icon";
import { HexAvatarDefs } from "../HexAvatar";
import { Box } from "../Box";
import { ControlsBar } from "../ControlsBar";
import { NavTabs, getTabId } from "../NavTabs";
import { Sidebar } from "../Sidebar";
import type { SidebarLabels } from "../Sidebar";

// Constante del módulo: orden e ids fijos de los tabs (nunca vacía — RF-5).
const TAB_IDS = ["about", "resume"] as const;
type TabId = (typeof TAB_IDS)[number];

// Guard de estrechamiento (no exportado): frontera de tipos con NavTabs, que
// fija `onChange: (id: string) => void`. Sin casts (regla de specs/README.md;
// spec → Anatomía literal).
const isTabId = (id: string): id is TabId =>
  (TAB_IDS as readonly string[]).includes(id);

// API (spec → API): `className` se aplica al `div.container` de la Anatomía
// (la raíz es un fragment; el lugar de la unión es deliberado, A7). Su test
// (unión #99) llega en T5 con el módulo.
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
  // por tipo de contacto del Sidebar).
  const sidebarLabels: SidebarLabels = {
    region: t.sidebar.region,
    social: t.sidebar.social,
    showContacts: t.sidebar.showContacts,
    hideContacts: t.sidebar.hideContacts,
    downloadCv: t.sidebar.downloadCv,
    contact: t.contact,
  };

  // RF-8: la página INACTIVA es la otra respecto del tab activo (cada una se
  // monta exactamente una vez en el documento: activa en el tabpanel, inactiva
  // en el bloque hermano `hidden`).
  const inactive: TabId = active === "about" ? "resume" : "about";

  // G-B/#99 (spec → API): unión canónica en el `div.container` — array +
  // filtro de undefined + join, base literal primero (T1 usa el literal
  // "container"; T5 lo reemplaza por `styles.container` sin cambiar el
  // mecanismo); con `className` externa ambas COEXISTEN (su test llega con
  // el módulo, T5).
  const containerClassName = ["container", className]
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
        className="skipLink"
        data-print-hide
        href="#main-panel"
        onClick={focusPanel}
      >
        {t.skipToContent}
      </a>

      {/* Contenedor de página (unión #99 con el módulo en T5): ControlsBar +
          grid Sidebar/contenido. */}
      <div className={containerClassName}>
        <ControlsBar />
        <div className="grid">
          <Sidebar
            className="aside"
            profile={cv.profile}
            contact={cv.contact}
            social={cv.social}
            labels={sidebarLabels}
          />
          <main className="main">
            <Box variant="outer" as="section" className="contentCard">
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
                  className="panel"
                >
                  {active === "about" ? <AboutPage /> : <ResumePage />}
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
