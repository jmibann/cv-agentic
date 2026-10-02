# useHashTab
Estado: aprobada

## Propósito

Sincroniza el tab activo de `NavTabs` con el hash de la URL (`#about`,
`#resume`), para que se pueda compartir un link directo a un panel. Vive en la
app (`src/lib/useHashTab.ts`) y lo usa **AppLayout**; NavTabs no lo conoce
(NavTabs es controlado: recibe `activeId` y emite `onChange`).

## Requisitos (EARS)

- RF-1: CUANDO el hash de la URL es uno de `ids`, ENTONCES EL SISTEMA devuelve ese id como tab activo; SI no hay hash o el hash es inválido, devuelve `defaultId` sin reescribir la URL.
- RF-2: CUANDO el consumidor llama `setActiveId(id)`, ENTONCES EL SISTEMA actualiza el estado y llama `history.replaceState` (nunca `pushState`) con el hash nuevo, conservando `pathname` y `search`; SI `id` ya es el activo, no hace nada.
- RF-3: CUANDO ocurre `hashchange` con un hash válido, ENTONCES EL SISTEMA actualiza el tab activo; SI el hash es inválido, lo ignora y mantiene el tab actual.
- RF-4: CUANDO el hook se desmonta, ENTONCES EL SISTEMA quita el listener de `hashchange`.
- RF-5: EL SISTEMA exige que ningún elemento del DOM tenga un `id` igual a un valor de `ids`.
- RF-6: EL SISTEMA no usa router, no mueve scroll ni foco, y solo lee `location.hash` al montar y en `hashchange`.

## API

```ts
export function useHashTab<T extends string>(
  ids: readonly T[],
  defaultId: T,
): [activeId: T, setActiveId: (id: T) => void];
```

- `ids`: tabs válidos (`["about", "resume"]`).
- `defaultId`: tab si el hash no es válido o no existe (`"about"`).

## Comportamiento

| Situación | Resultado |
|---|---|
| Montaje con `location.hash` = `#resume` (y `resume` ∈ `ids`) | `activeId = "resume"` |
| Montaje sin hash o con hash inválido (`#foo`) | `activeId = defaultId`; **no** reescribe la URL |
| `setActiveId(id)` | Actualiza el estado y llama `history.replaceState(null, "", "#" + id)` |
| `setActiveId(id)` con el id ya activo | No hace nada (ni estado ni `replaceState`) |
| Evento `hashchange` con hash válido | Actualiza `activeId` |
| Evento `hashchange` con hash inválido | Se ignora; queda el tab actual |
| Desmontaje | Quita el listener de `hashchange` |

Decisiones:

- **`replaceState`, no `pushState`**: el botón atrás no cambia de tab (lo
  esperable en un tablist) y no se acumulan entradas de historial.
  `replaceState` no dispara `hashchange`, así que no hay bucles.
- Cambiar de tab **no** mueve el scroll ni el foco (eso es de NavTabs/AppLayout).
- `setActiveId` conserva `pathname` y `search` de la URL; solo cambia el hash.

## Restricción sobre el DOM

**Ningún elemento puede tener `id="about"` ni `id="resume"`** (ni ningún id
que coincida con un valor de `ids`): el navegador saltaría a él al cargar con
ese hash. El panel es `main-panel`; los tabs, `tab-about` / `tab-resume`
(ver `specs/layout/NavTabs.md`). AppLayout lo verifica en su test 9.

## Anatomía

No aplica: es un hook sin UI.

## Estilos y tokens

No aplica.

## Responsive

No aplica.

## Estados

Ver la tabla de "Comportamiento" (estado = tab activo; transiciones por
`setActiveId` y `hashchange`).

## Accesibilidad

No aplica directamente. Impone la restricción de ids descripta arriba; la
semántica del tablist es de `NavTabs`.

## Tests esperados

(Con `window.location.hash` y `history.replaceState` controlados en el test;
`renderHook` de Testing Library.)

1. Sin hash → devuelve `defaultId`.
2. Con `#resume` antes de montar → devuelve `"resume"`.
3. Con `#foo` → devuelve `defaultId` y no llama `replaceState`.
4. `setActiveId("resume")` → devuelve `"resume"` y llama `replaceState` con una URL que termina en `#resume` (spy: **no** se llama `pushState`).
5. `setActiveId` con el id activo → no llama `replaceState`.
6. Disparar `hashchange` tras cambiar `location.hash` a `#resume` → devuelve `"resume"`.
7. `hashchange` con hash inválido → mantiene el valor anterior.
8. Al desmontar, un `hashchange` posterior no provoca actualizaciones (listener removido).
9. `setActiveId` conserva `pathname` y `search`.

## No hacer

- No usar `pushState` ni un router.
- No leer `location.hash` en cada render: solo al montar y en `hashchange`.
