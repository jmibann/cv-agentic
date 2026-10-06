# Plan — ServiceCard

## Archivos y responsabilidades

| Archivo | Responsabilidad | RF |
|---|---|---|
| `src/components/ServiceCard/ServiceCard.tsx` | `Box variant="inner" as="article">` nombrado: `Icon name=service.icon tone="gradient"` con `.glyph`, y `<div>` con `SectionTitle as="h3" id` + `<p>` descripción | RF-1…RF-3, RF-6 |
| `src/components/ServiceCard/ServiceCard.module.css` | contenedor flex **columna centrada (base)**; `@media (min-width: 580px)` → fila flex-start (solo layout); `.glyph { --icon-size: var(--size-service-icon); }`; `height: 100%` | RF-4, RF-5 |
| `src/components/ServiceCard/ServiceCard.test.tsx` | tests + cierre a11y | todas |
| `src/components/ServiceCard/index.ts` | re-export | — |

## Funciones puras y algoritmo

Ninguno.

## Interfaz

`ServiceCardProps { service: Service; className?: string }` (spec → API; G-B: `className` se transmite al `Box` raíz y la unión la aplica Box).

## Decisiones

- Título por `SectionTitle as="h3" id=service-${service.id}-title` (decisión 16): tamaño y margen los fija SectionTitle (RF-1/RF-5 suyos); el `<article aria-labelledby>` apunta a ese id. *Descartado:* h3 crudo con estilos duplicados (choca con la regla de excepciones de márgenes).
- Ícono **sin wrapper** (decisión 16): `<Icon className={styles.glyph}>` directo como hijo del flex; Icon ya trae `flex-shrink: 0`; el gradiente exige armazón `AccentGradientDefs` en los tests.
- Mobile-first (decisión 16): la base del módulo es columna centrada con `text-align: center`; el `@media (min-width: 580px)` cambia `flex-direction: row; align-items: flex-start; text-align: start;` — solo layout, sin medidas (criterio `breakpoints.md`).
- `height: 100%` para igualar filas; columnas las arma AboutPage (RF-5).
- Sin interactividad: cero pseudo-estados (RF-6). Impresión: `break-inside` del estilo compartido (G-D); cero `@media print` propio.
- Sin IconBox (RF-5 suyo prohíbe Box inner; constancia en spec).

## Estrategia de tests

Fixture `Service` (id `web-apps`, icon `code` — ServiceIcon válido). Tests: `getByRole("article", { name: service.title })` con `heading` nivel 3; párrafo con la descripción; svg `stroke="url(#accent-gradient)"` dentro del article y clase `lucide-code` propagada (decisión 16/RF-2); id del título `service-web-apps-title` y `aria-labelledby` del article apuntándolo (test 4); `expectNoA11yViolations`. P1: base columna + media 580 fila, sin otras propiedades en el media → inspección; `--icon-size` fijo en `.glyph` no en el contenedor → inspección.

Cobertura: T1→RF-1,RF-2,RF-3 · T2→RF-4,RF-5,RF-6 + cierre.
