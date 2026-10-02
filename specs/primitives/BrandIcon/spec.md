# BrandIcon
Estado: aprobada

## Propósito

Logos de redes sociales como SVG inline. Lucide ya no incluye íconos de
marca, así que este componente los provee aparte.

## Requisitos (EARS)

- RF-1: CUANDO el componente recibe un `network` de `SOCIAL_NETWORKS`, ENTONCES EL SISTEMA renderiza un `<svg viewBox="0 0 24 24" fill="currentColor">` con un `path` no vacío.
- RF-2: EL SISTEMA mantiene `BRAND_NAMES` con un nombre visible no vacío para cada red de `SOCIAL_NETWORKS`.
- RF-3: EL SISTEMA renderiza el logo siempre decorativo (`aria-hidden="true"` y `focusable="false"`): el nombre accesible lo aporta el link contenedor con `BRAND_NAMES`.
- RF-4: SI una red de `SOCIAL_NETWORKS` no existe en la versión instalada de Simple Icons, ENTONCES se usa el SVG oficial de la marca como constante y la decisión queda registrada en `docs/BACKLOG.md`.
- RF-5: EL SISTEMA colorea el logo con `currentColor` (monocromo, sin gradiente ni deformación) y lo dimensiona solo por CSS vía `--icon-size`.
- RF-6: EL SISTEMA escala el logo por el token `--size-social-icon`; BrandIcon no declara `@media` propios.

## Fuente de los paths

- **Simple Icons** (licencia CC0): paquete `simple-icons`, importando solo los
  íconos necesarios (`import { siGithub, siX, … } from "simple-icons"`), que
  exponen `path` y `title` para un `viewBox="0 0 24 24"`.
- **Verificar al instalar** que cada red de `SOCIAL_NETWORKS` (`@data/constants`) exista en la
  versión instalada. Simple Icons retira marcas a pedido de sus dueños (LinkedIn
  es un caso conocido). Para una red faltante: SVG oficial del kit de prensa de
  la marca, guardado como constante en `BrandIcon/paths.ts` con un comentario
  de origen. Anotar la decisión en `docs/BACKLOG.md` si queda pendiente.
- Respetar las guías de marca: el logo no se deforma ni se recolorea con
  gradientes; se usa monocromo con `currentColor`.

## Anatomía

```html
<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
  <path d="…" />   <!-- path de Simple Icons (o SVG oficial de la marca) -->
</svg>
```

## API

```ts
import type { SocialNetwork } from "@data/cv.types.generated";

export interface BrandIconProps {
  network: SocialNetwork;
  className?: string;
}

/** Nombre visible de cada red, para aria-labels ("GitHub", "LinkedIn", "X"…). */
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
- Color heredado del link padre (el Sidebar define color y hover).

## Estados

Sin estados propios; hereda el color del link.

## Responsive

Sin `@media` propios: el tamaño escala por el token `--size-social-icon`.

## Accesibilidad

- Siempre decorativo: `aria-hidden="true"`, `focusable="false"`. El nombre
  accesible lo pone el link que lo contiene (`aria-label={BRAND_NAMES[network]}`).

## Tests esperados

- Renderiza un `svg` con un `path` no vacío para **cada** valor de `SOCIAL_NETWORKS`.
- `fill="currentColor"` y `aria-hidden="true"`.
- `BRAND_NAMES` tiene entrada para cada red (el tipo `Record` lo garantiza; el test
  verifica que ningún valor sea string vacío).
- `expectNoA11yViolations` sin violaciones.

## No hacer

- No usar íconos genéricos (Link/Globe) como sustituto silencioso: si falta un
  logo, se documenta.
- No copiar SVG del tema de referencia.
