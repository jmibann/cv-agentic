# SkillList
Estado: aprobada

## Propósito

Skills como **una sola lista de chips**, sin porcentajes ni barras y sin
agrupar por categoría.

## Requisitos (EARS)

- RF-1: CUANDO `skills` contiene elementos, ENTONCES EL SISTEMA renderiza un `<ul>` con un chip por skill en el orden de los datos; SI `skills` está vacío, ENTONCES no renderiza nada.
- RF-2: EL SISTEMA exige exactamente uno de `labelledBy` o `label` para el nombre accesible: pasar ambos o ninguno no compila.
- RF-3: EL SISTEMA renderiza cada skill como `Badge as="li"` dentro de una lista que hace wrap, sin porcentajes, barras ni agrupación por categoría.
- RF-4: EL SISTEMA coloca la lista directamente sobre `--color-surface`; SI se colocara dentro de un `Box variant="inner"`, ENTONCES los chips compartirían fondo y desaparecerían, por lo que ese uso queda prohibido.
- RF-5: EL SISTEMA no declara `@media` propios: el wrap resuelve el responsive según el ancho disponible.
- RF-6: EL SISTEMA tolera skills duplicadas con keys estables (índice + valor).

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
2. Con `labelledBy`, el nombre accesible sale del heading referenciado; con `label`, es ese texto.
3. (Tipos) Un caso con `// @ts-expect-error` verifica que omitir ambos no compila.
4. `skills` vacío → no renderiza nada (`null`).
5. Skills duplicadas no rompen el render (keys estables: índice + valor).
6. `expectNoA11yViolations` sin violaciones.

## No hacer

- No agregar niveles, porcentajes, barras ni estrellas.
- No agrupar por categoría (decisión cerrada; ver `docs/README.md`, decisión #3).
