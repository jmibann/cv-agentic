// Tests de T1 (specs/content/SkillList/tasks.md) — RF-1, RF-2, RF-3: lista
// `<ul>` con nombre accesible obligatorio (`label` o `labelledBy`), un
// `Badge as="li"` por skill en el orden de los datos, `skills=[]` → no
// renderiza nada, y los dos casos de tipos de RF-2 (`// @ts-expect-error`:
// pasar ambos nombres / omitir ambos; decisión 15). La verificación de los
// dos casos es `npm run typecheck` sobre `src/`: una directiva sin error bajo
// su línea rompe el typecheck con "Unused '@ts-expect-error' directive", y el
// error real (si estuviera) rompe con el código TS2xx correspondiente.
//
// "Hecho cuando" de T1: con `label`, `getByRole("list", { name: label })`; con
// `labelledBy` (armazón `<h2 id>` en el DOM del test, criterio Badge-`ul` /
// Overhead-`dl`), el nombre accesible sale del heading; un `listitem` por
// skill en orden, cada uno con la clase base de Badge (#99) y **sin**
// `className` extra de SkillList; `skills=[]` → `container` vacío.
//
// El chip lo pinta Badge íntegramente (decisión 15): SkillList **no** le pasa
// `className` propia (la `.chip` de la Anatomía es ilustrativa del `<li>` que
// renderiza Badge; no existe en el DOM, así que `not.toHaveClass("chip")` no
// es la aserción posible). La ausencia de className extra se asierte
// ESTRUCTURALMENTE: `li.className` comparado con `toBe` contra la clase base
// real del módulo de Badge (importado acá; patrón NavTabs T1, que importa
// `CornerTab.module.css` para la clase del hijo). Cualquier clase extra de
// SkillList en el `<li>` rompería la igualdad exacta. Fallback #99
// (`styles.name ?? "name"`; prohibidos `!` y `as`): el `??` es solo de tipos
// bajo `noUncheckedIndexedAccess`.
//
// Justificación de las queries (constitución T3): `getByRole("list", { name })`
// (Tests esperados 1 y 2; el nombre por `aria-label` o por `aria-labelledby`
// según la variante), `listitem` por rol dentro de la lista (Tests 1) y
// `textContent` para el orden. Sin `data-testid`: la API de la spec no define
// ninguno. Las aserciones de atributos (`toHaveAttribute` +
// `not.toHaveAttribute`) verifican que exactamente UNO de los dos atributos
// queda en el DOM (RF-2: siempre uno, nunca ambos).
//
// T2 (tasks.md): se agregan acá el test de duplicadas sin warning de React
// (RF-6, Tests esperados 5; spy de `console.error`, táctica declarada en el
// describe) y el cierre `expectNoA11yViolations` del archivo (constitución T4).
// La fórmula de key `skill-${index}-${value}` ya estaba en la implementación
// desde T1 (para no retocarla), así que ambos escenarios nacen VERDE
// on-arrival y se declara (decisión #101; argumento en los comentarios de cada
// describe). Los estilos wrap/gap del módulo (RF-5) y la restricción de
// superficie (RF-4) se verifican por INSPECCIÓN (jsdom no computa estilos;
// leer el CSS como texto sería un rojo artificial descartado en #101).
// `index.ts` llega con el `feat` de T2. Acá no hay íconos ni gradientes: no
// hacen falta las defs compartidas (`AccentGradientDefs`/`HexAvatarDefs`).
//
// Datos ficticios (constitución D4): fixture de skills inventada.

import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { expectNoA11yViolations } from "../../test/a11y";

import { SkillList } from "./SkillList";
import type { SkillListProps } from "./SkillList";

// Clase base real de Badge: el `<li>` debe quedar exactamente con ella
// (decisión 15: SkillList no agrega nada al chip).
import badgeStyles from "../Badge/Badge.module.css";

// Clase base del `<ul>` raíz: el módulo nace en T1 vacía (el mecanismo de
// unión #99/G-B se conecta desde T1; los estilos llegan en T2). El import fija
// el nombre real resuelto por CSS Modules (precedente ResumeSection/Timeline).
import styles from "./SkillList.module.css";

// --- Fixtures ---------------------------------------------------------------
const SKILLS: readonly string[] = ["React", "TypeScript", "a11y"];
const LABEL = "Skills";
const HEADING_ID = "resume-skills-title";

// P2 canónico #99: el fallback es solo de tipos bajo noUncheckedIndexedAccess.
const badgeClass = badgeStyles.badge ?? "badge";
const skillListClass = styles.skillList ?? "skillList";

// --- T1 · RF-1 + RF-3: lista nombrada por `label`, chips Badge en orden ------
describe("SkillList named chip list (T1: RF-1, RF-3)", () => {
  it("renders a list named by label with one Badge li per skill in data order", () => {
    render(<SkillList label={LABEL} skills={SKILLS} />);

    // Tests esperados 1 ("Hecho cuando"): getByRole("list", { name }).
    const list = screen.getByRole("list", { name: LABEL });
    expect(list.tagName).toBe("UL");

    // RF-2 (variante `label`): el nombre va por `aria-label`; `aria-labelledby`
    // no existe en el DOM (la variante no pasada queda `undefined` y React la
    // omite).
    expect(list).toHaveAttribute("aria-label", LABEL);
    expect(list).not.toHaveAttribute("aria-labelledby");

    // RF-1: un `listitem` por skill, en el orden de los datos (map sin sort).
    const listitems = within(list).getAllByRole("listitem");
    expect(listitems).toHaveLength(SKILLS.length);
    expect(listitems.map((listitem) => listitem.textContent)).toEqual(SKILLS);

    // RF-3 / decisión 15: cada ítem es exactamente un `Badge as="li"`: `<li>`
    // hijo directo del `<ul>`, con la clase base de Badge y CERO className
    // extra de SkillList (la igualdad exacta descarta cualquier otra clase;
    // `.chip` es ilustrativa).
    for (const listitem of listitems) {
      expect(listitem.tagName).toBe("LI");
      expect(listitem.parentElement).toBe(list);
      expect(listitem.className).toBe(badgeClass);
    }
  });
});

// --- T1 · RF-2: nombre accesible por `labelledBy` desde el heading ------------
describe("SkillList labelledBy name (T1: RF-2, spec → Tests esperados 2)", () => {
  it("takes the accessible name from the referenced heading when labelledBy is given", () => {
    render(
      <>
        {/* Armazón `<h2 id>` (criterio Badge-`ul`/Overhead-`dl`): el heading
            nombra la lista; el componente no escribe texto nunca. */}
        <h2 id={HEADING_ID}>{LABEL}</h2>
        <SkillList labelledBy={HEADING_ID} skills={SKILLS} />
      </>,
    );

    // "Hecho cuando": el nombre accesible del `list` sale del heading.
    const list = screen.getByRole("list", { name: LABEL });
    expect(list).toHaveAttribute("aria-labelledby", HEADING_ID);
    expect(list).not.toHaveAttribute("aria-label");
  });
});

// --- T1 · RF-1 (SI vacío): skills=[] → no renderiza ----------------------------
describe("SkillList empty skills (T1: RF-1)", () => {
  it("renders nothing when skills is empty", () => {
    const { container } = render(<SkillList label={LABEL} skills={[]} />);

    // Tests esperados 4 / plan → Decisiones: `null`, ni el `<ul>`: `container`
    // literalmente vacío ("Hecho cuando" textual).
    expect(container).toBeEmptyDOMElement();
  });
});

// --- T1 · RF-2 (tipos): exactamente uno de `label` / `labelledBy` ---------------
describe("SkillList accessible name must be exactly one (T1: RF-2, types)", () => {
  // Los dos casos se escriben como `it` que construye la expresión tipada
  // inválida SIN render (plan → Estrategia de tests, criterio "tests de tipos"
  // de la fase): `npm run typecheck` (tsc sobre src/, incluyendo tests) es el
  // que verifica la compitación; la aserción runtime solo consume la variable.
  it("does not compile when both label and labelledBy are passed", () => {
    // @ts-expect-error pasar ambos nombres accesibles no compila (RF-2).
    const bothNames: SkillListProps = {
      skills: SKILLS,
      label: LABEL,
      labelledBy: HEADING_ID,
    };
    expect(bothNames.skills).toBe(SKILLS);
  });

  it("does not compile when neither label nor labelledBy is passed", () => {
    // @ts-expect-error omitir ambos nombres accesibles no compila (RF-2).
    const noName: SkillListProps = { skills: SKILLS };
    expect(noName.skills).toBe(SKILLS);
  });
});

// extra (encargo T1): unión de `className` al `<ul>` raíz — caso 6 de "Tests
// esperados" que tasks.md asigna a T2, pero el mecanismo de unión #99/G-B nace
// con la implementación en T1 y se testa acá (criterio Timeline/ResumeSection
// T1: la unión se conecta y se verifica desde la primera tarea que renderiza el
// raíz). La unión es coexistencia, no reemplazo; el orden en el atributo
// `class` no rige (rige la hoja de estilos, precedente Box/Badge).
describe("SkillList className joining (T1: spec → API, G-B)", () => {
  it("joins an external className to the base class on the root ul", () => {
    const consumerClass = "resume-panel-skills";
    render(
      <SkillList label={LABEL} skills={SKILLS} className={consumerClass} />,
    );

    const list = screen.getByRole("list", { name: LABEL });
    // La clase externa COEXISTE con la base del módulo en el único raíz.
    expect(list).toHaveClass(skillListClass);
    expect(list).toHaveClass(consumerClass);
  });
});

// --- T2 · RF-6: skills duplicadas sin warning de React (Tests esperados 5) ----
// Táctica del spy (declarada): `vi.spyOn(console, "error")` con
// `mockImplementation` vacía CAPTURA toda la salida de error del render y la
// enmascara; luego se filtran los mensajes por regex de warning de keys de
// React (en dev el duplicate-key sale por console.error con "Encountered two
// children with the same key"; se cubren también las variantes textuales
// "unique key"/"duplicate" por si el formato difiere) y se aserta que la lista
// filtrada es vacía — NO que `console.error` no se haya llamado nunca, porque
// ruido no relacionado (ajeno a la pieza) no debería debilitar este test; la
// RF-6 habla SOLO del warning de keys. Se restaura el spy antes de assertionar
// para no dejar comportamiento mockeado si el assert falla (el afterEach de
// setup.ts no hace restore: no hay `restoreMocks` en la config de Vitest).
//
// VERDE on-arrival #101 (declarado en el commit `test`): con la key por `value`
// sola dos skills iguales colisionarían y el render emitiría el warning (rojo
// posible); pero T1 ya instaló la fórmula `skill-${index}-${value}` (RF-6),
// que para `["React","React","TypeScript"]` produce keys distintas
// (`skill-0-React`, `skill-1-React`, `skill-2-TypeScript`) → con la
// implementación correcta ningún escenario de esta tarea lo pone rojo. El
// scenario queda como FIJADO ANTI-REGRESIÓN de la fórmula (si alguien vuelve la
// key a `value` o a `index` mal formado con duplicadas, el warning aparece y
// este test lo caza; con `index` solo no emite warning pero viola la fórmula
// documentada — eso lo cierra la inspección del reviewer, RF-6/plan).
describe("SkillList duplicate skills (T2: RF-6, spec → Tests esperados 5)", () => {
  it("renders duplicated skills without a React duplicate-key warning", () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {
        // captura sin imprimir: el spy recolecta; nada se loguea en la salida
      });

    const skillsWithDuplicates: readonly string[] = [
      "React",
      "React",
      "TypeScript",
    ];

    try {
      render(<SkillList label={LABEL} skills={skillsWithDuplicates} />);

      // Tests esperados 5 / "Hecho cuando": render completo, 3 items, orden de
      // los datos con el duplicado tal cual llega (RF-1: map sin dedupe).
      const list = screen.getByRole("list", { name: LABEL });
      const listitems = within(list).getAllByRole("listitem");
      expect(listitems).toHaveLength(3);
      expect(listitems.map((listitem) => listitem.textContent)).toEqual(
        skillsWithDuplicates,
      );

      // Sin warning de keys: NINGÚN mensaje registrado contiene las variantes
      // del duplicate-key/unique-key de React. `console.error` recibe
      // `(data?: any, ...args: any[])`; se stringifica cada argumento y se une
      // por mensaje (el formato de React pasa el texto como primer arg).
      const keyWarnings = consoleErrorSpy.mock.calls
        .map((callArguments) =>
          callArguments.map((argument) => String(argument)).join(" "),
        )
        .filter((message) => /same key|unique key|duplicate/i.test(message));
      expect(keyWarnings).toEqual([]);
    } finally {
      consoleErrorSpy.mockRestore();
    }
  });
});

// ============================================================================
// CIERRE de accesibilidad (T2; constitución T4, Tests esperados 7; la última
// entrada del archivo).
//
// VERDE on-arrival #101 (declarado en el commit `test`, criterio Timeline T3 /
// ControlsBar T2): el markup ya era accesible desde T1 — `<ul>` SIEMPRE con
// nombre (`aria-label` o `aria-labelledby`, asertado en T1) e hijos `li` del
// Badge con texto — y T2 no toca el TSX: agrega el CSS del módulo (no se
// computa en jsdom) y `index.ts`. No hay forma de escribir con este alcance un
// rojo que no sea artificial. El valor del cierre es la REGRESIÓN futura sobre
// la lista completa (p. ej. perder el nombre accesible o anidar mal el `<li>`
// la capturaría axe). RF-4 (superficie) y RF-5 (wrap/gap/cero `@media`) se
// verifican por INSPECCIÓN del módulo y del consumidor (ResumePage, F4).
//
// Fixture: la lista normal (`SKILLS`, variante `label`); sin defs SVG: la pieza
// no monta `Icon tone="gradient"` ni HexAvatar (el `Badge as="li"` pinta solo
// texto).
// ============================================================================
describe("SkillList accessibility audit (T2: cierre, spec → Tests esperados 7)", () => {
  it("has no accessibility violations with the full chip list", async () => {
    const { container } = render(<SkillList label={LABEL} skills={SKILLS} />);

    // Fija lo auditado (criterio ControlsBar T2: sin assert de anclaje el
    // cierre no distingue qué rama recorre): la lista nombrada con sus 3
    // chips Badge.
    const list = screen.getByRole("list", { name: LABEL });
    expect(within(list).getAllByRole("listitem")).toHaveLength(
      SKILLS.length,
    );

    await expectNoA11yViolations(container);
  });
});
