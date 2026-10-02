# Timeline
Estado: aprobada

## Propósito

Lista cronológica vertical para Education y Experience: línea fina a la
izquierda, un punto de acento por ítem, título, período y descripción.

## Requisitos (EARS)

- RF-1: CUANDO `entries` contiene ítems, ENTONCES EL SISTEMA renderiza un `<ol>` con un `<li>` por entrada en el orden de los datos; SI `entries` está vacío, ENTONCES no renderiza nada.
- RF-2: EL SISTEMA renderiza el título de cada ítem como `<h3>` (nivel fijo por `docs/DESIGN.md`, sin prop que lo cambie).
- RF-3: CUANDO `end` es `null`, ENTONCES EL SISTEMA termina el período en `presentLabel` ("Present" / "Actualidad").
- RF-4: EL SISTEMA envuelve cada fecha en `<time dateTime>` con el valor de los datos y formatea el período con `formatPeriod` según el `locale`.
- RF-5: EL SISTEMA genera ids de título únicos a partir de `idPrefix`, de modo que dos Timelines en la misma página no colisionen.
- RF-6: EL SISTEMA trata el punto y la línea como decorativos (pseudo-elementos) y le quita la línea al último ítem.
- RF-7: EL SISTEMA escala la sangría con `--timeline-indent` y no declara `@media` propios.

## Anatomía

```
●  B.Sc. in Computer Science          ← h3 (estilo h4) — title
│  University of Buenos Aires         ← organization
│  2012 — 2017                        ← período (text-muted, <time>)
│  Focus on software engineering…     ← description
│
●  Web Accessibility Specialist
   …                                  ← el último ítem no tiene línea
```

```html
<ol class="timeline">
  <li class="item">
    <article aria-labelledby="edu-uba-cs-title">
      <h3 id="edu-uba-cs-title" class="title">B.Sc. in Computer Science</h3>
      <p class="organization">University of Buenos Aires</p>
      <p class="period"><time datetime="2012">2012</time> — <time datetime="2017">2017</time></p>
      <p class="description">…</p>
    </article>
  </li>
</ol>
```

## API

```ts
import type { Locale, TimelineEntry } from "@data/cv.types.generated";

export interface TimelineProps {
  entries: readonly TimelineEntry[];
  locale: Locale;
  /** "Present" / "Actualidad". */
  presentLabel: string;
  /** Prefijo para ids únicos de títulos (ej. "edu", "exp"). */
  idPrefix: string;
  className?: string;
}
```

Usa `formatPeriod` de `src/i18n/formatPeriod.ts` (lo crea foundation en F1,
con sus tests; spec en `foundations/i18n.md`). Timeline no lo reimplementa.
El orden de render es **el de los datos** (el contenido decide el orden).

El título de cada ítem es **siempre `<h3>`** (con estilo de h4). No hay prop
para cambiar el nivel: la jerarquía está fijada en `docs/DESIGN.md` y
`foundations/typography.md` (h2 sección → h3 ítem).

## Estilos y tokens

| Parte | Valor |
|---|---|
| Lista | `list-style: none; margin: 0; padding: 0 0 0 calc(var(--size-timeline-dot) / 2 + var(--timeline-dot-ring));` (deja lugar para que el punto y su halo no se corten a la izquierda) |
| Ítem | `position: relative; border-left: var(--timeline-line-width) solid var(--color-track); padding: 0 0 var(--space-6) var(--timeline-indent);` (sangría 30px < 580 → 40px) |
| Último ítem | `border-left-color: transparent; padding-bottom: 0;` |
| Punto (`::before`) | `width/height: var(--size-timeline-dot); border-radius: 50%; background: var(--color-accent); box-shadow: 0 0 0 var(--timeline-dot-ring) var(--color-track); position: absolute; top: var(--timeline-dot-top); left: calc((var(--size-timeline-dot) + var(--timeline-line-width)) / -2);` (centrado sobre la línea: la mitad del punto más la mitad del grosor de la línea) |
| Título | `font-size: var(--font-size-h4); font-weight: var(--font-weight-medium); margin: 0; position: relative; top: -0.3125rem;` |
| Organización | `color: var(--color-heading); font-weight: var(--font-weight-regular); margin: 0;` |
| Período | `color: var(--color-text-muted); margin: 0;` |
| Descripción | `margin: var(--space-1) 0 0;` |

La línea y el halo usan `--color-track` (en oscuro = `--color-border`, para
que se vean: `grey-200` oscuro es más oscuro que la card).

`border-left-color: transparent` en el último ítem usa la palabra clave
`transparent`, permitida por la regla dura 1 de `docs/DESIGN.md`.

## Estados

No es interactivo: sin hover ni foco. Variante única: el último ítem sin línea.

## Responsive

Sin `@media` propios: la sangría escala por el token `--timeline-indent`.

## Accesibilidad

- `<ol>`: el orden importa.
- Cada ítem es un `<article>` nombrado por su título.
- El punto y la línea son decorativos (pseudo-elementos).
- Fechas con `<time dateTime>`; "Present" es texto.

## Tests esperados

1. Renderiza un `list` (ol) con un `listitem` por entrada, en orden.
2. Cada ítem tiene un heading **nivel 3** con el título.
3. Muestra organización, período formateado y descripción.
4. `end: null` → el período termina en `presentLabel`.
5. Fechas `YYYY-MM` se formatean según `locale` (en vs es).
6. Hay `<time>` con `dateTime` igual al valor de los datos.
7. Ids de títulos únicos con `idPrefix` (dos Timelines en la misma página no colisionan).
8. `entries` vacío → no renderiza nada (`null`).
9. `expectNoA11yViolations` sin violaciones.

Los tests de `formatPeriod` viven junto a la función (F1), no en Timeline.

## No hacer

- No usar `h5` (el tema original lo hacía; rompe la jerarquía).
- No ordenar las entradas dentro del componente.
