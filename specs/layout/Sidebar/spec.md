# Sidebar
Estado: aprobada

## Propósito

Tarjeta de identidad: avatar, nombre, rol, redes sociales, datos de contacto
y descarga del CV. Vertical y fija en desktop (xl); horizontal y con
contactos colapsables en tamaños menores.

## Requisitos (EARS)

- RF-1: EL SISTEMA renderiza un landmark `<aside>` con `aria-label` traducido que contiene avatar, nombre, rol, redes, contactos y la descarga del CV.
- RF-2: CUANDO existe `profile.downloadCvUrl`, ENTONCES EL SISTEMA muestra el link "Download CV" con el atributo `download`; SI no existe, ENTONCES no renderiza ese botón.
- RF-3: CUANDO el viewport es menor que xl, ENTONCES EL SISTEMA agrupa los contactos tras un botón disclosure (`aria-expanded` + `aria-controls`); SI el viewport es xl o mayor, ENTONCES los contactos están siempre visibles y la CornerTab no se renderiza.
- RF-4: CUANDO el usuario expande los contactos, ENTONCES EL SISTEMA alterna el texto `showContacts` / `hideContacts` y rota el chevron 180°.
- RF-5: EL SISTEMA deriva el `href` de cada contacto con `getContactHref`: prioridad al `href` explícito; `email` → `mailto:`, `phone` → `tel:` sin `+` salvo el inicial, `whatsapp` → `https://wa.me/` solo dígitos y `location` → sin link; SI tras la limpieza `phone` o `whatsapp` no conserva dígitos, ENTONCES el resultado es `undefined` y el valor se muestra como texto.
- RF-6: EL SISTEMA abre los links externos en pestaña nueva con `target="_blank"` y `rel="noopener noreferrer"`, cada uno con `aria-label` igual al nombre de la marca.
- RF-7: EL SISTEMA aplica el layout por breakpoint (grilla en tamaños menores a xl, vertical y centrado en xl, con el avatar sobresaliendo y sticky solo con alto de pantalla ≥ 900px) usando tokens, sin medidas literales en `@media`.
- RF-8: EL SISTEMA recibe todos los datos por props (`profile`, `contact`, `social`, `labels`) y no consume `useCv()` ni el hook de idioma.

## Anatomía

```html
<Box variant="outer" as="aside" aria-label="Profile">
  <CornerTab size="sm">                        <!-- solo < xl -->
    <button aria-expanded="false" aria-controls="sidebar-contacts">Show Contacts ⌄</button>
  </CornerTab>

  <div class="baseInfo">
    <figure class="avatar"><img src alt /></figure>
    <div class="identity">
      <p class="name">Alex Rivera</p>
      <Badge>Frontend Developer</Badge>
    </div>
    <ul class="social" aria-label="Social profiles">
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
  className?: string;
}
```

Función pura exportada y testeada aparte:

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
- El `img` lleva `width`/`height` explícitos (evita layout shift) y `decoding="async"`.

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

## Estados

| Elemento | Estados |
|---|---|
| Link de red social | reposo `--color-text-muted`; hover/foco `--color-accent-text`; foco con anillo estándar |
| Link de contacto | sin subrayado; subrayado en hover/foco; foco con anillo estándar |
| Botón Show/Hide Contacts | `aria-expanded` false/true; chevron rota 180° al expandir; foco con anillo estándar |
| Download CV | estados de `Button` |

## Responsive

| Viewport | Layout |
|---|---|
| **< md (768)** | Grilla `auto 1fr`: avatar (7.5rem) a la izquierda; nombre y badge a la derecha; redes debajo de la identidad. Contactos colapsados; al expandir, **1 columna**. |
| **md – lg (768–1199)** | Igual, avatar 9rem (**provisional**: se ajusta el token en la QA visual de F5), texto más grande. Contactos expandidos en **2 columnas**. |
| **xl (≥ 1200)** | Vertical y centrado. Avatar 11.25rem **sobresaliendo** arriba (`margin-top: calc(var(--size-avatar-sidebar) * -0.71)`, ≈ −8rem; fórmula compartida con `foundations/layout.md`), nombre/badge/redes centrados, contactos **siempre visibles** en 1 columna, **sin** CornerTab ni botón. Sticky solo con alto de pantalla ≥ 900px (lo aplica AppLayout). |

Colapsable (< xl):
- Estado local `expanded` (default `false`).
- `.additional` oculto con `display: none` cuando `!expanded`; en ≥ xl un
  `@media (min-width: 1200px)` fuerza `display: block` y oculta la CornerTab.
- Botón: `aria-expanded`, `aria-controls="sidebar-contacts"`; el texto alterna
  `showContacts` / `hideContacts`; el chevron rota 180° cuando está expandido
  (`transform`, `--duration-base`). Estilo del botón: sin fondo, color
  `--color-accent-text`, `font-size: var(--font-size-body)` (ya escala por token);
  foco con el anillo estándar (`--focus-ring-*`).

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
4. Un ítem por contacto con su label traducido; email/phone/whatsapp son links con el href de `getContactHref`; location no es link.
5. Botón de contactos: `aria-expanded="false"` inicial; click → `"true"` y texto `hideContacts`; `aria-controls` apunta a un elemento existente.
6. Con `downloadCvUrl`: link "Download CV" con ese `href` y atributo `download`. Sin `downloadCvUrl`: no existe.
7. `getContactHref` (tabla de casos): `href` explícito tiene prioridad;
   `"alex@example.com"` → `mailto:alex@example.com`;
   `"+54 11 5555-0100"` → `tel:+541155550100`; `"(011) 5555.0100"` → `tel:01155550100`;
   `"+54 9 11 5555-0100"` (whatsapp) → `https://wa.me/5491155550100`;
   location → `undefined`; phone sin dígitos → `undefined`.
8. `contact` y `social` vacíos: no renderiza listas vacías (ni el separador si no hay contactos ni CV).
9. `expectNoA11yViolations` sin violaciones (colapsado y expandido).

(jsdom no aplica `@media`: los tests verifican el comportamiento del
disclosure, no la visibilidad por breakpoint; eso se verifica en QA visual.)

## No hacer

- No leer `useCv()` adentro: los datos llegan por props.
- No usar el nombre como `h1`.
- No animar la altura del bloque de contactos.
