# Sidebar
Estado: implementada

## Propósito

Tarjeta de identidad: avatar, nombre, rol, redes sociales, datos de contacto
y descarga del CV. Vertical y fija en desktop (xl); horizontal y con
contactos colapsables en tamaños menores.

## Requisitos (EARS)

- RF-1: EL SISTEMA renderiza un landmark `<aside>` con `aria-label` traducido que contiene avatar, nombre, rol, redes, contactos y la descarga del CV.
- RF-2: CUANDO existe `profile.downloadCvUrl`, ENTONCES EL SISTEMA muestra el link "Download CV" con el atributo `download`; SI no existe, ENTONCES no renderiza ese botón.
- RF-3: CUANDO el viewport es menor que xl, ENTONCES EL SISTEMA agrupa los contactos tras un botón disclosure (`aria-expanded` + `aria-controls`); SI el viewport es xl o mayor, ENTONCES los contactos están siempre visibles y el botón de disclosure queda **oculto solo por CSS** (mecanismo CSS-only, decisión 8=a: `@media (min-width: 1200px)` en el módulo del Sidebar fuerza `display: block` en `.additional` y oculta el botón; el botón sigue montado pero no visible ni operable — no hay render condicional por ancho). *Cambio F5 2026-10-08: el disclosure ya no usa CornerTab (ver Anatomía); la nota de coherencia con CornerTab RF-4 queda sin objeto acá.*
- RF-4: CUANDO el usuario expande los contactos, ENTONCES EL SISTEMA alterna el **nombre accesible** del botón (`aria-label` = `showContacts` / `hideContacts`; el botón es icon-only desde el Cambio F5 2026-10-08, ver "Botón de disclosure" más abajo) y rota el chevron 180° (chevron = `Icon name="chevron-down"` decorativo con clase de rotación en el módulo: `transform`, `--duration-base`).
- RF-5: EL SISTEMA deriva el `href` de cada contacto con `getContactHref`: prioridad al `href` explícito; `email` → `mailto:`, `phone` → `tel:` sin `+` salvo el inicial, `whatsapp` → `https://wa.me/` solo dígitos y `location` → sin link; SI tras la limpieza `phone` o `whatsapp` no conserva dígitos, ENTONCES el resultado es `undefined` y el valor se muestra como texto.
- RF-6: EL SISTEMA abre en pestaña nueva con `target="_blank"` y `rel="noopener noreferrer"` **únicamente** los links externos: los de redes sociales y los de contacto derivados explícitamente como URL (p. ej. `href` de sitio, y `whatsapp` vía `https://wa.me/…`, decisión 10); `mailto:` y `tel:` se abren **sin** `target` ni `rel`. Cada link de red lleva `aria-label` igual al nombre de la marca.
- RF-7: EL SISTEMA aplica el layout de la pieza por breakpoint (grilla en tamaños menores a xl, vertical y centrado en xl, con el avatar sobresaliendo) usando tokens, sin medidas literales en `@media`. El **sticky** con alto ≥ 900px lo aplica AppLayout sobre `.aside` (no es verificable en la pieza; lo verifica el reviewer en F4/F5).
- RF-8: EL SISTEMA recibe todos los datos por props (`profile`, `contact`, `social`, `labels`) y no consume `useCv()` ni el hook de idioma.
- RF-9: SI `contact` viene vacío, ENTONCES EL SISTEMA no renderiza la lista de contactos; SI `social` viene vacío, ENTONCES no renderiza la lista de redes; SI no hay contactos **ni** `downloadCvUrl`, ENTONCES tampoco renderiza el `Separator` (contraparte EARS del Test 8; un `.additional` sin contenido no deja huérfano el separador).
- RF-10: ENTONCES en impresión los contactos quedan siempre expandidos y el botón Show/Hide se oculta: es responsabilidad de los **estilos compartidos** (G-D; `foundations/layout.md` → Impresión), no del Sidebar, que no declara `@media print`. Para que puedan cumplirlo, el colapso de `.additional` se hace por **clase del módulo** (nunca `style` inline) y el contenedor del disclosure es alcanzable (`id="sidebar-contacts"`). La raíz del botón de disclosure renderiza el hook `data-print-hide` (Cambio F5; `button[data-print-hide]` de `global.css` lo oculta ganando la especificidad a la clase del módulo — hallazgo B-3).

## Anatomía

```html
<Box variant="outer" as="aside" aria-label="Profile">
  <!-- Cambio F5 2026-10-08: el disclosure ya NO usa CornerTab (la tab con fondo
       `surface-raised` solapaba el nombre a 375px — hallazgo D1 de qa-report).
       Botón icon-only absoluto en la esquina superior derecha del raíz, sin
       fondo; `data-print-hide` = hook del contrato de impresión (#103). -->
  <button class="disclosure" data-print-hide aria-label="Show Contacts" aria-expanded="false" aria-controls="sidebar-contacts">
    <Icon name="chevron-down" aria-hidden="true" />   <!-- decora; rota 180° expandido; `aria-label` alterna show/hide (RF-4) -->
  </button>

  <div class="baseInfo">
    <figure class="avatar"><img src alt /></figure>
    <div class="identity">                            <!-- < md / md–lg: alineado al inicio, junto al avatar (Cambio F5) -->
      <p class="name">Alex Rivera</p>
      <Badge>Frontend Developer</Badge>
    </div>
    <ul class="social" aria-label="Social profiles">  <!-- < xl: centrado en el espacio disponible (Cambio F5) -->
      <li><a href="…" aria-label="GitHub" target="_blank" rel="noopener noreferrer"><BrandIcon network="github" /></a></li>
    </ul>
  </div>

  <div id="sidebar-contacts" class="additional">   <!-- colapsable < xl, siempre visible ≥ xl -->
    <Separator />
    <ul class="contacts">
      <li>
        <IconBox icon="mail" />
        <div><Overhead>Email</Overhead><a href="mailto:…">alex@example.com</a></div>
      </li>
      …
    </ul>
    <Button href={downloadCvUrl} download icon="download" fullWidth>Download CV</Button>  <!-- solo si existe -->
  </div>
</Box>
```

El nombre es un `<p>` con estilo propio: el único `h1` de la página es el
del tabpanel.

## API

```ts
import type { ContactItem, Profile, SocialLink } from "@data/cv.types.generated";

export interface SidebarLabels {
  region: string;          // "Profile"
  social: string;          // "Social profiles"
  showContacts: string;    // "Show Contacts"
  hideContacts: string;    // "Hide Contacts"
  downloadCv: string;      // "Download CV"
  contact: Record<ContactItem["type"], string>;  // Email, Phone, WhatsApp, Location
}

export interface SidebarProps {
  profile: Profile;
  contact: readonly ContactItem[];
  social: readonly SocialLink[];
  labels: SidebarLabels;
  /** Se une al raíz: se transmite al Box `as="aside"` (Box aplica la unión en su raíz, G-B). */
  className?: string;
}
```

Función pura exportada y testeada aparte; **vive en la carpeta de la pieza**
(`src/components/Sidebar/getContactHref.ts`, `.ts` sin React — C1 — re-exportada
por `index.ts` para poder testeala desde otros consumidores, decisión 11):

```ts
/** href del contacto: el explícito si existe; si no, derivado por tipo. location → undefined. */
export function getContactHref(item: ContactItem): string | undefined;
```

Reglas exactas (si hay `item.href`, se devuelve tal cual y no se aplica nada de esto):

| type | Resultado | Limpieza de `value` |
|---|---|---|
| `email` | `mailto:<value>` | `trim()`; sin otros cambios |
| `phone` | `tel:<resultado>` | se conserva un `+` **solo** si es el primer carácter; se eliminan todos los demás caracteres que no sean dígitos (espacios, guiones, puntos, paréntesis) |
| `whatsapp` | `https://wa.me/<resultado>` | **solo dígitos** (se elimina también el `+`: wa.me espera el número internacional sin `+`) |
| `location` | `undefined` | — (texto plano, sin link) |

Si tras la limpieza `phone`/`whatsapp` no queda ningún dígito → `undefined` (se muestra como texto).

Mapa de íconos por tipo: email → `mail`, phone → `phone`,
whatsapp → `message-circle`, location → `map-pin`.

## Estilos y tokens

**Avatar**
- `width/height: var(--size-avatar-sidebar)`; `border-radius: var(--radius-avatar-sidebar)`
  (20px < 768 → 32px); `border: var(--size-avatar-border) solid var(--color-surface)`;
  `box-shadow: var(--shadow-avatar)`; `background-color: var(--color-surface-muted)`;
  `overflow: hidden`; `img { object-fit: cover; width: 100%; height: 100%; }`.
- El `img` **no** lleva atributos HTML `width`/`height` (decisión 9: el tamaño es del token y escala por breakpoint; no hay un único valor honesto que escribir) ni `decoding="async"` explícito — dimensiona solo el CSS.

**Nombre**: `--font-size-name`, `--font-weight-medium`, `--color-heading`, `margin-bottom: var(--sidebar-name-gap)` (10px < 768 → 14px).

**Redes**: `BrandIcon` con su tamaño por defecto (`--size-social-icon`: 16px < 580 → 18px).
Color `--color-text-muted` (sin `opacity`: 5.02:1 claro / 6.01:1 oscuro, registrado en
`docs/tokens/contrast.md`); hover y foco → `color: var(--color-accent-text)`, transición de
`color` `--duration-base`. Foco: anillo estándar (`--focus-ring-*`). Separación `0.75rem`.
Área táctil mínima 24×24px (padding en el link).

**Contactos**: ítem `display: flex; align-items: center; gap: var(--space-4);`
IconBox + bloque de texto. Valor en `--color-heading`,
`font-size: var(--font-size-contact-value)` (13px < 580 → 14px), una línea con `text-overflow: ellipsis` (el valor completo va en
`title` para verlo en hover). Links sin subrayado; subrayado en hover/foco.

**Download CV**: `margin-top: var(--sidebar-cta-gap)` (16px < 580 → 20px en 580–767 → 32px en 768–1199 → 30px en xl).

**`.additional` (decisión 11, "gap")**: pila vertical con `gap` de token para separar Separator, lista de contactos y CTA. Excepción acumulativa obligatoria (Separator RF-4): en el **tramo** que limita con el `Separator` el contenedor no suma su `gap` — el espacio bloque-línea-bloque lo aporta solo el `margin-block` del Separator; el plan debe resolver el mecanismo (p. ej. `margin-block` compensado del Separator como item de flex) sin inline styles.

## Estados

| Elemento | Estados |
|---|---|
| Link de red social | reposo `--color-text-muted`; hover/foco `--color-accent-text`; foco con anillo estándar |
| Link de contacto | sin subrayado; subrayado en hover/foco; foco con anillo estándar |
| Botón de disclosure | `aria-expanded` false/true; `aria-label` alterna `showContacts`/`hideContacts`; chevron rota 180° al expandir; foco con anillo estándar |
| Download CV | estados de `Button` |

## Responsive

| Viewport | Layout |
|---|---|
| **< md (768)** | Grilla `auto 1fr`: avatar (**6.375rem** — −15% del valor previo 7.5rem, Cambio F5 2026-10-08 por solapamiento medido a 375px; aplicado en `tokens.css:201` el 2026-10-08) a la izquierda; **nombre y headline desplazados a la izquierda, junto al avatar** (bloque de identidad alineado al inicio, sin reserves de columna bajo la esquina superior derecha); redes debajo de la identidad, centradas. Contactos colapsados; al expandir, **1 columna**. |
| **md – lg (768–1199)** | Igual, avatar 9rem (**definitivo** — F8 cerrado por decisión del usuario #105b, 2026-10-08, sin captura de referencia: proporciones verificadas en QA 1024/1440), texto más grande; identidad pegada al avatar como en < md. Contactos colapsados por defecto; al expandir, en **2 columnas**. |
| **xl (≥ 1200)** | Vertical y centrado. Avatar 11.25rem **sobresaliendo** arriba (`margin-top: calc(var(--size-avatar-sidebar) * -0.71)`, ≈ −8rem; fórmula compartida con `foundations/layout.md`), nombre/badge/redes centrados, contactos **siempre visibles** en 1 columna, botón de disclosure **oculto por CSS** (decisión 8=a; antes "sin CornerTab ni botón" — Cambio F5). Sticky solo con alto de pantalla ≥ 900px (lo aplica AppLayout). |

Colapsable (< xl):
- Estado local `expanded` con default `false` **en todos los < xl** (decisión 11:
  "false"; la fila md–lg de la tabla describe la grilla de 2 columnas **cuando el
  usuario expande**, no un estado inicial expandido).
- `.additional` oculto con una **clase del módulo** (`display: none`, nunca
  `style` inline: los estilos compartidos de impresión deben poder forzar la
  expansión — RF-10); en ≥ xl un `@media (min-width: 1200px)` del propio módulo
  fuerza `display: block` y oculta el botón de disclosure (CSS-only, RF-3 /
  decisión 8=a).
- Botón de disclosure (**Cambio F5 2026-10-08**: icon-only, sin CornerTab ni fondo): `aria-expanded`, `aria-controls="sidebar-contacts"`, `aria-label` que alterna `showContacts` / `hideContacts` (el nombre accesible reemplaza al texto visible); el chevron (`Icon name="chevron-down"`, decorativo `aria-hidden`) rota 180° cuando está expandido (`transform`, `--duration-base`). Estilo: **sin fondo ni border** (cero superficie propia), color `--color-accent-text` (el dorado del kit; par registrado en `docs/tokens/contrast.md` sobre la superficie del `aside` — verificar el par exacto en la tarea), tamaño del glyph por tokens (`--size-icon` default o `calc()` de tokens si hace falta área táctil ≥24px con padding), posicionado **absoluto en la esquina superior derecha del raíz** (el `aside`/Box aporta el `position: relative`; la identidad **no** pasa por debajo: reserva con `padding-inline-end: calc()` de tokens en < md si el nombre lo alcanza). Foco con el anillo estándar (`--focus-ring-*`). En ≥ xl se oculta solo por CSS (`display: none`, decisión 8=a: sigue montado, no operable). Raíz con `data-print-hide` (contrato de impresión #103; verificado estructuralmente).

## Accesibilidad

- `<aside aria-label={labels.region}>` (landmark complementario con nombre).
- Lista de redes con nombre; cada link con `aria-label` = nombre de la marca
  (`BRAND_NAMES`); abren en pestaña nueva con `rel="noopener noreferrer"`.
- Contactos: el label (Overhead) y el valor están en el mismo `li`; email,
  teléfono y WhatsApp son links; ubicación es texto.
- Alt del avatar desde `profile.avatar.alt`.
- Botón de contactos: patrón **disclosure** (`aria-expanded` + `aria-controls`).

## Tests esperados

1. `getByRole("complementary", { name: labels.region })`.
2. Muestra nombre, headline (Badge) y el avatar con su alt.
3. Un link por red con `aria-label` de la marca, `href` correcto, `target="_blank"` y `rel="noopener noreferrer"`.
4. Un ítem por contacto con su label traducido; email/phone/whatsapp son links con el href de `getContactHref`; location no es link. `mailto:`/`tel:` **sin** `target`/`rel`; el link whatsapp (o un `href` explícito de sitio) con `target="_blank"` + `rel="noopener noreferrer"` (RF-6).
5. Botón de contactos: `aria-expanded="false"` inicial; click → `"true"` y **nombre accesible** `hideContacts` (Cambio F5: icon-only + `aria-label`; `getByRole("button", { name: labels.showContacts })`); `aria-controls` apunta a un elemento existente.
6. Con `downloadCvUrl`: link "Download CV" con ese `href` y atributo `download`. Sin `downloadCvUrl`: no existe.
7. `getContactHref` (tabla de casos): `href` explícito tiene prioridad;
   `"alex@example.com"` → `mailto:alex@example.com`;
   `"+54 11 5555-0100"` → `tel:+541155550100`; `"(011) 5555.0100"` → `tel:01155550100`;
   `"+54 9 11 5555-0100"` (whatsapp) → `https://wa.me/5491155550100`;
   location → `undefined`; phone sin dígitos → `undefined`.
8. `contact` y `social` vacíos: no renderiza listas vacías; sin contactos **y** sin CV tampoco renderiza el `Separator` (RF-9).
9. `expectNoA11yViolations` sin violaciones (colapsado y expandido).
10. (Cambio F5) El botón de disclosure es icon-only: sin texto visible, con `data-print-hide` en su raíz, `aria-hidden` en el glyph y **sin** CornerTab en el DOM del `<aside>` (el hook existía solo para esto).

(jsdom no aplica `@media`: los tests verifican el comportamiento del
disclosure, no la visibilidad por breakpoint; eso se verifica en QA visual.)

## No hacer

- No leer `useCv()` adentro: los datos llegan por props.
- No usar el nombre como `h1`.
- No animar la altura del bloque de contactos.
