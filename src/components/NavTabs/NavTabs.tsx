// NavTabs — navegación principal entre los paneles About y Resume con
// semántica de tablist, visualmente una solapa (CornerTab) en la esquina
// superior derecha de la card de contenido
// (specs/layout/NavTabs/spec.md). T1 hecha: un tablist nombrado, horizontal,
// con un `<button role="tab">` por item en el orden recibido, cada uno con
// `id = getTabId(item.id)` y `aria-controls = panelId` apuntando al MISMO
// tabpanel (RF-2: un único panel; su existencia y contenido son de AppLayout,
// spec → RF-2) y roving tabindex — activo `aria-selected="true"`/`tabIndex=0`,
// resto `"false"`/`-1` — (RF-1; la distinción visual por color/opacidad es
// RF-5, su parte CSS se inspecciona en T4). RF-7: `items=[]` → `return null`
// (un tablist sin tabs es inválido para axe). Se conecta además la
// `className` externa (G-B): ningún "Hecho cuando" de T2/T3/T4 la reclama
// (T2/T3 son comportamiento; T4, módulo + `index.ts` + cierre axe) y la
// transmisión no depende de `NavTabs.module.css` — el raíz de la pieza YA es
// la CornerTab —, así que va aquí y no se deja huérfana la API de la spec
// (criterio ControlsBar/ThemeToggle/LanguageSwitcher T1; su test
// correspondiente está marcado `// extra` en el archivo de tests).
// T2 hecha: `onChange` conectado por click (RF-3): click en un tab inactivo →
// UNA llamada con el `id` del item; click en el activo → cero (guard de la
// SI-clause, spec → Comportamiento). Sin re-gestión de foco propia: el foco
// queda en el `<button>` pulsado por vía NATIVA (plan → Decisiones: el
// `.focus()` propio existe solo para el teclado de T3).
// Diferidos: T3 conecta el teclado (RF-4: ←/→ circular con vuelta,
// Home/End, ambos enfocan y emiten; Espacio `preventDefault` + activación
// manual por el mismo camino del click — plan → Decisiones; Enter queda al
// click nativo; ↑/↓ ignoradas: tablist horizontal; 1 item → enfoca el propio
// sin emitir). T4 agrega `NavTabs.module.css` (tabla "Estilos y tokens":
// tablist flex con `--nav-tab-gap`, tab sin fondo ni borde, inactivo 80%,
// hover 100% + subrayado, activo `--color-accent-text`, anillo de foco,
// transiciones; RF-5/RF-6; cero `@media` propios, `@media print` es del
// estilo compartido — G-D), el `index.ts` (re-exporta `NavTabs`, `getTabId`
// y tipos) y el cierre `expectNoA11yViolations` del archivo de tests.
// Invariantes del consumidor (spec → Requisitos, no validadas acá — decisión
// 5 del plan): `activeId` coincide siempre con un `item.id` (useHashTab) y
// los `item.id` no traen espacios ni caracteres problemáticos; NavTabs no
// valida ni hace fallback (el guard defensivo de `-1` del findIndex entra en
// T3, cuando exista el roving por teclado).

import { CornerTab } from "../CornerTab";

// API exacta de spec → API. `NavTabItem` se exporta: el plan manda
// `index.ts` (T4) re-exportando los tipos de la spec.
export interface NavTabItem {
  /** "about" | "resume" (invariante de AppLayout/useHashTab: sin espacios ni caracteres problemáticos). */
  id: string;
  /** Texto del tab, ya traducido (C3: llega por props; la pieza no usa useLocale). */
  label: string;
}

export interface NavTabsProps {
  items: readonly NavTabItem[];
  /** Tab activo (controlado: la sincronización con la URL es de useHashTab en AppLayout). */
  activeId: string;
  /**
   * Emite el `id` del tab activado. Conectado por click en T2 (RF-3, con
   * guard del activo); el teclado lo emitirá en T3 (RF-4). La interfaz ya
   * estaba completa desde T1 (spec → API).
   */
  onChange: (id: string) => void;
  /** Id del tabpanel único (su existencia y contenido son de AppLayout — RF-2). */
  panelId: string;
  /** `aria-label` del tablist, traducido (C3: por props, no hardcodeado). */
  label: string;
  /** Se une al raíz de la pieza — se transmite a la clase base de `CornerTab` (G-B). */
  className?: string;
}

/**
 * Id del elemento tab para un item. Lo usa AppLayout para `aria-labelledby`
 * del tabpanel (spec → API; "Hecho cuando" de T1: getTabId("about") ===
 * "tab-about"). La restricción de ids globales (`#about`/`#resume` los ocupa
 * useHashTab) se cumple con el prefijo `tab-` (spec → Sincronización).
 */
export const getTabId = (id: string): string => `tab-${id}`;

export function NavTabs({
  items,
  activeId,
  onChange,
  panelId,
  label,
  className,
}: NavTabsProps) {
  // RF-7 (T1): items vacío → no renderiza NADA (ni la CornerTab: un tablist
  // sin tabs es inválido para axe; spec → Estados/Tests 10).
  if (items.length === 0) {
    return null;
  }

  // spec → Anatomía, literal: CornerTab size="md" placement="float" > div
  // role="tablist" > button role="tab" por item. Tamaño y placement NO son
  // props expuestas (plan → Interfaz: fijos md/float); la CornerTab UNE su
  // clase base con la `className` externa (G-B, spec → API). El módulo de
  // estilos de la pieza llega en T4 (tablist y tabs); por eso acá no hay
  // `className` propia del tablist ni de los tabs.
  return (
    <CornerTab size="md" placement="float" className={className}>
      {/* RF-1 + spec → Accesibilidad: tablist nombrado con `label` y
          aria-orientation horizontal (las flechas ←/→ son de T3; ↑/↓ no
          mueven el foco). */}
      <div role="tablist" aria-label={label} aria-orientation="horizontal">
        {items.map((item) => {
          // RF-1 (roving tabindex): solo el tab activo es tabulable (0); el
          // resto -1. `aria-selected` distingue el activo para tecnologías
          // de asistencia (RF-5, su parte testeable). Click conectado (T2,
          // RF-3); teclado (T3, RF-4) no se conecta todavía.
          const isActive = item.id === activeId;

          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              id={getTabId(item.id)}
              aria-selected={isActive}
              // RF-2 (T1): TODOS los tabs controlan el mismo panel único
              // (`panelId`); no se montan paneles ocultos (spec → No hacer).
              aria-controls={panelId}
              tabIndex={isActive ? 0 : -1}
              onClick={() => {
                // RF-3 (T2; precedente LanguageSwitcher, decisión 2=a):
                // click en un tab inactivo → `onChange(item.id)` UNA vez
                // (el id del ITEM, no `getTabId`: la API emite ids de
                // datos). Guard de la SI-clause: click en el ACTIVO → no
                // invoca. Sin `focus()` ni re-gestión propia acá: el foco
                // queda en el `<button>` pulsado por vía nativa (spec →
                // Comportamiento; el `.focus()` explícito es solo del
                // teclado, plan → Decisiones, T3). Lo visual (aria-selected
                // y contenido) cambia cuando el padre re-renderiza: la
                // pieza es controlada.
                if (item.id !== activeId) {
                  onChange(item.id);
                }
              }}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </CornerTab>
  );
}
