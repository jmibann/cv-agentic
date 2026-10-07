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
// T3 hecha: teclado (RF-4, post-Clarificación 6). `onKeyDown` EN CADA tab
// (criterio del builder: el `index` del `map` queda en el cierre del handler,
// y se evita tener que tipar el `event.target` de un handler en el tablist
// sin cast — prohibido; el plan ya fija "ref a los botones + `.focus()`":
// array de callback refs `tabRefs` indexado por posición, sin
// `document.getElementById`). Flechas ←/→ con vuelta `(i±1+n)%n` y Home/End →
// 0/n-1: `focusAndActivate(destIndex)` enfoca el destino y emite `onChange`
// SOLO si destino≠activo (activación automática; con ids únicos — invariante
// del consumidor — el guard por índice equivale al guard por id del click de
// T2). 1 item: el destino es el propio tab → no emite (RF-4, SI-clause).
// Espacio: `preventDefault()` en keydown — cancela el click nativo del
// `<button>` (HTML: se activa en keyup si el keydown no se canceló; plan →
// Decisión "Espacio") — y activación MANUAL por el mismo camino → emisión
// única y sin scroll de página. Enter: sin handler propio (click nativo →
// guard T2). ↑/↓ y demás teclas: ignoradas SIN `preventDefault` (RF-4: "sin
// efecto adicional"; plan → Decisiones: no se inventa más). Defensivo del
// plan (invariante violada, sin RF): `activeId` fuera de `items` → el
// `findIndex` da -1 → el teclado enfoca pero no emite nunca.
// T4 hecha (cierre de la pieza): `NavTabs.module.css` aplica la tabla
// "Estilos y tokens" — `.tablist` (flex + `align-items: center` +
// `--nav-tab-gap`) y `.tab` (tipografía `--font-size-nav`/
// `--font-weight-medium`, `--color-text`, `padding-block: var(--space-2)`,
// `white-space: nowrap`, `cursor: pointer`, sin fondo ni borde), inactivo
// 80% + subrayado 2px transparente con offset 0.375rem, hover inactivo 100%
// + `text-decoration-color: currentColor`, activo `--color-accent-text` sin
// subrayado y sin cambio en hover (el `:hover` rige solo en
// `:not([aria-selected="true"])`, criterio LanguageSwitcher T3), anillo
// `:focus-visible` estándar +
// `--radius-8` y transiciones `color`/`opacity`/`text-decoration-color` con
// `--duration-base var(--ease-standard)` (plan → Decisiones). Las dos
// clases se conectan acá: `styles.tablist` en el div y `styles.tab` en cada
// button — la `className` externa del consumidor NO se mezcla en los tabs
// (vive solo en el raíz, G-B; los estados activos/inactivo/hover los fija
// el módulo por selector de atributo `aria-selected`, sin clases de
// variante). Cero `@media` propios (RF-6: gap/altura/padding/tamaño de
// texto escalan en tokens.css; ningún `@media print` — G-D—): la
// verificación de los visuales es por inspección del CSS + QA F5 (jsdom
// no computa estilos, #101) y el cierre `expectNoA11yViolations` con
// armazón tabpanel quedó en el commit `test(NavTabs): T4`). El `index.ts`
// re-exporta `NavTabs`, `getTabId` y tipos (nota de cierre de pieza;
// plan → Archivos).
// Invariantes del consumidor (spec → Requisitos, no validadas acá — decisión
// 5 del plan): `activeId` coincide siempre con un `item.id` (useHashTab) y
// los `item.id` no traen espacios ni caracteres problemáticos; NavTabs no
// valida ni hace fallback (el guard defensivo de `-1` del findIndex quedó
// conectado en T3: `activeId` ausente → el teclado enfoca pero nunca emite).

import { useRef } from "react";

import { CornerTab } from "../CornerTab";

import styles from "./NavTabs.module.css";

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
   * Emite el `id` del tab activado. Conectado por click (T2, RF-3, guard del
   * activo) y por teclado (T3, RF-4: flechas/Home/End con activación
   * automática y Espacio con activación manual única; ambos pasan por el
   * guard destino≠activo). La interfaz ya estaba completa desde T1
   * (spec → API).
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
  // T3 (RF-4; plan → Decisiones 6 "foco propio, activación del padre"): refs a
  // los botones para el `.focus()` del teclado, array indexado por posición
  // llenado por callback refs (cuerpo en bloque: no devuelve valor — React 19).
  // El click (T2) no las usa: ahí el foco es nativo del `<button>`.
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // RF-7 (T1): items vacío → no renderiza NADA (ni la CornerTab: un tablist
  // sin tabs es inválido para axe; spec → Estados/Tests 10).
  if (items.length === 0) {
    return null;
  }

  // T3 (RF-4): mueve el foco al tab destino y emite `onChange` SOLO si el
  // destino no es el activo (activación automática: lo visual cambia con el
  // re-render controlado del padre). Guard por índice: con ids únicos
  // (invariante del consumidor) equivale a la comparación por id del click
  // (T2); el caso 1-item cae acá: destino === activo → no emite (RF-4,
  // SI-clause). Defensivo del plan (invariante violada, sin RF): `activeId`
  // fuera de `items` → `findIndex` da -1 → enfoca pero no emite nunca.
  // `noUncheckedIndexedAccess`: lecturas indexadas protegidas por nullish.
  const focusAndActivate = (destIndex: number) => {
    const destItem = items[destIndex];
    const destTab = tabRefs.current[destIndex];
    if (!destItem || !destTab) {
      return;
    }
    destTab.focus();
    const activeIndex = items.findIndex((item) => item.id === activeId);
    if (activeIndex !== -1 && destIndex !== activeIndex) {
      onChange(destItem.id);
    }
  };

  // spec → Anatomía, literal: CornerTab size="md" placement="float" > div
  // role="tablist" > button role="tab" por item. Tamaño y placement NO son
  // props expuestas (plan → Interfaz: fijos md/float); la CornerTab UNE su
  // clase base con la `className` externa (G-B, spec → API). T4 conecta las
  // clases del módulo: `styles.tablist` en el div (fila "tablist" de la
  // tabla) y `styles.tab` en cada botón (fila "tab"; los estados por
  // selector `aria-selected`, sin variantes de clase y sin mezclar la
  // externa en los tabs). Bajo `noUncheckedIndexedAccess` `styles.x` es
  // `string | undefined`: la clase existe en runtime (CSS Modules resuelve
  // el módulo) y el tipo lo acepta `className` (prop opcional sin
  // exactOptionalPropertyTypes); criterio de la fase: el join con filtro se
  // usa donde hay varias clases que unir (CornerTab/ControlsBar), acá cada
  // elemento lleva UNA sola clase propia.
  return (
    <CornerTab size="md" placement="float" className={className}>
      {/* RF-1 + spec → Accesibilidad: tablist nombrado con `label` y
          aria-orientation horizontal (las flechas ←/→ son de T3; ↑/↓ no
          mueven el foco). T4: fila "tablist" de la tabla (flex,
          align-items center, gap --nav-tab-gap). */}
      <div
        role="tablist"
        aria-label={label}
        aria-orientation="horizontal"
        className={styles.tablist}
      >
        {items.map((item, index) => {
          // RF-1 (roving tabindex): solo el tab activo es tabulable (0); el
          // resto -1. `aria-selected` distingue el activo para tecnologías
          // de asistencia (RF-5, su parte testeable). Click conectado (T2,
          // RF-3) y teclado conectado (T3, RF-4).
          const isActive = item.id === activeId;

          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              // T4: fila "tab" de la tabla + estados por [aria-selected]
              // (RF-5); una sola clase propia, sin externa (G-B).
              className={styles.tab}
              ref={(element) => {
                tabRefs.current[index] = element;
              }}
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
              onKeyDown={(event) => {
                // T3 (RF-4). Espacio: `preventDefault()` en keydown cancela
                // el click nativo del `<button>` (HTML: se activa en keyup si
                // el keydown no se canceló — plan → Decisión "Espacio") y la
                // activación es MANUAL por el mismo camino que el click →
                // emisión única (sin el preventDefault serían dos) y sin
                // scroll de página.
                if (event.code === "Space") {
                  event.preventDefault();
                  focusAndActivate(index);
                  return;
                }
                // Flechas ←/→ con vuelta circular `(i±1+n)%n` y Home/End →
                // primero/último; enfocan y emiten con guard destino≠activo
                // (n > 0: `items=[]` devolvió null arriba; spec →
                // Comportamiento).
                const count = items.length;
                if (event.key === "ArrowRight") {
                  focusAndActivate((index + 1) % count);
                } else if (event.key === "ArrowLeft") {
                  focusAndActivate((index - 1 + count) % count);
                } else if (event.key === "Home") {
                  focusAndActivate(0);
                } else if (event.key === "End") {
                  focusAndActivate(count - 1);
                }
                // Enter: sin handler propio → click nativo del `<button>`
                // (pasa por el guard de T2; spec → Comportamiento). ↑/↓ y las
                // demás teclas: SIN efecto adicional y SIN preventDefault
                // (RF-4: tablist horizontal; plan → Decisiones: ignoradas).
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
