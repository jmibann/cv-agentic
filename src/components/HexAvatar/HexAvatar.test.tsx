// Tests de T1 (specs/primitives/HexAvatar/tasks.md) — RF-3: `HexAvatarDefs`
// renderiza los dos `clipPath` de la geometría fija (spec → "Forma"): ids
// exactos `hex-avatar-outer` e `hex-avatar-inner`,
// `clipPathUnits="objectBoundingBox"`, un único `<path>` por `clipPath` cuyo
// `d` no está vacío, sella las 6 esquinas con arcos elípticos de los radios
// normalizados de la spec (outer 0.075/0.068, inner 0.028/0.025) y cierra el
// path con `Z`. El `<svg>` es invisible por tamaño (atributos 0×0 + posición
// absoluta dada por la clase del módulo), nunca `display: none`
// (spec → Forma).
//
// Rojo esperado (decisión #101): en el commit `test(HexAvatar): T1` nada de
// la pieza existe; el rojo llega por "Failed to resolve import" de
// `./HexAvatar` y `./HexAvatar.module.css` (patrón aprobado IconBox T2 /
// Separator T2).
//
// Justificación de las queries (constitución T3): `<clipPath>` y `<path>`
// son definiciones SVG sin rol ni nombre accesible posible y la API de la
// spec no define ningún `data-testid`; lo observable son sus ids, atributos
// y el string `d`, por eso se usa selección estructural
// (`container.querySelector("clipPath#…")`), el mismo criterio justificado
// en Icon.test T3 para `AccentGradientDefs`. La geometría EXACTA del `d`
// (cada vértice de la tabla "Forma" contra el path) la verifica el reviewer
// por lectura contra la spec; el test la ancla estructuralmente (6 arcos `A`
// + `Z`, radios, no vacío).
//
// Diferidos a su tarea según tasks.md: estructura `wrap > border > img` con
// `src` (T2), `alt` decorativo/nombre (T3), `className`, inspección de
// `filter: drop-shadow` y cierre `expectNoA11yViolations` (T4 — NO se
// adelanta; patrón Separator/CornerTab).

import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { HexAvatarDefs } from "./HexAvatar";

// T2: el componente `HexAvatar` (la unión de imports queda separada para que
// el commit `test(HexAvatar): T2` sea puramente aditivo sobre el archivo de
// T1; ningún assert anterior se toca — constitución T2).
import { HexAvatar } from "./HexAvatar";

// T4: helper de cierre a11y (constitución T4) para el describe final. Import
// separado (criterio #101): el commit `test(HexAvatar): T4` es puramente
// aditivo sobre el archivo de T1–T3.
import { expectNoA11yViolations } from "../../test/a11y";

// T1: el módulo nace con el feat de esta tarea solo con `.defs` (el patrón
// #99 fija el nombre real de la clase resuelta por CSS Modules en runtime).
import styles from "./HexAvatar.module.css";

// Patrón P2 canónico #99 (`styles.name ?? "name"`; prohibidos `!` y
// `as string`): el fallback es solo de tipos bajo `noUncheckedIndexedAccess`.
const defsClass = styles.defs ?? "defs";

// Nº de arcos elípticos del path (comando `A`): las 6 esquinas redondeadas.
// El fallback `?? []` no debilita nada: si `d` no tuviera arcos la longitud
// sería 0 y la aserción falla igual.
const arcCount = (d: string): number => (d.match(/A/g) ?? []).length;

describe("HexAvatarDefs clip paths (T1: RF-3)", () => {
  it("renders exactly two clipPath elements with the contract ids and objectBoundingBox units", () => {
    const { container } = render(<HexAvatarDefs />);

    // RF-3: dos clipPath DISTINTOS, dueños únicos de estos ids (spec →
    // Forma); nada más en las defs.
    expect(container.querySelectorAll("clipPath")).toHaveLength(2);

    const outer = container.querySelector("clipPath#hex-avatar-outer");
    const inner = container.querySelector("clipPath#hex-avatar-inner");
    expect(outer).not.toBeNull();
    expect(inner).not.toBeNull();
    // objectBoundingBox: las coordenadas del path son normalizadas a la caja
    // de cada elemento recortado (outer 80×88; inner 72×80, caja propia del
    // inset geométrico real de 4 px; spec → Forma).
    expect(outer).toHaveAttribute("clipPathUnits", "objectBoundingBox");
    expect(inner).toHaveAttribute("clipPathUnits", "objectBoundingBox");
  });

  it("hex-avatar-outer has one path with 6 elliptical-arc corners (rx 0.075 / ry 0.068) closed with Z", () => {
    const { container } = render(<HexAvatarDefs />);

    const outer = container.querySelector("clipPath#hex-avatar-outer");
    const outerPath = outer?.querySelector("path");
    expect(outer).not.toBeNull();
    // Un único path por clipPath (hexágono vertical punta arriba/abajo).
    expect(outer?.querySelectorAll("path")).toHaveLength(1);
    expect(outerPath).not.toBeNull();

    const d = outerPath?.getAttribute("d") ?? "";
    expect(d.length).toBeGreaterThan(0);
    // 6 vértices sellados con arco elíptico de los radios de la spec
    // (6 px normalizados: 6/80 = 0.075; 6/88 ≈ 0.068), sweep 1.
    expect(arcCount(d)).toBe(6);
    expect(d).toContain("0.075 0.068 0 0 1");
    // Cada tramo es recta + arco y el path cierra con Z.
    expect(d).toMatch(/Z$/);
  });

  it("hex-avatar-inner has one path with 6 elliptical-arc corners (rx 0.028 / ry 0.025) closed with Z", () => {
    const { container } = render(<HexAvatarDefs />);

    const inner = container.querySelector("clipPath#hex-avatar-inner");
    const innerPath = inner?.querySelector("path");
    expect(inner).not.toBeNull();
    expect(inner?.querySelectorAll("path")).toHaveLength(1);
    expect(innerPath).not.toBeNull();

    const d = innerPath?.getAttribute("d") ?? "";
    expect(d.length).toBeGreaterThan(0);
    // Radio 2 px resultante del inset (no un valor libre): 2/72 ≈ 0.028;
    // 2/80 = 0.025 (spec → Forma).
    expect(arcCount(d)).toBe(6);
    expect(d).toContain("0.028 0.025 0 0 1");
    expect(d).toMatch(/Z$/);
  });

  it("svg is invisible by size (0x0 attributes and the module class), never display:none, out of the a11y tree", () => {
    const { container } = render(<HexAvatarDefs />);
    const defsSvg = container.querySelector("svg");
    expect(defsSvg).not.toBeNull();

    // Invisible por tamaño (spec → Forma): width/height="0" como atributos y
    // posición absoluta dada por la clase del módulo (inspección del CSS:
    // .defs { position: absolute }). Nunca display:none: algunos navegadores
    // no resuelven url(#…) a definiciones dentro de un SVG no renderizado.
    expect(defsSvg).toHaveAttribute("width", "0");
    expect(defsSvg).toHaveAttribute("height", "0");
    expect(defsSvg).toHaveClass(defsClass);
    // Sin estilos inline (regla dura 3 de DESIGN.md): ningún display:none.
    expect(defsSvg).not.toHaveAttribute("style");
    // extra: precedente exacto AccentGradientDefs (Icon.tsx) — el encargo de
    // T1 manda replicar aria-hidden="true" y focusable="false" en el <svg>
    // de defs; la Anatomía de la spec no lo repite, pero sostiene su marco
    // de estructura (mismo contrato de defs invisibles).
    expect(defsSvg).toHaveAttribute("aria-hidden", "true");
    expect(defsSvg).toHaveAttribute("focusable", "false");
  });
});

// Tests de T2 (specs/primitives/HexAvatar/tasks.md) — RF-1: estructura
// `wrap > border > img` con `src`. "Hecho cuando": el `<img>` recibe el `src`
// (spec → "Tests esperados" #1); contorno e imagen llevan sus clases del
// módulo (P2; "Tests esperados" #5, aserción de clase con el criterio #99);
// la wrapper raíz también lleva `.wrap` (spec → Anatomía: `wrap` es el
// elemento raíz). Rojo esperado (decisión #101): en el commit
// `test(HexAvatar): T2` `HexAvatar` aún no existe en el módulo (el rojo llega
// por "does not provide an export named 'HexAvatar'"; patrón aprobado en la
// pieza: el import sin resolver de T1).
//
// Justificación de las queries (constitución T3): el `<img>` de T2 es
// decorativo (`alt=""` fijo hasta T3, RF-2), sin nombre accesible, así que
// `getByRole("img")` no puede seleccionarlo (spec → "Tests esperados" #2 lo
// asierte EN T3, no acá); y los `<span>` de la Anatomía no exponen rol ni
// nombre. La API de la spec no define `data-testid`. Se usa selección
// estructural (`container.querySelector("img"/"span")`), el mismo criterio
// justificado en Icon T2 (svg decorativo) y CornerTab T1 (raíz sin rol).
//
// Lo que queda por INSPECCIÓN del `.module.css` ("Hecho cuando" de T2; jsdom
// no aplica `clip-path` ni computa estilos — decisión #101, descartado leer
// el CSS como texto en un test): que `.border` y `.image` referencien
// `url(#hex-avatar-outer)` / `url(#hex-avatar-inner)`, los offsets 0.25rem
// (4 px del anillo) y los tamaños `calc()` respecto de
// `--size-testimonial-avatar-w/h`. Tampoco se monta `HexAvatarDefs` como
// armazón acá: su resolución `url(#…)` no se computa en jsdom (spec → Forma:
// el montaje junto a las defs lo garantizan AppLayout y los tests de los
// componentes que USAN HexAvatar; el cierre axe será T4 con defs montadas).

// Patrón P2 canónico #99 (`styles.name ?? "name"`; prohibidos `!` y
// `as string`): el fallback es solo de tipos bajo `noUncheckedIndexedAccess`.
const wrapClass = styles.wrap ?? "wrap";
const borderClass = styles.border ?? "border";
const imageClass = styles.image ?? "image";

describe("HexAvatar structure and src (T2: RF-1)", () => {
  it("renders an img that receives the src prop", () => {
    const { container } = render(<HexAvatar src="/x.png" />);

    // RF-1 ("Hecho cuando" de T2; spec → "Tests esperados" #1): el `<img>`
    // recibe el `src`. Es el discriminate real de T2: sin componente no hay
    // img; con componente sin el prop conectado el atributo falta.
    const img = container.querySelector("img");
    expect(img).not.toBeNull();
    expect(img).toHaveAttribute("src", "/x.png");
  });

  it("renders the exact wrap > border > img structure with the module classes", () => {
    const { container } = render(<HexAvatar src="/x.png" />);

    // Spec → Anatomía: exactamente dos `<span>` y un `<img>`, anidados
    // wrap > border > img, sin elementos extra.
    expect(container.querySelectorAll("span")).toHaveLength(2);
    expect(container.querySelectorAll("img")).toHaveLength(1);

    const wrap = container.querySelector("span");
    expect(wrap).not.toBeNull();
    expect(wrap?.tagName).toBe("SPAN");
    // P2: la wrapper raíz lleva su clase del módulo (elemento raíz de la API
    // → `className` se une acá en T4; la clase base ya rige en T2).
    expect(wrap).toHaveClass(wrapClass);

    const border = wrap?.querySelector("span");
    expect(border).not.toBeNull();
    expect(border?.tagName).toBe("SPAN");
    // "Tests esperados" #5: el contorno lleva su clase del módulo.
    expect(border).toHaveClass(borderClass);

    const img = border?.querySelector("img");
    expect(img).not.toBeNull();
    // "Tests esperados" #5: la imagen lleva su clase del módulo.
    expect(img).toHaveClass(imageClass);

    // extra: Anatomía es exacta ("dos spans + img; sin atributos extra") —
    // la spec no fija un RF de ausencia de atributos (HexAvatar no tiene el
    // RF-6 de CornerTab), pero el HTML de spec → Anatomía solo muestra
    // `class`, y esta aserción sella la estructura contra atributos
    // inventados sin tocar nada testeado por T3/T4 (allí `alt` sigue en el
    // `<img>`, no en los spans).
    expect(Array.from(wrap?.attributes ?? []).map((a) => a.name)).toEqual([
      "class",
    ]);
    expect(Array.from(border?.attributes ?? []).map((a) => a.name)).toEqual([
      "class",
    ]);
  });
});

// Tests de T3 (specs/primitives/HexAvatar/tasks.md) — RF-2: `alt` decorativo
// por defecto; con `alt`, ese texto es el nombre accesible. "Hecho cuando":
// sin `alt` → `alt=""` y la imagen no aparece en `getByRole("img")` (spec →
// "Tests esperados" #2); con `alt="Foto de X"` →
// `getByRole("img", { name: "Foto de X" })` (spec → "Tests esperados" #3).
// Rojo esperado (decisión #101): en el commit `test(HexAvatar): T3` el
// componente tiene `alt=""` literal fijo (diferido declarado en T2), así que
// el caso con nombre falla por nombre accesible ausente; el caso decorativo
// pasa desde el inicio porque `""` es también el default de la API (spec →
// API) — no es un assert debilitado: #2 exige exactamente ese comportamiento
// y el discriminate real de la tarea es el caso con nombre.
//
// Justificación de las queries (constitución T3): el caso con nombre usa
// rol + nombre accesible (`getByRole("img", { name })`, precedente Icon). El
// caso decorativo necesita dos manos: la AUSENCIA se aserta por rol
// (`queryByRole("img")` → null: un `<img>` con `alt=""` queda fuera del árbol
// de accesibilidad) y el literal `alt=""` exige acceder al elemento excluido
// de ese árbol, donde toda query por rol está prohibida por definición →
// selección estructural `querySelector("img")`, el mismo criterio justificado
// en T2 y en Icon T2 (svg decorativo).

describe("HexAvatar alt (T3: RF-2)", () => {
  it('defaults to a decorative image: alt="" and absent from getByRole("img")', () => {
    const { container, queryByRole } = render(<HexAvatar src="/x.png" />);

    // Spec → "Tests esperados" #2: sin `alt` → `alt=""`...
    const img = container.querySelector("img");
    expect(img).not.toBeNull();
    expect(img).toHaveAttribute("alt", "");
    // ...y la imagen no aparece en getByRole("img") (RF-2: decorativa).
    expect(queryByRole("img")).toBeNull();
  });

  it("exposes the alt prop as the accessible name", () => {
    const { getByRole } = render(<HexAvatar src="/x.png" alt="Foto de X" />);

    // Spec → "Tests esperados" #3 / RF-2: el texto del prop queda como
    // nombre accesible de la imagen.
    expect(getByRole("img", { name: "Foto de X" })).toBeInTheDocument();
  });
});

// Tests de T4 (specs/primitives/HexAvatar/tasks.md) — cierre de la pieza:
// unión de `className` al `wrap` raíz (spec → API; "Tests esperados" #4) y
// cierre `expectNoA11yViolations` ("Tests esperados" #7; "Hecho cuando" de T4:
// "archivo termina con expectNoA11yViolations (con HexAvatarDefs montado)";
// constitución T4). El marcador de diferido escrito en T1 se reemplaza acá:
// ningún assert de T1–T3 se toca (constitución T2; los `test` solo agregan
// tests — este diff no borra ni relajar ninguna aserción anterior).
//
// Rojo/verde por escenario (decisión #101):
// - Unión de `className`: **nace ROJO** — en el commit `test(HexAvatar): T4`
//   el componente no destruye `className` (diferido declarado en T2/T3), así
//   que la clase externa no aparece en el `wrap`; el `feat` la conecta.
// - Cierre axe: **nace VERDE on-arrival** y se declara (patrón Separator T3
//   `564911f` / CornerTab T4): el markup ya era accesible desde T2/T3 (img
//   decorativa con `alt=""` o con nombre, spans sin rol, defs `aria-hidden`);
//   en T4 no queda nada discriminate-testable nuevo — el `filter:
//   var(--filter-avatar-drop)` del wrap (RF-4), la ausencia de `box-shadow`,
//   la ausencia de `@media` (tamaño fijo, RF-5) y de reglas
//   `:hover`/`:focus`/transiciones (no es interactivo; spec → Estados) se
//   verifican por INSPECCIÓN del `.module.css` (jsdom no computa `filter`;
//   #101: leer el CSS como texto para fabricar un rojo está explícitamente
//   descartado) y el `index.ts` de la nota de cierre no es observable por
//   tests (llega en el `feat(HexAvatar): T4`).
//
// Justificación de las queries (constitución T3): unión — el `wrap` es el
// `<span>` raíz de la Anatomía (sin rol ni nombre), selección estructural ya
// justificada en T2, aserción de clases con el patrón P2 canónico #99
// (`styles.wrap ?? "wrap"` + `toHaveClass`; prohibidos `!` y `as string`) y
// el precedente Icon T5/CornerTab T1 de coexistencia base + externa (el orden
// en el atributo `class` no se verifica, precedente de la fase). Cierre —
// los dos escenarios son los dos marcos de RF-2 ya cubiertos por T3:
// decorativo (`alt=""` por default) y con nombre accesible.
//
// Armazón del cierre (spec → Forma: "Los tests de componentes que usan
// HexAvatar montan también `HexAvatarDefs`"): cada render del axe lleva
// `HexAvatarDefs` junto al avatar para que los `url(#hex-avatar-outer/inner)`
// del `clip-path` referencien defs presentes en el documento (en jsdom la
// resolución no se computa, pero el armazón replica el montaje real de
// AppLayout — RF-3/RF-6 de AppLayout — y axe audita el conjunto completo,
// incluidas las defs: su `aria-hidden="true"` las mantiene fuera del árbol).

describe("HexAvatar className joining (T4: spec Tests #4)", () => {
  it("joins an external className to the base wrap class on the root span", () => {
    const consumerClass = "testimonial-avatar";

    const { container } = render(
      <HexAvatar src="/x.png" className={consumerClass} />,
    );

    // Spec → API: `className` "se une a la clase base del `wrap` (elemento
    // raíz)" — composición base-primero + externa después (canon de la fase:
    // Badge/IconBox/Separator/CornerTab); la clase externa COEXISTE con la
    // base, no la reemplaza.
    const wrap = container.querySelector("span");
    expect(wrap).not.toBeNull();
    expect(wrap).toHaveClass(wrapClass);
    expect(wrap).toHaveClass(consumerClass);
  });
});

describe("HexAvatar accessibility audit (T4: RF-5; spec Tests #7)", () => {
  it("has no accessibility violations rendering a decorative avatar with the shared defs mounted", async () => {
    // Escenario real (spec → Propósito: card y dialog ponen el nombre al
    // lado): imagen decorativa con `alt=""` (default de la API).
    const { container } = render(
      <>
        <HexAvatarDefs />
        <HexAvatar src="/x.png" />
      </>,
    );

    await expectNoA11yViolations(container);
  });

  it("has no accessibility violations rendering a named avatar with the shared defs mounted", async () => {
    // Segundo marco de RF-2 (spec → Accesibilidad): uso futuro con `alt`
    // descriptivo → el img queda en el árbol con su nombre.
    const { container } = render(
      <>
        <HexAvatarDefs />
        <HexAvatar src="/x.png" alt="Foto de X" />
      </>,
    );

    await expectNoA11yViolations(container);
  });
});
