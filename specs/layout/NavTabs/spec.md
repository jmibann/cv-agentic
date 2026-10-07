# NavTabs
Estado: implementada

## Propósito

Navegación principal entre los paneles **About** y **Resume**, con semántica
de **tablist**. Reemplaza al menú hamburguesa del tema: siempre visible, sin
drawer, en todos los breakpoints. Visualmente es una solapa (`CornerTab`) en la
esquina superior derecha de la card de contenido.

Referencia visual: tab con fondo `surface-raised`, borde fino, ítem activo en
color de acento, inactivos en color de texto.

## Requisitos (EARS)

- RF-1: CUANDO el componente recibe `items`, ENTONCES EL SISTEMA renderiza un `role="tablist"` nombrado con un `role="tab"` por item en ese orden, aplicando roving tabindex (solo el tab activo con `tabIndex=0`).
- RF-2: EL SISTEMA hace que **todos los tabs apunten con `aria-controls` al mismo `panelId`** (un único tabpanel); la existencia y el contenido de ese panel son responsabilidad de AppLayout, no verificables en esta pieza.
- RF-3: CUANDO el usuario hace click en un tab inactivo, ENTONCES EL SISTEMA invoca `onChange(id)` una vez; SI hace click en el tab activo, ENTONCES no lo invoca.
- RF-4: CUANDO el foco está en un tab y se pulsa `keydown` de Flecha ←/→, Home o End, ENTONCES EL SISTEMA mueve el foco al tab resultante (vuelta circular en los extremos) **y emite `onChange` de ese tab** (activación automática: lo visual depende del re-render del padre, que es controlado); SI el tab resultante es el mismo (un solo item), ENTONCES no emite `onChange`; SI se pulsa Espacio, ENTONCES EL SISTEMA hace `preventDefault` (no scrollea la página) y activa por click nativo; Enter y las demás teclas quedan al comportamiento nativo sin efecto adicional. ↑/↓ no mueven el foco (tablist horizontal).
- RF-5: EL SISTEMA distingue el tab activo con `--color-accent-text` y `aria-selected="true"`; los inactivos van al 80% de opacidad y al 100% con subrayado de 2px en hover. Verificación: `aria-selected` por test; el resto por inspección del CSS + QA F5.
- RF-6: EL SISTEMA mantiene la navegación visible en todos los breakpoints, sin hamburguesa, drawer ni overlay. En impresión la ocultan los estilos compartidos (G-D: ningún `@media print` propio).
- RF-7: SI `items` viene vacío, ENTONCES EL SISTEMA no renderiza nada (un tablist sin tabs es inválido para axe).

**Invariantes del consumidor (AppLayout):** `activeId` debe coincidir siempre con un `item.id` (useHashTab garantiza id válido o default); NavTabs **no** valida ni hace fallback. Los `item.id` se usan tal cual en `getTabId`: sin espacios ni caracteres problemáticos (invariante de AppLayout/`useHashTab`).

## Anatomía

```html
<Box variant="outer" as="section">                 ← card de contenido (AppLayout)
  <CornerTab size="md" placement="float">
    <div role="tablist" aria-label="Sections" aria-orientation="horizontal">
      <button role="tab" id="tab-about"  aria-selected="true"  aria-controls="main-panel" tabindex="0">About</button>
      <button role="tab" id="tab-resume" aria-selected="false" aria-controls="main-panel" tabindex="-1">Resume</button>
    </div>
  </CornerTab>
  <div role="tabpanel" id="main-panel" aria-labelledby="tab-about" tabindex="0"> … </div>
</Box>
```

NavTabs renderiza **solo** la CornerTab con el tablist. El tabpanel lo
renderiza AppLayout, usando `panelId` y el id del tab activo (`getTabId`).

Hay **un único tabpanel** cuyo contenido cambia; todos los tabs lo controlan
(`aria-controls` apunta al mismo id). Es válido para el patrón y evita montar
paneles ocultos.

## API

```ts
export interface NavTabItem {
  id: string;      // "about" | "resume"
  label: string;   // ya traducido
}

export interface NavTabsProps {
  items: readonly NavTabItem[];
  activeId: string;                 // controlado
  onChange: (id: string) => void;
  panelId: string;                  // id del tabpanel
  label: string;                    // aria-label del tablist, traducido
  /** Se une al raíz de la pieza — se transmite a la clase base de `CornerTab` (G-B). */
  className?: string;
}

/** Id del elemento tab para un item. Lo usa AppLayout para aria-labelledby. */
export const getTabId = (id: string) => `tab-${id}`;
```

## Comportamiento

| Interacción | Resultado |
|---|---|
| Click en un tab | `onChange(id)`; el foco queda en el tab pulsado (nativo del `<button>`, NavTabs no re-gestiona el foco tras click) |
| Flecha → / ← (foco en un tab) | Mueve el foco al siguiente/anterior **y emite `onChange`** (activación automática; lo visual depende del padre), con vuelta circular |
| Home / End | Foco y `onChange` del primero / último |
| Tab | Sale del tablist hacia el tabpanel (solo el tab activo es tabulable) |
| Enter | Activa el tab con foco (click nativo del `<button>`) |
| Espacio | `preventDefault` (no scrollea la página) + activa por click nativo |
| Click en el tab ya activo | No llama `onChange` |

**Roving tabindex:** el tab activo tiene `tabIndex=0`; el resto, `-1`.

## Sincronización con la URL

La hace el hook `useHashTab` en AppLayout, no NavTabs (NavTabs es controlado).
Spec, comportamiento y tests: [specs/hooks/useHashTab/spec.md](../../hooks/useHashTab/spec.md).

Restricción que afecta a este componente: **ningún elemento del DOM puede
tener `id="about"` ni `id="resume"`**. Los tabs usan `getTabId` (`tab-about`,
`tab-resume`) y el panel es `main-panel`.

## Estilos y tokens

| Parte | Valor |
|---|---|
| Contenedor | `CornerTab size="md" placement="float"` (absoluta < lg, flotante ≥ lg) |
| tablist | `display: flex; align-items: center; gap: var(--nav-tab-gap);` (24px < 992 → 40px) |
| tab | Sin fondo ni borde; `font-size: var(--font-size-nav); font-weight: var(--font-weight-medium); color: var(--color-text); padding-block: var(--space-2); white-space: nowrap; cursor: pointer;` |
| tab inactivo | `opacity: 0.8` (4.92:1 claro / 7.96:1 oscuro sobre `surface-raised`, registrado en `docs/tokens/contrast.md`); `text-decoration: underline 2px transparent; text-underline-offset: 0.375rem;` |
| tab inactivo hover | `opacity: 1;` `text-decoration-color: currentColor` (aparece el subrayado) |
| tab activo (`[aria-selected="true"]`) | `opacity: 1; color: var(--color-accent-text);` sin subrayado, sin cambio en hover |
| Focus-visible | `outline: var(--focus-ring-width) solid var(--color-focus-ring); outline-offset: var(--focus-ring-offset); border-radius: var(--radius-8);` |
| Transición | `color`, `opacity` y `text-decoration-color` en `var(--duration-base) var(--ease-standard)` |

El hover no usa `--color-heading`: en claro es igual a `--color-text` y el
cambio no se vería. Usa opacidad + subrayado, que funcionan igual en ambos temas.

Medidas de referencia (tamaño completo, ≥ lg): alto 60px, padding horizontal
32px, separación entre ítems 40px, texto 16px/500. En < lg: alto 48px, padding
20px, separación 24px, texto 14px/500. Todo resuelto por tokens.

El activo se distingue **por color** (acento vs texto) con contrastes
≥ 5.47:1 en ambos temas; además `aria-selected` lo expone a tecnologías de asistencia.

## Estados

| Estado | Efecto |
|---|---|
| Inactivo | texto `--color-text` al 80% |
| Inactivo hover | 100% + subrayado 2px |
| Activo | `--color-accent-text`, 100%, sin subrayado |
| Focus-visible | anillo estándar (`--focus-ring-*`) |

## Responsive

| Viewport | Comportamiento |
|---|---|
| ≥ lg (992) | Tab tamaño completo y **flotante** (`placement="float"`): el `h1` del panel fluye a su izquierda usando el ancho real de la tab, sin reservas fijas. **Dependencia de contrato (CornerTab → float):** el contenido que sigue al tab en el tramo que convive con ella **no** puede crear contexto de formato propio (flex/grid/`overflow`≠visible/`flow-root`); lo garantiza AppLayout y lo verifica el reviewer en F4/F5. |
| < lg | Tab compacta, **siempre visible**, anclada a la derecha. El `h1` del panel va debajo (AppLayout agrega el espacio). |

No hay hamburguesa, drawer ni overlay en ningún tamaño. "Con 2 ítems entra en 320px" es verificación de **QA F5** (no de test ni inspección).

## Accesibilidad

- `role="tablist"` con `aria-label` y `aria-orientation="horizontal"`.
- `role="tab"` en `<button type="button">`, con `id`, `aria-selected`, `aria-controls`.
- Tabpanel con `aria-labelledby` = id del tab activo y `tabIndex=0`
  (el panel empieza con texto, no con un control).

## Tests esperados

1. Renderiza un `tablist` con el nombre recibido y un `tab` por item, en orden.
2. Solo el tab activo tiene `aria-selected="true"` y `tabIndex=0`; el resto `false` / `-1`.
3. Cada tab tiene `id = getTabId(item.id)` y `aria-controls = panelId`.
4. Click en un tab inactivo llama `onChange(id)` una vez.
5. Click en el tab activo no llama `onChange`.
6. Flecha derecha desde el último vuelve al primero: foco + `onChange`.
7. Flecha izquierda desde el primero va al último.
8. Home / End enfocan y activan primero / último.
9. Con `items` de un solo elemento, las flechas no fallan ni llaman `onChange`.
10. Con `items` vacío **no renderiza nada** (`container` vacío): un tablist sin tabs es inválido para axe.
11. **No existe** ningún botón de menú (`queryByRole("button", { name: /menu|menú/i })` es null).
12. `expectNoA11yViolations` sin violaciones (renderizado junto a un tabpanel con el id correcto).

## No hacer

- No usar `<a href="#about">` para los tabs (la semántica elegida es tablist).
- No renderizar ambos paneles ocultos con `hidden` salvo en `@media print`
  (lo resuelve AppLayout).
- No reintroducir el botón hamburguesa ni el estado abierto/cerrado.
