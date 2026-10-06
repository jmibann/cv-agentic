// Tests de T1 (specs/primitives/CornerTab/tasks.md) — RF-1 y RF-6: el raíz
// `<div>` renderiza los `children` y aplica la clase base del módulo (P2), y
// no agrega `role` **ni ningún atributo `aria-*`** (RF-6: "no agrega roles ni
// atributos aria-* a la tab; los estados de hover y foco pertenecen a su
// contenido" — el contrato es más fuerte que el de Separator: no hay ni un
// `aria-*`, se recorren los atributos del raíz (`root.attributes`) filtrando
// el prefijo `aria-`).
// La nota de T1 en tasks.md suma además la unión de la `className` externa al
// raíz (spec → API, plan → Interfaz; gap de reparto cubierto en T1), con el
// canon de la fase: coexistencia base-primero + externa (Badge/IconBox/
// Separator), sin verificar el orden del atributo `class`.
//
// El posicionamiento del RF-1 (`position: absolute; top: 0; right: 0;
// z-index: var(--z-raised)`) se verifica por INSPECCIÓN del CSS: jsdom no
// computa posición (spec → RF-1 y "Tests esperados"; decisión #101: no se lee
// el CSS como texto en un test). Diferidos por tasks.md: variantes `size` (T2),
// `placement="float"` y su `@media` (T3), fondo/bordes/radio/sombra y el
// cierre `expectNoA11yViolations` (T4).
//
// Justificación de las queries (constitución T3): el raíz es un `<div>` sin
// rol ni nombre accesible —por RF-6 no debe exponer ninguno— y la API de la
// spec no define `data-testid`, así que `getByRole` no puede seleccionar el
// raíz: las aserciones sobre él (clase base, ausencia de `role`/`aria-*`,
// unión de `className`) usan la query estructural
// `container.querySelector("div")` —el único `<div>` que renderiza el
// componente (spec → Anatomía)—, el mismo criterio estructural justificado en
// IconBox/Separator. Los `children` sí se consultan por rol/texto (RF-6: el
// nombre accesible y los estados viven en el contenido).
//
// Rojo on-arrival legítimo: `CornerTab.tsx` y `CornerTab.module.css` aún no
// existen (el módulo nace con el `feat` de T1; el import sin resolver es el
// mismo rojo del patrón aprobado en Separator T1/T2 e IconBox T2).

import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CornerTab } from "./CornerTab";

// El test importa el módulo solo para fijar el nombre real de la clase base
// (`cornerTab`, resuelto por CSS Modules en runtime) y asierte la clase
// aplicada y la coexistencia con la clase del consumidor en el raíz.
import styles from "./CornerTab.module.css";

// Patrón P2 canónico #99 (`styles.name ?? "name"`; prohibidos `!` y
// `as string`): el fallback es solo de tipos bajo `noUncheckedIndexedAccess`.
const cornerTabClass = styles.cornerTab ?? "cornerTab";

describe("CornerTab overlay base render (T1: RF-1, RF-6)", () => {
  it("renders its children inside the root div", () => {
    const { container, getByText } = render(<CornerTab>Experience</CornerTab>);

    // "Hecho cuando" de T1: el raíz es un <div> (spec → Anatomía: un <div>
    // posicionado dentro del Box) que renderiza los children.
    const root = container.querySelector("div");
    expect(root).not.toBeNull();
    expect(root?.tagName).toBe("DIV");

    // El children es visible (spec → "Tests esperados": "Renderiza children")
    // y vive dentro del raíz, no de un wrapper (spec → Anatomía: un solo
    // elemento raíz; la query por texto encuentra el nodo con el text node
    // directo, que acá es el propio raíz).
    expect(getByText("Experience")).toBeInTheDocument();
    expect(root?.textContent).toBe("Experience");
  });

  it("applies the module base class to the root div", () => {
    const { container } = render(<CornerTab>Experience</CornerTab>);

    // P2: la clase base (`cornerTab`, con la fila "Posición" de la spec:
    // absolute/top/right/`--z-raised` por inspección) se aplica al raíz.
    const root = container.querySelector("div");
    expect(root).not.toBeNull();
    expect(root).toHaveClass(cornerTabClass);
  });

  it("exposes no role and no aria-* attribute on the root", () => {
    const { container, getByRole } = render(
      <CornerTab>
        <button type="button">Show Contacts</button>
      </CornerTab>,
    );

    // RF-6 ("Hecho cuando" de T1): el raíz no tiene `role` **ni ningún
    // atributo `aria-*`** (spec → Accesibilidad: "Sin rol propio... No debe
    // tener `aria-*`"). A diferencia de Separator (decorativo con
    // `aria-hidden="true"`), acá la ausencia es total: se recorre la lista de
    // atributos del raíz filtrando el prefijo `aria-`.
    const root = container.querySelector("div");
    expect(root).not.toBeNull();
    expect(root).not.toHaveAttribute("role");

    const ariaAttributes = Array.from(root?.attributes ?? [])
      .map((attribute) => attribute.name)
      .filter((name) => name.startsWith("aria-"));
    expect(ariaAttributes).toEqual([]);

    // RF-6 (refuerzo): los estados/roles pertenecen al contenido —el botón
    // conserva su rol y nombre accesibles intactos dentro de la tab.
    expect(getByRole("button", { name: "Show Contacts" })).toBeInTheDocument();
  });

  it("joins an external className to the base class on the root div", () => {
    const consumerClass = "nav-tab";

    // Nota de T1 (tasks.md) + spec → API + plan → Interfaz: la `className`
    // externa se UNE a la clase base del raíz (no la reemplaza). Como en
    // Badge/IconBox/Separator, se asierte la coexistencia, no el orden del
    // atributo `class` (el orden no resuelve especificidad; rige la hoja de
    // estilos).
    const { container } = render(
      <CornerTab className={consumerClass}>Experience</CornerTab>,
    );

    const root = container.querySelector("div");
    expect(root).not.toBeNull();
    expect(root).toHaveClass(cornerTabClass);
    expect(root).toHaveClass(consumerClass);
  });
});

// Tests de T2 (specs/primitives/CornerTab/tasks.md) — RF-2: variantes `size`.
// "Hecho cuando": default `md`; `sm` y `md` aplican clases distintas (P2)
// (spec → "Tests esperados": "`size='sm'` / `'md'` aplican clases distintas;
// default `md` (aserción con el criterio de CSS Modules de la fase); API:
// Default "md"). Las alturas/padding de cada variante (filas `size="md"` y
// `size="sm"` de la tabla de la spec: --size-nav-tab-height +
// --corner-tab-padding-inline / literales fijos 2.75rem y 1.25rem) se
// verifican por INSPECCIÓN del CSS (decisiones #101 y del plan → Estrategia
// de tests: jsdom no carga hojas de estilos; mismo criterio que RF-1 en T1).
// Las clases siguen el patrón P2 canónico #99 (`styles.name ?? "name"` +
// `toHaveClass`; prohibidos `!` y `as string`). La selección del raíz usa la
// misma query estructural justificada en T1 (el `<div>` raíz no tiene rol ni
// nombre accesibles por RF-6).
const mdClass = styles.md ?? "md";
const smClass = styles.sm ?? "sm";

describe("CornerTab size variants (T2: RF-2)", () => {
  it("applies the .md class and not .sm when size is omitted (default md)", () => {
    // spec → API: `size` default "md". Sin prop, el raíz lleva la variante md
    // (y NO la de sm: clases distintas).
    const { container } = render(<CornerTab>Experience</CornerTab>);

    const root = container.querySelector("div");
    expect(root).not.toBeNull();
    expect(root).toHaveClass(mdClass);
    expect(root).not.toHaveClass(smClass);
  });

  it("applies the .sm class and not .md when size=\"sm\" (distinct classes)", () => {
    // "Hecho cuando" de T2: `sm` y `md` aplican clases distintas (P2): con
    // sm presente, md queda ausente.
    const { container } = render(<CornerTab size="sm">Show Contacts</CornerTab>);

    const root = container.querySelector("div");
    expect(root).not.toBeNull();
    expect(root).toHaveClass(smClass);
    expect(root).not.toHaveClass(mdClass);
  });

  it("applies the .md class and not .sm when size=\"md\" is passed explicitly", () => {
    // `md` explícito aplica la misma variante que el default (RF-2).
    const { container } = render(<CornerTab size="md">Experience</CornerTab>);

    const root = container.querySelector("div");
    expect(root).not.toBeNull();
    expect(root).toHaveClass(mdClass);
    expect(root).not.toHaveClass(smClass);
  });
});

// Tests de T3 (specs/primitives/CornerTab/tasks.md) — RF-3: `placement="float"`
// y su `@media`. "Hecho cuando": `float` aplica su clase (P2) y `overlay`
// (default) no (spec → "Tests esperados": "`placement='float'` aplica su
// clase; default `overlay` no la aplica"). Lo testeable en jsdom es la
// APLICACIÓN de la clase: el contenido del único `@media (min-width: 992px)`
// del módulo (`position: relative; z-index: auto; float: right` + márgenes
// negativos de calc() sobre --box-padding y margin-left: var(--space-6),
// bloque textual de spec → Responsive) NO se computa en jsdom y queda por
// INSPECCIÓN del CSS (decisiones #101 y RF-3; mismo criterio que RF-1 en T1 y
// #99 para la aserción de clases). RF-4 tampoco discrimina acá: la ausencia
// de `@media print` propio es por inspección (plan → Estrategia de tests).
// La selección del raíz usa la misma query estructural justificada en T1
// (el `<div>` raíz no tiene rol ni nombre accesibles por RF-6).
const floatClass = styles.float ?? "float";

describe("CornerTab placement float class (T3: RF-3)", () => {
  it("applies the .float class when placement=\"float\"", () => {
    // "Hecho cuando" de T3: con placement="float" el raíz aplica la clase
    // float del módulo (P2; además conserva la clase base: la clase float
    // solo la sobrescribe ≥ 992px por inspección — RF-3: en < 992 permanece
    // absoluta).
    const { container } = render(
      <CornerTab placement="float">Experience</CornerTab>,
    );

    const root = container.querySelector("div");
    expect(root).not.toBeNull();
    expect(root).toHaveClass(floatClass);
    expect(root).toHaveClass(cornerTabClass);
  });

  it("does not apply the .float class when placement is omitted (default overlay)", () => {
    // spec → API: `placement` default "overlay"; spec → "Tests esperados":
    // default `overlay` no aplica la clase float.
    const { container } = render(<CornerTab>Experience</CornerTab>);

    const root = container.querySelector("div");
    expect(root).not.toBeNull();
    expect(root).not.toHaveClass(floatClass);
  });

  it("does not apply the .float class when placement=\"overlay\" is passed explicitly", () => {
    // `overlay` explícito se comporta igual que el default: solo posiciona
    // en absoluto (RF-1), sin la clase float.
    const { container } = render(
      <CornerTab placement="overlay">Experience</CornerTab>,
    );

    const root = container.querySelector("div");
    expect(root).not.toBeNull();
    expect(root).not.toHaveClass(floatClass);
  });
});
