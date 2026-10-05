# BrandIcon
Estado: aprobada

## Propósito

Logos de redes sociales como SVG inline. Lucide ya no incluye íconos de
marca, así que este componente los provee aparte.

## Requisitos (EARS)

- RF-1: CUANDO el componente recibe un `network` de `SOCIAL_NETWORKS`, ENTONCES EL SISTEMA renderiza un `<svg fill="currentColor">` con el `viewBox` de su entrada en `paths.ts` (default `0 0 24 24`) y uno o más `path` no vacíos.
- RF-2: EL SISTEMA mantiene `BRAND_NAMES` con un nombre visible no vacío para cada red de `SOCIAL_NETWORKS`.
- RF-3: EL SISTEMA renderiza el logo siempre decorativo (`aria-hidden="true"` y `focusable="false"`): el nombre accesible lo aporta el link contenedor con `BRAND_NAMES`.
- RF-4: SI una red de `SOCIAL_NETWORKS` no existe en la versión instalada de Simple Icons, ENTONCES se usa el SVG oficial de la marca como constante; el builder **reporta** la sustitución y el orchestrator la registra en `docs/BACKLOG.md` (los subagentes no escriben en `docs/`). Verificación: chequeo de coberturas al instalar (inspección del reviewer; no testeable en runtime).
- RF-5: EL SISTEMA colorea el logo con `currentColor` (monocromo, sin gradiente ni deformación) y lo dimensiona solo por CSS vía `--icon-size` (inspección del CSS; no testeable en jsdom).
- RF-6: EL SISTEMA escala el logo por el token `--size-social-icon`; BrandIcon no declara `@media` propios (inspección del CSS).

## Fuente de los paths

- **Simple Icons** (licencia CC0): paquete `simple-icons`, importando solo los
  íconos necesarios (`import { siGithub, siX, … } from "simple-icons"`), que
  exponen `path` y `title` para un `viewBox="0 0 24 24"`.
- **Verificar al instalar** que cada red de `SOCIAL_NETWORKS` (`@data/constants`) exista en la
  versión instalada. Simple Icons retira marcas a pedido de sus dueños (LinkedIn
  es un caso conocido). Para una red faltante: SVG oficial del kit de prensa de
  la marca, guardado como constante en `BrandIcon/paths.ts` con un comentario
  de origen (registro a cargo del orchestrator, vía el reporte del builder).
- **Estructura de `paths.ts`**: por red, `{ viewBox: string; d: string | string[] }`.
  Un SVG oficial que no sea cuadrado 24×24 **conserva su viewBox**: no se
  deforma ni se recorta; puede aportar varios paths.
- Respetar las guías de marca: el logo no se deforma ni se recolorea con
  gradientes; se usa monocromo con `currentColor`.

## Anatomía

```html
<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
  <path d="…" />   <!-- uno o más <path>; el viewBox puede ser propio del logo oficial -->
</svg>
```

## API

```ts
import type { SocialNetwork } from "@data/cv.types.generated";

export interface BrandIconProps {
  network: SocialNetwork;
  /** Se UNE a la clase base del `<svg>` raíz (no la reemplaza). */
  className?: string;
}

/** Nombre visible de cada red, para aria-labels. Valores literales definidos
    en esta spec/código ("GitHub", "LinkedIn", "X"…), NO derivados del `title`
    de simple-icons. */
export const BRAND_NAMES: Record<SocialNetwork, string>;
```

## Estilos y tokens

- `<svg viewBox="0 0 24 24" fill="currentColor">`.
- **Tamaño solo por CSS**, con el mismo mecanismo que `Icon`:
  `width/height: var(--icon-size, var(--size-social-icon));`. El default
  `--size-social-icon` ya escala (16px < 580 → 18px). Para otro tamaño, el
  padre pasa una `className` al `BrandIcon` que fije `--icon-size` (registrada
  sin herencia: en un contenedor no tiene efecto). No hay prop `size` (los
  atributos SVG no aceptan `var()`).
- Color heredado del link padre: BrandIcon usa `currentColor` puro, sin
  opacidad ni color propio; el color base y el hover los fija el Sidebar (su spec).

## Estados

Sin estados propios; hereda el color del link.

## Responsive

Sin `@media` propios: el tamaño escala por el token `--size-social-icon`.

## Accesibilidad

- Siempre decorativo: `aria-hidden="true"`, `focusable="false"`. El nombre
  accesible lo pone el link que lo contiene (`aria-label={BRAND_NAMES[network]}`).

## Tests esperados

- Renderiza un `svg` con al menos un `path` no vacío para **cada** valor de `SOCIAL_NETWORKS`.
- `fill="currentColor"`, `aria-hidden="true"` y `focusable="false"`.
- `BRAND_NAMES` tiene entrada para cada red (el tipo `Record` lo garantiza; el test
  verifica que ningún valor sea string vacío).
- `expectNoA11yViolations` sin violaciones.

## No hacer

- No usar íconos genéricos (Link/Globe) como sustituto silencioso: si falta un
  logo, se documenta.
- No copiar SVG del tema de referencia.
