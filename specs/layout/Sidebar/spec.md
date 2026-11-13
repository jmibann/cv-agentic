# Sidebar
Estado: aprobada
Reabierta 2026-11-13 por el Cambio motion 3; vuelve a `implementada` al cerrar.

## Propósito

Tarjeta de identidad: avatar, nombre, rol, redes sociales, datos de contacto
y descarga del CV. Vertical y fija en desktop (xl); horizontal y con
contactos colapsables en tamaños menores.

## Requisitos (EARS)

- RF-1: EL SISTEMA renderiza un landmark `<aside>` con `aria-label` traducido que contiene avatar, nombre, rol, redes, contactos y la descarga del CV.
- RF-2: CUANDO existe `profile.downloadCvUrl`, ENTONCES EL SISTEMA muestra el link "Download CV" con el atributo `download`; SI no existe, ENTONCES no renderiza ese botón.
- RF-3: CUANDO el viewport es menor que xl, ENTONCES EL SISTEMA agrupa los contactos tras un botón disclosure (`aria-expanded` + `aria-controls`); SI el viewport es xl o mayor, ENTONCES los contactos están siempre visibles y el botón de disclosure queda **oculto solo por CSS** (mecanismo CSS-only, decisión 8=a: `@media (min-width: 1200px)` en el módulo del Sidebar fuerza `grid-template-rows: 1fr` y `visibility: visible` sobre `.additionalCollapsed` (Cambio motion 3; ver RF-11) y oculta el botón; el botón sigue montado pero no visible ni operable — no hay render condicional por ancho). *Cambio F5 2026-10-08: el disclosure ya no usa CornerTab (ver Anatomía); la nota de coherencia con CornerTab RF-4 queda sin objeto acá.*
- RF-4: CUANDO el usuario expande los contactos, ENTONCES EL SISTEMA alterna el **nombre accesible** del botón (`aria-label` = `showContacts` / `hideContacts`; el botón es icon-only desde el Cambio F5 2026-10-08, ver "Botón de disclosure" más abajo) y rota el chevron 180° (chevron = `Icon name="chevron-down"` decorativo con clase de rotación en el módulo: `transform`, `--duration-base`).
- RF-5: EL SISTEMA deriva el `href` de cada contacto con `getContactHref`: prioridad al `href` explícito; `email` → `mailto:`, `phone` → `tel:` sin `+` salvo el inicial, `whatsapp` → `https://wa.me/` solo dígitos y `location` → sin link; SI tras la limpieza `phone` o `whatsapp` no conserva dígitos, ENTONCES el resultado es `undefined` y el valor se muestra como texto.
- RF-6: EL SISTEMA abre en pestaña nueva con `target="_blank"` y `rel="noopener noreferrer"` **únicamente** los links externos: los de redes sociales y los de contacto derivados explícitamente como URL (p. ej. `href` de sitio, y `whatsapp` vía `https://wa.me/…`, decisión 10); `mailto:` y `tel:` se abren **sin** `target` ni `rel`. Cada link de red lleva `aria-label` igual al nombre de la marca.
- RF-7: EL SISTEMA aplica el layout de la pieza por breakpoint (grilla en tamaños menores a xl, vertical y centrado en xl, con el avatar sobresaliendo) usando tokens, sin medidas literales en `@media`. El **sticky** con alto ≥ 900px lo aplica AppLayout sobre `.aside` (no es verificable en la pieza; lo verifica el reviewer en F4/F5).
- RF-8: EL SISTEMA recibe todos los datos por props (`profile`, `contact`, `social`, `labels`) y no consume `useCv()` ni el hook de idioma.
- RF-9: SI `contact` viene vacío, ENTONCES EL SISTEMA no renderiza la lista de contactos; SI `social` viene vacío, ENTONCES no renderiza la lista de redes; SI no hay contactos **ni** `downloadCvUrl`, ENTONCES tampoco renderiza el `Separator` (contraparte EARS del Test 8; un `.additional` sin contenido no deja huérfano el separador).
- RF-10: ENTONCES en impresión los contactos quedan siempre expandidos y el botón Show/Hide se oculta: es responsabilidad de los **estilos compartidos** (G-D; `foundations/layout.md` → Impresión), no del Sidebar, que no declara `@media print`. Para que puedan cumplirlo, el colapso de `.additional` se hace por **clase del módulo** (nunca `style` inline) y el contenedor del disclosure es alcanzable (`id="sidebar-contacts"`). La raíz del botón de disclosure renderiza el hook `data-print-hide` (Cambio F5; `button[data-print-hide]` de `global.css` lo oculta ganando la especificidad a la clase del módulo — hallazgo B-3). *Cambio motion 3: el colapso deja de ser `display: none` y pasa a `grid-template-rows: 0fr` + `visibility: hidden` vía la misma clase del módulo (nunca `style` inline); la ampliación forzada de impresión agrega `visibility: visible`, `grid-template-rows: 1fr` y los resets de la animación de los ítems (ver RF-11; el bloque de print vive en `global.css`).*

- RF-11: CUANDO el usuario expande o colapsa los contactos (< xl), ENTONCES EL SISTEMA anima la altura con `grid-template-rows: 0fr↔1fr` (entrada `--duration-slow`/`--ease-enter`; salida `--duration-exit`/`--ease-exit`) y los ítems del wrapper entran con `opacity 0→1` + `translateY(4px)→0`, `--duration-base`/`--ease-enter`, `animation-fill-mode: backwards` y delays `calc(n × --duration-stagger)` (0/30/60/90 ms, máx. 4 pasos; `4px` es literal fijado por la spec). El `visibility` del bloque se difiere hasta el final del cierre (colapsado = fuera del árbol de accesibilidad y del foco). La animación de ítems corre **solo con `data-contacts-animate` presente**, que refleja `expanded`: nada anima en el render inicial ni en la carga en ≥ xl. Clics rápidos: todo guiado por clases, sin timers JS; el estado final coincide con `aria-expanded`. Con `prefers-reduced-motion: reduce` todo es instantáneo (los cinco tokens de duración y los delays derivados colapsan a 0.01 ms en `tokens.css`; no hace falta regla propia). En impresión no hay animación y los ítems quedan siempre expandidos y visibles (RF-10). El chevron rota 180° con `--duration-base` (RF-4, vigente). Verificación: tests 11–13; los efectos computados (altura ~0.3 s, stagger total ~290 ms, foco/visibilidad, reinicio de la animación, print y reduced motion con flag real) por QA del reviewer con la app servida (#91).

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

  <div id="sidebar-contacts" class="additional [additionalCollapsed]" data-contacts-animate?>   <!-- colapsable < xl, siempre visible ≥ xl; el atributo SOLO cuando expanded (RF-11): nada anima al cargar -->
    <div class="additionalBody">                  <!-- Cambio motion 3: wrapper único; min-height: 0; overflow: hidden; dueño de la pila vertical -->
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
  avatarAlt: string;       // "Portrait of Alex Rivera" — derivado de profile.name + plantilla i18n
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

**`.additional` (decisión 11, "gap")**: pila vertical con `gap` de token para separar Separator, lista de contactos y CTA. Excepción acumulativa obligatoria (Separator RF-4): en el **tramo** que limita con el `Separator` el contenedor no suma su `gap` — el espacio bloque-línea-bloque lo aporta solo el `margin-block` del Separator; el plan debe resolver el mecanismo (p. ej. `margin-block` compensado del Separator como item de flex) sin inline styles. *Cambio motion 3 (RF-11): la pila (gap, tramo del Separator, márgenes) **migra de `.additional` a `.additionalBody`**; `.additional` pasa a ser el contenedor grid de una sola fila.*

**Entrada de contactos (RF-11), en `Sidebar.module.css`** — reglas y especificidades reales:

| Regla | Selector (esp.) | Declaraciones |
|---|---|---|
| base | `.additional` (0,1,0) | `display: grid; grid-template-rows: 1fr; visibility: visible; transition: grid-template-rows var(--duration-slow) var(--ease-enter), visibility 0s;` |
| colapso | `.additionalCollapsed` (0,1,0, tras la base en el archivo) | `grid-template-rows: 0fr; visibility: hidden; transition: grid-template-rows var(--duration-exit) var(--ease-exit), visibility 0s var(--duration-exit);` |
| wrapper | `.additionalBody` (0,1,0) | `min-height: 0; overflow: hidden;` + la pila migrada |
| entrada de ítems | `.additional[data-contacts-animate] .additionalBody > *` (0,3,0; es `animation`, no `transition`: #116 no aplica) | `animation: item-enter var(--duration-base) var(--ease-enter) backwards;` |
| delays | `.additional[data-contacts-animate] .additionalBody > :nth-child(1\|2\|3\|4)` | `animation-delay: calc(0\|1\|2\|3 × var(--duration-stagger));` |
| cap | `.additional[data-contacts-animate] .additionalBody > :nth-child(n+5)` | `animation-delay: calc(4 × var(--duration-stagger));` |
| keyframes | `@keyframes item-enter` | `from { opacity: 0; transform: translateY(4px) } to { opacity: 1; transform: none }` |
| ≥ xl | `@media (min-width: 1200px) { .additionalCollapsed }` (0,1,0, al final) | `grid-template-rows: 1fr; visibility: visible; transition: none;` (P5': nada anima al agrandar la ventana colapsada; `transition: none` excluido de #116) |

- **Ninguna `transition` que produzca animación en selectores (0,2,0) o mayores** (#116 aclarada): las dos transiciones del bloque viven en clases (0,1,0).
- **Contactos**: los links de contacto **no** declaran `transition` — la `transition: color` inerte de `.contacts a` se elimina con este Cambio (propuesta §3.4).

## Estados

| Elemento | Estados |
|---|---|
| Link de red social | reposo `--color-text-muted`; hover/foco `--color-accent-text`; foco con anillo estándar |
| Link de contacto | sin subrayado; subrayado en hover/foco; foco con anillo estándar |
| Botón de disclosure | `aria-expanded` false/true; `aria-label` alterna `showContacts`/`hideContacts`; chevron rota 180° al expandir; foco con anillo estándar |
| Download CV | estados de `Button` |
| `.additional` colapsado (< xl) | clase `additionalCollapsed`: `0fr` + `visibility: hidden` (fuera del árbol de accesibilidad y del foco — se verifica en QA en navegador) |
| `.additional` expandido por el usuario (< xl) | `1fr` + visible; `data-contacts-animate` presente; ítems con stagger (~290 ms total) |
| `.additional` al cargar (< xl) o en ≥ xl | sin animación (atributo ausente; ≥ xl forzado abierto por CSS) |

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
- `.additional` colapsado con una **clase del módulo** (`.additionalCollapsed`:
  `grid-template-rows: 0fr` + `visibility: hidden`, nunca `style` inline —
  RF-10); en ≥ xl un `@media (min-width: 1200px)` del propio módulo fuerza
  `grid-template-rows: 1fr` + `visibility: visible` + `transition: none` sobre
  `.additionalCollapsed` a secas (0,1,0, P5') y oculta el botón de disclosure
  (CSS-only, RF-3 / decisión 8=a).
- Botón de disclosure (**Cambio F5 2026-10-08**: icon-only, sin CornerTab ni fondo): `aria-expanded`, `aria-controls="sidebar-contacts"`, `aria-label` que alterna `showContacts` / `hideContacts` (el nombre accesible reemplaza al texto visible); el chevron (`Icon name="chevron-down"`, decorativo `aria-hidden`) rota 180° cuando está expandido (`transform`, `--duration-base`). Estilo: **sin fondo ni border** (cero superficie propia), color `--color-accent-text` (el dorado del kit; par registrado en `docs/tokens/contrast.md` sobre la superficie del `aside` — verificar el par exacto en la tarea), tamaño del glyph por tokens (`--size-icon` default o `calc()` de tokens si hace falta área táctil ≥24px con padding), posicionado **absoluto en la esquina superior derecha del raíz** (el `aside`/Box aporta el `position: relative`; la identidad **no** pasa por debajo: reserva con `padding-inline-end: calc()` de tokens en < md si el nombre lo alcanza). Foco con el anillo estándar (`--focus-ring-*`). En ≥ xl se oculta solo por CSS (`display: none`, decisión 8=a: sigue montado, no operable). Raíz con `data-print-hide` (contrato de impresión #103; verificado estructuralmente).

## Accesibilidad

- `<aside aria-label={labels.region}>` (landmark complementario con nombre).
- Lista de redes con nombre; cada link con `aria-label` = nombre de la marca
  (`BRAND_NAMES`); abren en pestaña nueva con `rel="noopener noreferrer"`.
- Contactos: el label (Overhead) y el valor están en el mismo `li`; email,
  teléfono y WhatsApp son links; ubicación es texto.
- Alt del avatar desde `labels.avatarAlt`: AppLayout lo deriva de `profile.name` con la plantilla `t.sidebar.avatarAlt` (`format`); la pieza no compone textos (RF-8).
- Botón de contactos: patrón **disclosure** (`aria-expanded` + `aria-controls`).

## Tests esperados

1. `getByRole("complementary", { name: labels.region })`.
2. Muestra nombre, headline (Badge) y el avatar con el alt de `labels.avatarAlt`.
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
11. Wrapper (RF-11): `#sidebar-contacts` tiene un único div de contenido (`.additionalBody`) que contiene Separator, lista y CTA; aserción de orden **incondicional** (la fixture trae lista): el Separator precede a `ul.contacts` (`compareDocumentPosition(...) & Node.DOCUMENT_POSITION_FOLLOWING`).
12. `data-contacts-animate` **refleja `expanded`**: ausente en el render inicial, presente tras expandir, ausente tras colapsar, presente otra vez al reexpandir. (El reinicio observable de la animación lo verifica el reviewer en navegador — T13.)
13. Colapsado: `#sidebar-contacts` lleva la clase de colapso del módulo (canon #99) y `aria-expanded="false"`. **Sin** `toBeVisible()` (jsdom no aplica los estilos de los CSS Modules); "fuera del foco y del árbol de accesibilidad" se verifica en QA en navegador.

*(jsdom no aplica `@media`: los tests verifican el comportamiento del
disclosure, no la visibilidad por breakpoint; eso se verifica en QA visual.)*

***Reescritura del selector del Separator (C9, aprobada en #106):*** la
constante `SEPARATOR_IN_ADDITIONAL` de `Sidebar.test.tsx` pasa de
`'#sidebar-contacts > div[aria-hidden="true"]'` a
`'#sidebar-contacts div[aria-hidden="true"]'` (descendiente: sobrevive al
wrapper; el único `div[aria-hidden]` del subárbol sigue siendo el Separator —
`IconBox` es `<span>` e `Icon` es `<svg>`, verificado). Los 4 usos quedan
intactos con sus `querySelectorAll(...).toHaveLength(n)` (:379→1, :475→0,
:489→1, :744→1); misma aserción de fondo; **no** se usa
`getByRole("separator")` (el Separator no tiene rol por contrato).

## No hacer

- No leer `useCv()` adentro: los datos llegan por props.
- No usar el nombre como `h1`.
- No animar la altura del bloque de contactos con nada que no sea `grid-template-rows: 0fr↔1fr` (RF-11; la única excepción a "no animar altura" en `foundations/motion.md` — C3): sin `height`/`max-height` ni medición JS.
- No animar la entrada de ítems sin `data-contacts-animate`: el render inicial y la carga en ≥ xl no animan.
- No declarar `transition` que puedan **producir animación** en selectores de especificidad (0,2,0) o mayor (#116 aclarada; `transition: none` excluido).
