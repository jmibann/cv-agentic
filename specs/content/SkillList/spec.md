# SkillList
Estado: aprobada

## Propósito

Skills como **una sola lista de chips**, sin porcentajes ni barras y sin
agrupar por categoría.

## Requisitos (EARS)

- RF-1: CUANDO `skills` contiene elementos, ENTONCES EL SISTEMA renderiza un `<ul>` con un chip por skill en el orden de los datos; SI `skills` está vacío, ENTONCES no renderiza nada.
- RF-2: EL SISTEMA exige exactamente uno de `labelledBy` o `label` para el nombre accesible: pasar ambos o ninguno no compila. Verificación: **dos** casos `// @ts-expect-error` (decisión 15: ambos y ninguno).
- RF-3: EL SISTEMA renderiza cada skill como `Badge as="li"` dentro de una lista que hace wrap, sin porcentajes, barras ni agrupación por categoría. El chip lo pinta **íntegramente Badge**: SkillList no le pasa `className` propia (la clase `.chip` de la anatomía es ilustrativa del `<li>` que renderiza Badge; decisión 15).
- RF-4: EL SISTEMA coloca la lista directamente sobre `--color-surface` (el chip compartiría fondo con `Box variant="inner"` y desaparecería). Restricción de uso: la verifica el reviewer en el consumidor (ResumePage, F4); la pieza no detecta superficies.
- RF-5: EL SISTEMA no declara `@media` propios: el wrap resuelve el responsive según el ancho disponible. Un chip individual más ancho que el contenedor **desborda sin regla especial** (decisión 15: sin elipsis ni `maxLength` en el esquema; se constata con el contenido real en QA F5).
- RF-6: EL SISTEMA tolera skills duplicadas con keys estables (índice + valor). Verificación: test 5 (render sin warning) + inspección de la fórmula de key en el código.

## Anatomía

```html
<ul class="skillList" aria-labelledby="resume-skills-title">
  <li class="chip">React</li>          <!-- Badge as="li" -->
  <li class="chip">TypeScript</li>
  …
</ul>
```

Normalmente va debajo de un `SectionTitle as="h2"` "Skills" dentro de una
`<section aria-labelledby>` (lo compone ResumePage). En ese caso la lista no
necesita `aria-label` propio: se pasa `labelledBy` con el id del h2.

## API

```ts
/** Nombre accesible obligatorio: exactamente uno de los dos. */
type SkillListName =
  | { labelledBy: string; label?: never }   // id del heading que nombra la lista
  | { label: string; labelledBy?: never };  // texto ya traducido

export type SkillListProps = SkillListName & {
  skills: readonly string[];
  /** Se une a la clase base del `<ul>` raíz (G-B). */
  className?: string;
};
```

La lista **siempre** tiene nombre accesible, y nunca con texto escrito en el
componente: o referencia un heading (`labelledBy`) o recibe un `label` ya
traducido. Pasar ambos o ninguno es un error de compilación.

## Estilos y tokens

| Parte | Valor |
|---|---|
| Lista | `display: flex; flex-wrap: wrap; gap: var(--space-2); list-style: none; margin: 0; padding: 0;` |
| Chip | `Badge as="li"` (fondo `surface-muted`, radio 8, `--font-size-badge`) |

- La lista va **directamente sobre `--color-surface`** (la card), **no** dentro de
  un `Box variant="inner"`: el chip tiene el mismo fondo que el box interno y
  desaparecería. (El tema metía las barras en un box interno; con chips no aplica.)

## Estados

No es interactivo: sin hover ni foco.

## Responsive

Sin `@media` propios: la lista hace wrap según el ancho disponible.


## Accesibilidad

- `ul` con nombre (por `aria-labelledby` o `aria-label`); los lectores anuncian
  "lista, N elementos".
- El orden es el de los datos.

## Tests esperados

1. `getByRole("list", { name })` con un `listitem` por skill, en orden.
2. Con `labelledBy`, el nombre accesible sale del heading referenciado (armazón `<h2 id>` en el test, criterio Badge-`ul`/Overhead-`dl`); con `label`, es ese texto.
3. (Tipos) Dos casos `// @ts-expect-error`: omitir ambos no compila; pasar ambos no compila.
4. `skills` vacío → no renderiza nada (`null`).
5. Skills duplicadas no rompen el render (keys estables: índice + valor; sin warning de React en `console.error`).
6. Concatena `className` en el `<ul>` raíz (G-B, criterio #99 de la fase).
7. `expectNoA11yViolations` sin violaciones.

## No hacer

- No agregar niveles, porcentajes, barras ni estrellas.
- No agrupar por categoría (decisión cerrada; ver `docs/README.md`, decisión #3).
