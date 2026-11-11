# Sistema de motion — auditoría, propuesta y Cambios en espera

**Estado:** propuesta y borradores de Cambios; **implementación no iniciada**.
**Fecha:** 2026-11-11.
**Alcance:** Fases 0–2 (diagnóstico, inventario y diseño), borradores de
specs/planes/tareas de los Cambios y el Cambio de contenido previo.

> **Puertas de esta etapa:**
> 1. No se modifica código ni tests hasta que el usuario apruebe los
>    specs/planes/tareas de cada Cambio.
> 2. No se arranca nada hasta que el usuario confirme que resolvió el árbol de
>    trabajo sucio (`src/utils/assetUrl.ts`, `HexAvatar.tsx`, `Sidebar.tsx`,
>    `vite.config.ts`).
> 3. El **Cambio de contenido** va antes que los Cambios de motion.

Base: inspección estática del reviewer con contexto limpio sobre `654f26e`,
verificada por el orchestrator en los archivos citados.

---

## 0. Resumen ejecutivo

- **No hay librería de motion ni `@keyframes`.** Toda la animación actual son
  12 declaraciones `transition` (16 propiedades) en 8 archivos CSS.
- **El cambio de tab no anima el contenido**: el tabpanel se mantiene, pero la
  página activa se reemplaza por render condicional (`AppLayout.tsx:200-207`).
- **El bloque de contactos no anima**: se oculta con `display: none`
  (`Sidebar.module.css:78-80`). El único motion del disclosure es la rotación
  del chevron.
- **No existe supresión de transiciones durante el cambio de tema.** Los links
  del Sidebar con `transition: color` (`Sidebar.module.css:247,386`) animan su
  color al alternar tema, en conflicto con `foundations/motion.md:29,39`.
- **`prefers-reduced-motion` funciona por colapso de tokens**
  (`tokens.css:416-422`), pero no cubre delays de stagger ni animaciones
  futuras fuera de tokens.
- **Decisiones aprobadas:** tokens nuevos (`base 0.2s`, `slow 0.3s`,
  `exit 0.22s`, `stagger 0.03s`, `ease-enter`, `ease-exit`), alternativa B para
  tabs, grid `0fr→1fr` para contactos, `data-theme-switching`, reduced motion
  instantáneo y `--ease-enter` en el dialog. Sin subrayado animado en contactos.
- **Cambio de contenido previo:** CV real en `src/content/cv.{en,es}.json`, con
  `contact[]` sin teléfono ni WhatsApp y `testimonials: []`. El usuario lo
  aporta en un archivo. La sección de testimonios ya se oculta sin datos
  (`AboutPage.tsx:133`; `TestimonialCarousel.tsx:263`), pero sus tests asumen
  contenido no vacío y hay que ajustarlos (ver §5.4).

---

## 1. Fase 0 — Descartar causas

### 1.1 Mecanismos y dependencias

| Comprobación | Resultado | Evidencia |
|---|---|---|
| Librería de animación | **No hay** framer, gsap, react-spring, motion ni similar | `package.json:20-26` |
| `@keyframes` / `animation:` | **0 coincidencias** en `src/`, `tokens/`, `foundations/` | búsqueda global |
| `transition` | 12 declaraciones, 16 propiedades, 8 archivos CSS | inventario §2.1 |
| `transition: all` | **0** | todos nombran propiedades concretas |
| `view-transition` | **0** | — |
| `@starting-style` | 1, solo en el dialog | `TestimonialDialog.module.css:96-106` |
| Scroll suave JS | 1, carrusel | `TestimonialCarousel.tsx:255` |
| Motion en `global.css` | **Ninguno** | `src/styles/global.css` |

### 1.2 `prefers-reduced-motion`

| Regla | Archivo:línea | Qué hace |
|---|---|---|
| Override de duraciones | `tokens.css:416-422` | `--duration-fast/base/slow` → `0.01ms` |
| Scroll del carrusel | `TestimonialCarousel.tsx:255` | `behavior: "smooth"` solo con `no-preference` |

- Es la **única** regla CSS de reduced motion. No hay reglas por componente.
- Anula todas las transiciones actuales porque todas usan los tokens.
- **No cubre** `display: none`, delays de stagger ni futuras animaciones que no
  usen los tokens de duración.
- Si el usuario ve “cero animación” también en el chevron, es probable que
  tenga Reduce Motion activo en el SO. Verificación: macOS → Ajustes del
  Sistema → Accesibilidad → Pantalla → “Reducir movimiento”, o DevTools →
  Rendering → Emulate CSS media feature `prefers-reduced-motion: reduce`.

### 1.3 Cambio de tema

| Comprobación | Resultado | Evidencia |
|---|---|---|
| Atributo/clase de supresión | **No existe** `data-theme-switching`, `no-transition` ni similar | búsqueda global |
| Único cambio de tema | `ThemeProvider` asigna `root.dataset.theme` y actualiza `theme-color` | `ThemeProvider.tsx:77-87` |
| Tema inicial anti-flash | Script inline antes del primer paint | `index.html:11-36` |
| Transiciones que sí se ejecutan al cambiar tema | Links del Sidebar con `transition: color` | `Sidebar.module.css:247,386` |
| NavTabs | Excluye `color` de la transición a propósito | `NavTabs.module.css:72-77`; spec `NavTabs/spec.md:104` |

**Conclusión:** no hay un “modo sin transiciones” que revisar, y el cambio de
tema no es totalmente instantáneo: los links del Sidebar animan su color. Esto
contradice `foundations/motion.md:29,39`.

### 1.4 Arquitectura de render de las dos interacciones

**Panel de tabs (`AppLayout.tsx:190-207`):**

- El `<div id="main-panel" role="tabpanel">` es persistente; cambia
  `aria-labelledby`.
- La página activa se renderiza condicionalmente:
  `{active === "about" ? <AboutPage /> : <ResumePage />}` (`:200`).
- La inactiva vive en un hermano con `data-print-only` + `hidden` (`:205-207`).
- **No hay `key`**: el remount es implícito al cambiar el tipo de componente.
- Cada cambio de tab desmonta/monta ambas ramas; el panel y el `<NavTabs>` no se
  desmontan.
- No hay crossfade, shared element ni transición de altura; el documento puede
  cambiar de alto de golpe.

**Sidebar (`Sidebar.tsx`, `Sidebar.module.css`):**

- Estado local `expanded`, default `false` (`Sidebar.tsx:163`).
- Botón propio icon-only, `aria-expanded` + `aria-controls`
  (`Sidebar.tsx:223-235`); **no** es CornerTab.
- Chevron con `transform: rotate(180deg)` y transición de `transform`
  (`Sidebar.tsx:171-176,234`; `Sidebar.module.css:91-105`).
- Bloque `#sidebar-contacts`: clases `.additional` +
  `.additionalCollapsed`; esta última usa `display: none`
  (`Sidebar.tsx:185-190,300`; `Sidebar.module.css:78-80`).
- `<1200px`: el botón está visible y el bloque se alterna con `expanded`.
- `≥1200px`: el botón se oculta por CSS y el bloque se fuerza visible con
  `.additional.additionalCollapsed { display: block }`
  (`Sidebar.module.css:493-499`).
- **No hay animación de altura**; la spec lo prohíbe explícitamente
  (`Sidebar/spec.md:199`).

---

## 2. Fase 1 — Inventario y verificación con los tokens aprobados

### 2.1 Inventario completo

| # | Componente / selector | Archivo:línea | Propiedad(es) | Disparador | Duración / easing | Propósito |
|---|---|---|---|---|---|---|
| 1 | NavTabs `.tab` | `NavTabs.module.css:91-93` | `opacity`, `text-decoration-color` | hover / activo | `--duration-base` / `--ease-standard` | feedback + orientación |
| 2 | ThemeToggle | `ThemeToggle.module.css:65` | `transform` | press | `--duration-fast` / `--ease-standard` | feedback |
| 3 | LanguageSwitcher | `LanguageSwitcher.module.css:97` | `transform` | press | `--duration-fast` / `--ease-standard` | feedback |
| 4 | Sidebar links sociales | `Sidebar.module.css:247` | `color` | hover | `--duration-base` / `--ease-standard` | feedback |
| 5 | Sidebar links de contacto | `Sidebar.module.css:386` | `color` | hover | `--duration-base` / `--ease-standard` | **inerte**: el color no cambia |
| 6 | Sidebar chevron | `Sidebar.module.css:92` | `transform` | expandir/colapsar | `--duration-base` / `--ease-standard` | orientación |
| 7 | Button | `Button.module.css:49-52,71` | `opacity`, `box-shadow`, `transform` | hover / press | base + fast / base | feedback |
| 8 | TestimonialCard | `TestimonialCard.module.css:43` | `box-shadow` | hover | `--duration-base` / `--ease-standard` | feedback / jerarquía |
| 9 | TestimonialDialog entrada | `TestimonialDialog.module.css:83-85,101-106` | `opacity`, `transform` | abrir | `--duration-base` / `--ease-standard` | orientación / continuidad (**solo entrada**) |
| 10 | TestimonialDialog close | `TestimonialDialog.module.css:194` | `color` | hover | `--duration-base` / `--ease-standard` | feedback |
| 11 | TestimonialCarousel bullet | `TestimonialCarousel.module.css:128` | `width` | slide activo | `--duration-base` / `--ease-emphasized` | jerarquía / orientación |
| 12 | TestimonialCarousel track | `TestimonialCarousel.module.css:46-47`; `.tsx:255` | `scroll-snap` + `scrollTo` | paginación | JS smooth/no-preference | orientación |
| 13 | CornerTab | `CornerTab.module.css:18-19` | — | — | — | sin motion |
| 14 | ControlsBar, Badge, Overhead, Timeline, ResumeSection, SkillList, ServiceCard, Icon, BrandIcon, IconBox, Box, Separator, SectionTitle, skip link, panel, avatar, páginas, `global.css` | módulos respectivos | — | — | — | **sin motion** |

### 2.2 Tokens aprobados y uso

| Token | Actual | Aprobado | Usos reales | Evidencia |
|---|---|---|---|---|
| `--duration-fast` | `0.15s` | **`0.15s`** | 3: Button `transform`, ThemeToggle, LanguageSwitcher | `tokens.css:220` |
| `--duration-base` | `0.3s` | **`0.2s`** | 13 propiedades: hover/color, tabs, chevron, dialog, bullet, card, Button | `tokens.css:221` |
| `--duration-slow` | `0.6s` | **`0.3s`** | **0 usos actuales**; pasa a ser la entrada de contenido/layout | `tokens.css:222` |
| `--duration-exit` | — | **`0.22s`** | nuevo: salida de contenido/layout (~73 % de `slow`) | nuevo |
| `--duration-stagger` | — | **`0.03s`** | nuevo: paso de stagger de los ítems de contacto | nuevo |
| `--ease-standard` | `ease-in-out` | **`ease-in-out`** | 15 propiedades; hover/foco reversibles | `tokens.css:223` |
| `--ease-enter` | — | **`cubic-bezier(0.22, 1, 0.36, 1)`** | entradas (panel, contactos, dialog) | nuevo |
| `--ease-exit` | — | **`cubic-bezier(0.4, 0, 1, 1)`** | salidas (contactos) | nuevo |
| `--ease-emphasized` | `cubic-bezier(0.455, 0.03, 0.515, 0.955)` | **sin cambio** | ancho del bullet | `tokens.css:224` |

- Duraciones, easings y delays literales en CSS de componentes: **0**.
- `--duration-slow` no tiene usos actuales: cambiarlo de `0.6s` a `0.3s` no
  altera ninguna transición existente.
- `--duration-base` es el único valor existente que cambia de forma visible
  (0.3 → 0.2, un 33 % más rápido). Afecta solo hover/foco y el dialog/chevron/
  bullet; no cambia propiedades ni easings.
- `--duration-exit` y `--duration-stagger` son nuevos: no hay impacto en las
  12 transiciones actuales.
- Los cinco tokens de duración (`fast`, `base`, `slow`, `exit`, `stagger`) se
  fuerzan a `0.01ms` en `tokens.css:416-422` con `prefers-reduced-motion:
  reduce`. Los delays de stagger se anulan además con una regla de componente
  (el colapso de duraciones no alcanza para los delays).

### 2.3 Verificación de las 12 transiciones existentes con los valores nuevos

| # | Transición | Valor nuevo | ¿Requiere ajuste además del token? | Veredicto |
|---|---|---|---|---|
| 1 | NavTabs `opacity` + `text-decoration-color` | 0.2s, `ease-standard` | No. El subrayado y el hover se sienten más ágiles; el color activo sigue instantáneo por spec. | **Se conserva.** QA visual del subrayado a 0.2s. |
| 2 | ThemeToggle `transform` | 0.15s, `ease-standard` | No. `fast` no cambia. | **Se conserva.** |
| 3 | LanguageSwitcher `transform` | 0.15s, `ease-standard` | No. `fast` no cambia. | **Se conserva.** |
| 4 | Sidebar social links `color` | 0.2s, `ease-standard` | No. Se suprime durante el cambio de tema (nuevo `data-theme-switching`). | **Se conserva.** |
| 5 | Sidebar contact links `color` | 0.2s, `ease-standard` | **Sí:** la transición es inerte (el color no cambia). Se elimina la declaración; no se reemplaza por subrayado animado (decisión 6: fuera de alcance). | **Se elimina la transición.** Sin cambio visual. |
| 6 | Sidebar chevron `transform` | 0.2s, `ease-standard` | No. Rota en 0.2s mientras el bloque expande en 0.3s: el chevron “lidera” ~100ms, aceptable para feedback. | **Se conserva.** QA de coreografía. |
| 7 | Button `opacity`/`box-shadow`/`transform` | 0.2s / 0.15s, `ease-standard` | No. Hover 33 % más rápido; press sigue en `fast`. | **Se conserva.** QA visual de hover/press. |
| 8 | TestimonialCard `box-shadow` | 0.2s, `ease-standard` | No. | **Se conserva.** |
| 9 | TestimonialDialog entrada `opacity`/`transform` | 0.2s, **`ease-enter`** | **Sí:** cambiar el easing a `--ease-enter` (decisión 6). Se mantiene `--duration-base` 0.2s: el dialog es un overlay, no contenido de página. | **Cambia solo el easing.** |
| 10 | TestimonialDialog close `color` | 0.2s, `ease-standard` | No. | **Se conserva.** |
| 11 | Carousel bullet `width` | 0.2s, `ease-emphasized` | No. Es un elemento pequeño; 0.2s no debería producir jank. Si en QA se siente brusco, se evalúa `--duration-slow` como follow-up (no se cambia ahora). | **Se conserva.** QA de layout. |
| 12 | Carousel track `scroll-snap` + `scrollTo` | Sin cambio | No. El `scrollTo({ behavior: "smooth" })` lo temporiza el navegador; no usa tokens. Reduced motion ya lo apaga. | **Se conserva.** |

**Impacto global:** solo las transiciones con `--duration-base` se aceleran
(0.3 → 0.2); `--duration-fast` no cambia; `--duration-slow` no tenía usos. No
hay cambios de propiedades ni de easing en las transiciones existentes salvo el
dialog (#9). La sensación general queda más ágil; se confirma en QA.

### 2.4 Evaluación

**Coherencia.** La escala aprobada cubre feedback (`fast`), microinteracciones
(`base`), entrada de contenido (`slow`), salida (`exit`) y stagger. Los easings
separan hover/foco reversibles (`standard`) de entradas (`enter`) y salidas
(`exit`). Ya no hay un token reservado sin uso.

**Propósito.**

| Motion | Propósito | Observación |
|---|---|---|
| Button hover/press | feedback | correcto |
| ThemeToggle / LanguageSwitcher press | feedback | correcto |
| NavTabs opacity/underline | feedback + orientación | el color activo es instantáneo por spec |
| Sidebar social links | feedback | correcto |
| Sidebar contact links | feedback | **inerte**; se elimina |
| Sidebar chevron | orientación | único motion del disclosure |
| TestimonialCard shadow | feedback / jerarquía | correcto |
| TestimonialDialog entrada | orientación / continuidad | solo entrada; pasa a `ease-enter` |
| Bullet del carrusel | jerarquía / orientación | única transición de layout |
| Tabs → panel | — | **no existe**; se agrega (alternativa B) |
| Contactos → bloque | — | **no existe**; se agrega (grid + stagger) |

No hay motion decorativo puro ni stagger.

**Coreografía.** Se agrega stagger solo en la entrada de contactos; el panel
entra con dirección; el dialog mantiene solo entrada. El cambio de tema será
instantáneo. El único layout animado existente (bullet) se conserva; se suma la
altura del bloque de contactos, justificada por continuidad.

**Reduced motion.** Cobertura completa para el CSS actual por colapso de
tokens. Se extiende a delays y a las animaciones nuevas.

### 2.5 Conflictos con el kit (Cambios)

| # | Conflicto | Evidencia | Disposición aprobada |
|---|---|---|---|
| C1 | `Sidebar` prohíbe animar la altura del bloque de contactos | `specs/layout/Sidebar/spec.md:199` | **Cambio de Sidebar**: reemplazar la prohibición por el patrón `grid-template-rows` + condiciones de accesibilidad/print |
| C2 | `motion.md` dice que los contactos no tienen animación de altura | `foundations/motion.md:28` | **Cambio de foundation**: actualizar catálogo |
| C3 | `motion.md` prohíbe animar `height`/`width` de layout | `foundations/motion.md:34` | **Cambio de foundation**: exceptuar explícitamente `grid-template-rows: 0fr → 1fr` |
| C4 | `motion.md` dice que el cambio de tema no anima, pero el Sidebar anima `color` | `foundations/motion.md:29,39`; `Sidebar.module.css:247,386` | **Cambio de Foundation**: `data-theme-switching` + regla global; eliminar la transición inerte de contactos |
| C5 | `motion.md` asigna `--duration-base` al “cambio de tab”, pero no hay animación de panel | `foundations/motion.md:12`; `AppLayout.tsx:200-207` | **Cambio de AppLayout**: nuevo RF de entrada de panel |
| C6 | `--duration-slow` está reservado y sin uso | `tokens.css:222`; `motion.md:13` | **Cambio de Foundation**: repurposarlo como entrada de contenido (0.3s) |
| C7 | `ease-standard` (`ease-in-out`) se usa en la entrada del dialog | `TestimonialDialog.module.css:83-85`; spec `TestimonialDialog/spec.md:79` | **Cambio de TestimonialDialog**: `--ease-enter` |
| C8 | Comentario desactualizado en NavTabs sobre `color` | `NavTabs.tsx:51-52` vs `NavTabs.module.css:72-77,91-93` | **Cambio menor**: corregir el comentario al tocar la pieza (sin cambio de comportamiento) |
| C9 | El test de Sidebar asume que el `Separator` es hijo directo de `#sidebar-contacts` | `Sidebar.test.tsx:287-289,317,379,744` | **Reescribir con `within()`/rol**, sin selector de profundidad; ver §4.3 |
| C10 | No hay hooks de motion en el contrato de impresión | `global.css:80-173` | **Cambio de AppLayout/Sidebar**: hooks de motion + `@media print` sin animaciones |

---

## 3. Fase 2 — Sistema propuesto

### 3.1 Tokens

Ver §2.2. La retualización aprobada es `base 0.2s`, `slow 0.3s`, más `exit`,
`stagger`, `ease-enter` y `ease-exit`. `fast`, `ease-standard` y
`ease-emphasized` se conservan.

**Reduced motion:** `fast/base/slow/exit/stagger` → `0.01ms` en
`tokens.css:416-422`; delays de stagger anulados con
`@media (prefers-reduced-motion: reduce)` en el componente. Comportamiento
aprobado: **instantáneo, sin fundido**.

### 3.2 Cambio de tab — alternativa B (aprobada)

- La nueva página entra con `opacity 0 → 1` y `translateX(±10px) → 0`; la
  anterior se desmonta.
- Dirección desde el índice del tab: About (0) → Resume (1) entra desde la
  derecha; Resume → About entra desde la izquierda. Se implementa con
  `data-motion-direction="forward|backward"` y CSS, sin `style` inline.
- Propiedades: `opacity` + `transform` (compositor-friendly).
- Duración: `--duration-slow` (0.3s), `--ease-enter`; `10px` es el punto medio
  del rango 8–16 px.
- **`key={active}` remonta la página.** Esto **resetea el estado interno** de
  la página: el índice del `TestimonialCarousel` vuelve a 0 y cualquier
  `TestimonialDialog` abierto se desmonta/cierra. Es el comportamiento
  esperado y **debe quedar documentado en la spec de AppLayout** (y en la de
  las páginas si aplica). No se conserva estado entre tabs.
- Foco y ARIA: el wrapper no recibe foco ni rol; el tabpanel conserva
  `aria-labelledby`, `tabIndex=0` y su id. La animación es solo visual; el
  estado cambia inmediatamente.
- Clics rápidos: el wrapper con `key={active}` reinicia la animación; el estado
  final coincide con el último click.
- Impresión: `[data-motion-panel] { animation: none; transition: none; }` en
  `@media print`; el panel inactivo (`data-print-only`) no se anima.

**Alternativas descartadas:** A (solo crossfade; menos orientación) y C (View
Transitions API; soporte variable, coordinación con React y fallback
necesario). C queda como mejora progresiva futura con fallback a B.

### 3.3 Expandir/colapsar contactos (aprobado)

**Mecanismo:** `grid-template-rows: 0fr → 1fr` en `#sidebar-contacts` con un
wrapper interno (`min-height: 0; overflow: hidden`). Anima altura sin
`height: auto` ni medición JS. Es una animación de layout **justificada** y se
exceptúa en `foundations/motion.md` (C3).

**Estructura:**

```text
<div id="sidebar-contacts" class="additional [additionalCollapsed]">
  <div class="additionalBody">          ← min-height: 0; overflow: hidden
    <Separator />
    <ul class="contacts">…</ul>
    <Button … />
  </div>
</div>
```

**CSS conceptual:**

```css
.additional {
  display: grid;
  grid-template-rows: 1fr;
  visibility: visible;
  transition:
    grid-template-rows var(--duration-slow) var(--ease-enter),
    visibility 0s;
}
.additionalCollapsed {
  grid-template-rows: 0fr;
  visibility: hidden;
  transition:
    grid-template-rows var(--duration-exit) var(--ease-exit),
    visibility 0s var(--duration-exit);
}
.additionalBody {
  min-height: 0;
  overflow: hidden;
}
```

- **Accesibilidad:** `visibility: hidden` saca el bloque del árbol de
  accesibilidad y del foco al colapsar; el `visibility` se retrasa hasta el
  final del cierre. No se usa `aria-hidden` sobre contenido enfocable.
- **≥1200px:** `.additional.additionalCollapsed { grid-template-rows: 1fr;
  visibility: visible; transition: none; }` (selector compuesto (0,2,0), como
  hoy) + el botón sigue oculto por CSS.
- **Chevron:** `transform: rotate(180deg)` con `--duration-base` 0.2s
  (`ease-standard`); arranca junto con la expansión, sin delay.
- **Stagger:** solo en la entrada. Ítems de contacto con `opacity 0 → 1` y
  `translateY(4px) → 0`, `--duration-base` 0.2s/`--ease-enter`, delays
  `0/30/60/90ms` (`--duration-stagger`) para un máximo de 4 ítems. Total:
  90 + 200 = **290ms**. En salida no hay stagger: el contenedor se cierra y
  recorta.
- **Clics rápidos:** transiciones guiadas por clase de estado, sin timers JS;
  al alternar rápido la transición se invierte y el estado final coincide con
  `expanded`/`aria-expanded`.
- **Impresión:** `#sidebar-contacts { display: block; visibility: visible; }`
  (ya existe `display: block` en `global.css:162-164`) + forzar
  `#sidebar-contacts li { opacity: 1; transform: none; transition: none; }` y
  `grid-template-rows: 1fr; animation: none`. Sin esto, imprimir con el bloque
  colapsado dejaría ítems con `opacity: 0`.
- **Test existente:** no se reubica el selector estructural. Se reescribe con
  `within()`/rol; ver §4.3.

### 3.4 Cambio de tema (aprobado)

- En `ThemeProvider`, antes de aplicar `data-theme`, agregar
  `data-theme-switching` a `<html>`; aplicar el tema; quitarlo después de dos
  `requestAnimationFrame`, con cleanup incondicional en el retorno del efecto y
  cancelación si se alterna de nuevo. Usar `useLayoutEffect` para que la
  supresión exista antes del paint del nuevo tema.
- Regla global en `src/styles/global.css`:
  `html[data-theme-switching] * { transition: none; }` (especificidad (0,1,1),
  gana a las clases hasheadas sin `!important`). Incluir `*::before`/`*::after`
  si se detectan transiciones en pseudo-elementos (Button `::before`).
- Resultado: los colores cambian en el mismo frame; no hay parpadeo ni
  transición de acento. El press del ThemeToggle también queda instantáneo
  durante ese frame (aceptable).
- **Test aprobado:** verificar que el atributo se aplica y se remueve, incluido
  el cleanup (con timers/rAF falsos). La ausencia de transición visual es
  inspección + QA en navegador.
- Además se elimina la transición inerte `transition: color` de `.contacts a`
  (`Sidebar.module.css:386`); no se reemplaza por subrayado animado (fuera de
  alcance).

### 3.5 Impresión

Reglas en `src/styles/global.css` dentro de `@media print`:

```css
[data-motion-panel],
#sidebar-contacts,
#sidebar-contacts * {
  animation: none;
  transition: none;
}
#sidebar-contacts {
  display: block;          /* ya existe */
  visibility: visible;
  grid-template-rows: 1fr;
}
#sidebar-contacts li {
  opacity: 1;
  transform: none;
}
```

- El panel activo no anima; el inactivo (`data-print-only`) no tiene animación.
- Los contactos quedan siempre expandidos, como hoy (`global.css:152-164`).
- El estado colapsado no puede dejar ítems con `opacity: 0` en papel.
- El cambio de tema no ocurre en impresión (controles ocultos; paleta fija).

### 3.6 Tabla de especificación por animación

| Interacción | Propósito | Propiedades | Duración | Easing | Delay | Reduced motion |
|---|---|---|---|---|---|---|
| Entrada de panel al cambiar tab | orientación / continuidad | `opacity`, `transform: translateX(±10px)` | `--duration-slow` (0.3s) | `--ease-enter` | 0 | sin transform; swap instantáneo |
| Salida de panel | — | no se anima (desmonta) | — | — | — | — |
| Expansión de contactos | continuidad / jerarquía | `grid-template-rows` 0fr→1fr | `--duration-slow` (0.3s) | `--ease-enter` | 0 | sin animación de altura; instantáneo |
| Cierre de contactos | continuidad | `grid-template-rows` 1fr→0fr, `visibility` | `--duration-exit` (0.22s) | `--ease-exit` | 0 | instantáneo |
| Ítems de contacto (entrada) | jerarquía / stagger | `opacity`, `translateY(4px)` | `--duration-base` (0.2s) | `--ease-enter` | 0/30/60/90ms | sin transform ni delays |
| Ítems de contacto (salida) | — | los recorta el contenedor | — | — | 0 | — |
| Chevron | orientación | `transform: rotate(180deg)` | `--duration-base` (0.2s) | `--ease-standard` | 0 | instantáneo |
| Cambio de tema | evitar parpadeo | `transition: none` global temporal | 0 | — | — | igual |
| Hover/foco existentes | feedback | sin cambio de propiedades | `--duration-base` (0.2s) | `--ease-standard` | 0 | tokens a 0.01ms |
| Dialog entrada | orientación | `opacity`, `scale(0.96)` | `--duration-base` (0.2s) | `--ease-enter` | 0 | tokens a 0.01ms |
| Impresión | — | `animation/transition: none` | 0 | — | — | no aplica |

### 3.7 Testabilidad

| Comportamiento | jsdom (test) | Inspección | QA navegador |
|---|---|---|---|
| Valores de tokens y reduced motion | — | CSS de `tokens.css` | DevTools → Rendering / Animations |
| `data-theme-switching` se agrega/quita y hay cleanup | sí (timers/rAF falsos) | — | alternar tema y observar ausencia de transición |
| Panel: wrapper/atributo de dirección y clases al cambiar tab | sí | CSS | animación real y 60fps |
| Panel: foco y `aria-labelledby` se conservan | sí | — | teclado real |
| Panel: clics rápidos, estado final | sí (user-event) | — | clicks rápidos |
| Panel: `key={active}` resetea carrusel/dialog | sí (estado interno) | — | observación |
| Panel: altura sin salto | — | — | DevTools / observación |
| Contactos: `aria-expanded`, clase de colapso, wrapper | sí | CSS | — |
| Contactos: altura, stagger, chevron, `visibility` | — | CSS | DevTools / observación |
| Contactos: `Separator` presente sin selector de profundidad | sí (nuevo test) | — | — |
| Reduced motion sin desplazamientos | — | CSS | DevTools emulación |
| Impresión sin animaciones y contactos expandidos | — | `global.css` | Ctrl+P real (usuario) |
| Theme-change sin animación | parcial (atributo) | `global.css` | alternar tema |

---

## 4. Cambios: specs, planes y tareas (borrador en espera)

Nada de esto se implementa hasta la aprobación. Orden: **Foundation →
AppLayout → Sidebar → TestimonialDialog**. Cada Cambio recorre spec → plan →
tareas → implementación → revisión. Las tareas de `global.css` se coordinan en
ese orden porque el archivo es compartido.

### 4.1 Foundation — tokens, tema y docs

**Spec:** `specs/foundation/Foundation/spec.md` (hoy `Estado: implementada`).

**RF nuevos (EARS):**

- **RF-9:** CUANDO el usuario cambia el tema (`toggleTheme` o cambio del
  sistema), EL SISTEMA aplica `data-theme` sin transiciones de color: agrega
  `data-theme-switching` a `<html>` antes de aplicar el tema y lo quita después
  de dos frames; SI el componente se desmonta o el tema cambia de nuevo,
  ENTONCES el atributo se limpia/cancela.
- **RF-10:** EL SISTEMA expone los tokens de motion aprobados
  (`--duration-fast/base/slow/exit/stagger`, `--ease-standard/enter/exit/
  emphasized`) y con `prefers-reduced-motion: reduce` las cinco duraciones
  valen `0.01ms`.

**Archivos:**

- `tokens/tokens.css`: valores de §2.2; override de reduced motion.
- `src/providers/ThemeProvider.tsx`: `data-theme-switching` + cleanup.
- `src/providers/ThemeProvider.test.tsx`: aplica/quita, cleanup, cambio
  rápido, timers/rAF falsos.
- `src/styles/global.css`: `html[data-theme-switching] * { transition: none }`
  (+ pseudos si aplica).
- `foundations/motion.md`: tabla de tokens, catálogo (panel y contactos),
  `grid-template-rows`, reduced motion con delays, tema sin transiciones.
- `docs/README.md`: registrar la decisión nueva (#106) al aprobar.

**Plan (decisiones):**

1. `useLayoutEffect` para que la supresión gane al paint; doble rAF para
   remover; cleanup con `cancelAnimationFrame`.
2. La regla global usa `html[data-theme-switching] *` (0,1,1) sin
   `!important`; se verifican pseudo-elementos.
3. No se toca el anti-flash de `index.html`: la supresión es solo para cambios
   interactivos.
4. `--duration-slow` se repurposa; no se agrega un alias nuevo.
5. Los tests de tokens son de inspección; el de ThemeProvider es jsdom.

**Tareas (Tn):**

- **T1:** tokens + reduced motion (CSS). Hecho: valores exactos, override,
  lint/typecheck/test verdes; inspección.
- **T2:** test rojo de `data-theme-switching` (aplica, quita, cleanup).
- **T3:** implementación en `ThemeProvider` + regla global. Hecho: test verde,
  cambio de tema sin transición (inspección/QA), sin regresiones.
- **T4:** docs (`motion.md`, `docs/README.md`) y actualización de la spec.
  (La spec se actualiza antes de T1, en la puerta de este Cambio.)

### 4.2 AppLayout — entrada de panel

**Spec:** `specs/layout/AppLayout/spec.md`.

**RF nuevo (EARS):**

- **RF-9:** CUANDO el usuario cambia de tab, ENTONCES EL SISTEMA entra el
  contenido del tabpanel con `opacity 0→1` y `translateX(±10px)→0` según la
  dirección (About→Resume desde la derecha; Resume→About desde la izquierda),
  con `--duration-slow`/`--ease-enter`; el wrapper se remonta con
  `key={active}` y **resetea el estado interno de la página** (carrusel en 0,
  dialog cerrado); el foco y `aria-labelledby` no cambian; con reduced motion
  el cambio es instantáneo; en impresión no hay animación.

**Archivos:**

- `AppLayout.tsx`: wrapper `data-motion-panel` con `key={active}` y
  `data-motion-direction`; dirección calculada desde el índice anterior (ref o
  estado). Preferir una función pura `getTabDirection(prev, next)` testeable.
- `AppLayout.module.css`: `@keyframes`/transition de entrada, reduced motion,
  print.
- `AppLayout.test.tsx`: wrapper/atributo, foco, ARIA, clics rápidos, reset de
  estado (carrusel/dialog), reduced motion no testeable en jsdom.
- `global.css`: `[data-motion-panel]` print (si se centraliza).
- `plan.md` / `tasks.md`: agregar el Cambio.

**Plan (decisiones):**

1. `key={active}` en el wrapper (no en el tabpanel ni en las páginas): remonta
   solo el contenido, no el panel ni NavTabs.
2. Dirección con un `ref` del índice anterior; la función pura se testea
   aparte.
3. `10px` de desplazamiento; no se anima la altura.
4. No se usa `flushSync` ni View Transitions.
5. El wrapper no tiene rol ni `tabIndex`; el tabpanel sigue siendo el foco.
6. Reset de estado documentado: es una consecuencia aceptada de `key`.

**Tareas (Tn):**

- **T1:** test rojo de dirección/wrapper/clics rápidos.
- **T2:** implementación del wrapper + CSS de entrada. Hecho: test verde,
  foco/ARIA intactos, sin jank (QA).
- **T3:** test de reset de estado (carrusel en 0 / dialog cerrado) y de
  reduced motion/print por inspección. Hecho: documentado en spec.
- **T4:** actualización de `plan.md`/`tasks.md` y QA visual con la app servida.

### 4.3 Sidebar — expansión de contactos

**Spec:** `specs/layout/Sidebar/spec.md`.

**Cambios:**

- Retirar “No animar la altura del bloque de contactos” (`:199`).
- Ajustar RF-3/RF-4 y Responsive: `.additional` usa grid `0fr/1fr` + wrapper;
  `visibility` diferida; ≥1200 forzado abierto; print expandido.
- Agregar RF-11 (EARS): CUANDO el usuario expande/colapsa los contactos, EL
  SISTEMA anima `grid-template-rows` (0.3s entrada / 0.22s salida) y los ítems
  entran con stagger de 30ms (máx. 4); el chevron rota en 0.2s; con reduced
  motion todo es instantáneo; en impresión no hay animación y los ítems quedan
  visibles.
- Actualizar Tests esperados: wrapper/clases, `aria-expanded`, Separator sin
  selector de profundidad, a11y colapsado/expandido.
- Actualizar “No hacer”: retirar la prohibición de altura; mantener “no
  subrayado animado” (decisión 6).

**Test de `Sidebar.test.tsx:317` (aprobado):** no se reubica el selector
estructural ni se cambia el contrato del Separator. Se reescribe con
`within()`/rol y **la misma aserción** (hay un Separator entre la info y la
lista). Como el `Separator` es un `<div aria-hidden>` **sin rol**, la query
aprobada es:

```ts
const region = screen.getByRole("complementary", { name: LABELS.region });
const email = within(region).getByRole("link", { name: "alex@example.com" });
const contactsList = email.closest("ul");
expect(contactsList?.previousElementSibling).toHaveAttribute("aria-hidden", "true");
```

No depende de la profundidad del wrapper y usa un query por rol + texto. No se
hace `getByRole("separator")` (el Separator no tiene rol por contrato).

**Archivos:**

- `Sidebar.tsx`: wrapper `additionalBody`; mantener `#sidebar-contacts`,
  clases y `aria-expanded`; sin `style` inline.
- `Sidebar.module.css`: grid + visibility, stagger, chevron, `@media
  (min-width: 1200px)`, reduced motion; eliminar `transition: color` inerte.
- `Sidebar.test.tsx`: query con `within()`/rol; misma aserción.
- `global.css`: print de `#sidebar-contacts` (expansión forzada, sin
  animación, ítems visibles).
- `plan.md` / `tasks.md`: agregar el Cambio.

**Tareas (Tn):**

- **T1:** test rojo del wrapper/clases y del Separator con `within()`.
- **T2:** implementación del grid + visibility + wrapper. Hecho: test verde,
  `aria-expanded` intacto, sin `display:none` en ≥1200.
- **T3:** stagger + chevron + reduced motion. Hecho: CSS inspeccionado, sin
  delays con reduced motion.
- **T4:** print + a11y colapsado/expandido. Hecho: ítems visibles en print,
  axe verde.
- **T5:** docs/spec/plan/tasks y QA visual (expansión, clics rápidos, altura).

### 4.4 TestimonialDialog — easing de entrada

**Spec:** `specs/content/TestimonialDialog/spec.md` (fila Entrada, `:79`).

- Cambiar `--ease-standard` → `--ease-enter`; mantener `--duration-base`
  0.2s y `@starting-style`; sin salida.
- `TestimonialDialog.module.css`: actualizar transición y comentario.
- No requiere test nuevo (CSS); se verifica por inspección/QA.
- Actualizar `plan.md`/`tasks.md` de la pieza (Cambio menor).

### 4.5 Documentos y specs a actualizar

| Documento / spec | Qué cambia |
|---|---|
| `tokens/tokens.css` | valores + `exit`/`stagger`, `ease-enter`/`ease-exit`, reduced motion |
| `foundations/motion.md` | tokens, catálogo, grid/altura, tema sin transiciones, reduced motion con delays |
| `src/styles/global.css` | supresión de tema; print de panel y contactos |
| `specs/foundation/Foundation/spec.md` (+ plan/tasks) | RF-9/RF-10; contenido real; tokens |
| `specs/layout/AppLayout/spec.md` (+ plan/tasks) | RF-9 entrada de panel y reset de estado |
| `specs/layout/Sidebar/spec.md` (+ plan/tasks) | RF-11 expansión; retiro de “No animar la altura” |
| `specs/content/TestimonialDialog/spec.md` (+ plan/tasks) | `--ease-enter` |
| `docs/README.md` | decisión nueva (#106) al aprobar |
| `docs/memory.md`, `README.md`, `docs/diagnostics.md` | al cerrar la implementación/puerta (#86) |

### 4.6 Verificación de la implementación

- `npm run lint`, `npm run typecheck`, `npm test` verdes por tarea y al cerrar
  cada pieza; `npm run build` al cerrar cada pieza/puerta (#80).
- DevTools → Performance/Animations: duraciones reales = tokens; sin jank;
  60 fps.
- Sin layout shift brusco al expandir/colapsar contactos; el contenido de abajo
  se desplaza suave.
- Clics rápidos en tabs y en el toggle: estado final correcto; el carrusel se
  resetea al cambiar tab (comportamiento documentado).
- `prefers-reduced-motion`: sin desplazamientos ni stagger; apertura/cierre
  instantáneos.
- Teclado: foco y `aria-selected`/`aria-expanded` correctos durante y después.
- Impresión: sin animaciones; contactos expandidos; ambos paneles.
- Cambio de tema: sin transiciones de color ni parpadeos.
- axe sin violaciones en colapsado/expandido y en ambos tabs.

---

## 5. Cambio de contenido previo (aprobado, pendiente de datos)

**Objetivo:** reemplazar el contenido de ejemplo de `src/content/cv.{en,es}.json`
por el CV real, en ambos idiomas, sin tocar el esquema.

### 5.1 Datos y assets

El usuario pasa el contenido real en un archivo. Debe traer, por idioma:

| Campo | Formato / restricción |
|---|---|
| `profile.name` | texto |
| `profile.headline` | texto (Badge del Sidebar) |
| `profile.avatar.src` | ruta pública `/images/...` o URL `https://...` |
| `profile.about` | array de párrafos (≥1) |
| `profile.downloadCvUrl` | opcional; ruta pública o `https://...`; si falta, no se muestra el CTA |
| `contact[]` | `id` kebab-case, `type` ∈ `email/location` (decisión: **sin teléfono ni WhatsApp**), `value`; `href` opcional |
| `social[]` | `id`, `network` ∈ lista del esquema, `url` https |
| `services[]` | `id`, `title`, `description`, `icon` ∈ lista del esquema |
| `education[]` / `experience[]` | `id`, `title`, `organization`, `start`/`end` (`YYYY` o `YYYY-MM`; `end: null` = actualidad), `description` |
| `skills[]` | strings |
| `testimonials[]` | **array vacío** (decisión aprobada) |

**Assets:**

- `public/images/avatar.*` (foto real; el contenido actual usa
  `/images/avatar.png`).
- Si hay `downloadCvUrl`: PDF en `public/cv/...` (o URL https). El link debe
  funcionar con el `base` de despliegue; el `assetUrl` agregado localmente solo
  cubre `HexAvatar`/Sidebar, **no** el `href` del CTA. Verificar antes de
  publicar en GitHub Pages.
- Sin testimonios reales no hay avatares de testimonios que agregar.

### 5.2 Verificación de la sección de testimonios vacía

**La sección ya se oculta correctamente:**

- `AboutPage.tsx:133`: `cv.testimonials.length > 0` → no monta ni el `h2` ni el
  carrusel con `[]`.
- `TestimonialCarousel.tsx:263`: con `testimonials.length === 0` devuelve
  `null`.
- `AboutPage/spec.md` RF-2 lo exige; `TestimonialCarousel/spec.md` RF-1 lo
  exige.
- No hay que tocar código de producción por `testimonials: []`.

**Pero los tests de `AboutPage.test.tsx` asumen contenido no vacío y hay que
ajustarlos:**

| Test | Problema con `testimonials: []` | Ajuste propuesto |
|---|---|---|
| Test 4 (región de testimonios, `:409-483`) | Lanza si `TESTIMONIALS.length === 0` | Usar un fixture local no vacío (`TESTIMONIALS_FIXTURE`, 1–2 ítems) inyectado por el harness `useCv`; mantener los asserts de región/hermandad/plantillas |
| Test 5b (vacío, `:486-529`) | Lanza si el contenido real no trae testimonios | Quitar el throw; con el contenido real vacío, verificar ausencia de `h2`/región y `h1` único. Añadir un caso complementario con el fixture no vacío si se quiere discriminar ambos lados |
| Test 6 (locale es, `:531-603`) | Lanza si `cv.es.testimonials` está vacío | Quitar testimonios del escenario o usar el fixture; conservar about/services y los textos de `uiEs` |
| Test 7 (a11y) | No depende de testimonios | Sin cambio |
| Test 8 (className) | No depende de testimonios | Sin cambio |

El fixture debe ser datos ficticios (D4), no el CV real, y vivir en el archivo
de test (o en un helper de test) sin tocar `src/content`.

### 5.3 Cambio al test de contenido (Foundation)

Aprobado:

- **Quitar solo** el caso “copia fiel” de `src/content/content.test.ts:101-106`
  (`keeps every other field identical to data/cv.example.{en,es}.json`).
- **Mantener** el test del `$schema` (`:96-99`).
- **Agregar/mantener** un test que valide **ambos** archivos de ejemplo contra
  el schema:

```ts
it("validates both example files against the schema", () => {
  expect(validateCv(exampleEn)).toBe(true);
  expect(validateCv(exampleEs)).toBe(true);
});
```

- `exampleEn`/`exampleEs` se siguen usando (el segundo deja de ser un import
  sin uso).
- `exampleBase` (mutaciones en memoria) se conserva para los rechazos.
- El título del `describe` “cv.{en,es}.json (copies of the data/ examples)”
  pasa a algo como “cv.{en,es}.json (content files)”; el test del `$schema`
  sigue igual.

### 5.4 Impacto en la spec de Foundation

- Anatomía: “los dos JSON se crean COPIANDO data/cv.example…” → “contenido real
  validado; los ejemplos quedan en `data/` para tests”.
- Tests esperados: reemplazar “copia fiel” por “el contenido real valida y
  mantiene paridad/orden”; agregar la validación de ambos ejemplos.
- RF-7 no cambia (solo datos validados).
- “No hacer”: no editar los ejemplos para que coincidan con el CV real.

### 5.5 Plan del Cambio de contenido

1. Recibir del usuario el archivo con el CV real en/es y los assets.
2. Actualizar `cv.en.json` y `cv.es.json` manteniendo `$schema`, `locale`,
   ids/orden y campos no traducibles.
3. Ajustar `content.test.ts` (quitar solo el test de copia; agregar validación
   de ambos ejemplos).
4. Ajustar `AboutPage.test.tsx` para el escenario `testimonials: []` (§5.2).
5. Actualizar la spec de Foundation (Anatomía/Tests/No hacer) con aprobación.
6. Copiar assets a `public/…`; verificar rutas con `assetUrl`/base.
7. `npm run validate:content`, `npm test`, `npm run build`.
8. QA visual: Sidebar (avatar/contactos/CTA), About (servicios; sin sección de
   testimonios), Resume (education/experience/skills), ambos idiomas y temas.
9. Recién después, arrancar los Cambios de motion.

**Tareas (Tn) propuestas:** T1 datos + assets; T2 tests/spec; T3 validación +
QA. No se escriben todavía en `tasks.md` hasta la aprobación.

---

## 6. Aprobaciones y puertas

### Aprobado

1. **Ubicación:** esta propuesta vive en `specs/motion/proposal.md`.
2. **Tokens:** `base 0.2s`, `slow 0.3s`, `exit 0.22s`, `stagger 0.03s`,
   `ease-enter`, `ease-exit`; `fast`/`standard`/`emphasized` sin cambio.
3. **Tabs:** alternativa B; documentar que `key={active}` remonta la página y
   resetea su estado interno (carrusel/dialog).
4. **Sidebar:** grid `0fr→1fr`; retirar la prohibición de altura; test con
   `within(region) → closest("ul") → previousElementSibling`, sin cambiar el
   contrato del Separator.
5. **Tema:** `data-theme-switching` con test de aplicación/remoción/cleanup.
6. **Reduced motion:** instantáneo (0.01ms), sin fundido.
7. **Dialog:** `--ease-enter`; sin subrayado animado en contactos.
8. **Contenido:** `testimonials: []`; `contact[]` sin teléfono ni WhatsApp;
   quitar solo el caso “copia fiel” y validar ambos ejemplos contra el schema.
9. **Árbol sucio:** no arrancar hasta confirmación del usuario.

### Pendiente para avanzar

1. **CV real:** el usuario lo pasa en un archivo, con assets.
2. **Confirmación del árbol limpio:** el usuario avisa cuando resolvió
   `src/utils/assetUrl.ts`, `HexAvatar.tsx`, `Sidebar.tsx` y
   `vite.config.ts`.
3. **Aprobación de los specs/planes/tareas** de §4 (Foundation, AppLayout,
   Sidebar, TestimonialDialog) antes de escribir código.
4. **Aprobación del ajuste de tests de AboutPage** por `testimonials: []`
   (§5.2); es una consecuencia necesaria del contenido real vacío.
5. **Specs en `specs/`:** esta propuesta está en `specs/motion/proposal.md`;
   los Cambios se vuelcan a las specs existentes recién con la aprobación de
   cada puerta.
