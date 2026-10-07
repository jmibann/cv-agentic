// TestimonialDialog — testimonio completo en un `<dialog>` nativo
// (specs/content/TestimonialDialog/spec.md). T1: montaje condicional con
// contenido (RF-1, RF-4): `testimonial === null` → `return null` (decisión
// 18=b: no hay `<dialog>` en el DOM); con valor monta el dialog y lo abre con
// `dialog.showModal()` en un effect atado a la PRESENCIA del nodo (dep
// booleana `testimonial !== null`: revive en la transición null→valor del
// consumidor permanente —reparo T1 ronda 1—; efecto observable en jsdom como
// atributo `open` vía el mock de src/test/setup.ts; el top layer real es del
// navegador — QA F5). Anatomía literal (spec → Anatomía): botón Close primero
// (`type="button"`, `aria-label={closeLabel}`, `<Icon name="x" />`
// decorativo), después `div.layout` > `div.aside` (HexAvatar arriba + comilla
// `Icon name="quote" tone="gradient"` debajo, ambos decorativos) + `div.body`
// (`<h2 id="testimonial-dialog-title">` con el autor — único nombre
// accesible del dialog vía `aria-labelledby` (RF-4)—, `<p>` role y `<p>` con
// el texto completo). RF-2 (tramo T1): `handleClose` sobre el evento `close`
// del dialog es el ÚNICO call site de `onClose` (spec → No hacer: el botón
// llama `dialog.close()`, nunca `onClose` directo; el mock de setup.ts
// despacha `close` dentro de `close()`); el guard lee el último valor de la
// prop desde un ref (tabla → ciclo: el cierre iniciado por el padre con
// `testimonial === null` no debe invocar `onClose`).
//
// T2 (tasks.md) conecta el resto del ciclo sobre ESTE archivo, sin cambiar la
// API: (a) el cleanup del effect de apertura (el mismo effect de arriba, dep
// `[open]`) cierra con `dialog.close()` si `dialog.open` en valor→null desde
// el padre y en el desmontaje — captura `const el = dialogRef.current` en el
// CUERPO del effect porque React desprende el ref en la fase de mutación,
// antes del cleanup; (b) el guard emisor exige que la sincronización del
// `latest` ya sea null ANTES de ese cleanup (spec → tabla: "el ref ya es
// null"), así que el sync pasa de `useEffect` a `useLayoutEffect`: el create
// de la fase de layout corre en el commit y el destroy de los effects passive
// en el flush posterior — con useEffect, la sync viviría el MISMO flush y los
// destroy correrían antes que sus creates (matiz medido en esta pila, en
// comentario del sync y en el test: sobre el nodo desprendido el evento no
// alcanza al handler por un detalle interno de React 19; la invariant de la
// tabla se cumple igual); (c) `handleDialogClick` implementa el backdrop
// real de decisión 19 sobre el `<dialog>`:
// cierra SOLO si `target === dialog` Y el punto cae fuera del
// `getBoundingClientRect()` del dialog — la franja de padding del dialog
// (target === dialog, punto dentro del rect) y los clicks que burbujean desde
// el contenido NO cierran (RF-3); ninguno llama `onClose` directo: todos pasan
// por `close()` → evento `close` → `handleClose` (No hacer).
//
// T3 (tasks.md) creó el módulo CSS y conectó las clases de Anatomía
// (`.dialog`, `.close`, `.layout`, `.aside`, `.body`, `.quote` — esta vía la
// prop `className` de Icon, única forma de fijar `--icon-size` en el propio
// glifo; el HexAvatar va DIRECTO y el <p> de rol sin clase: la tabla de esta
// pieza no les asigna fila, ver comentarios en el JSX) y creó el `index.ts` y
// el cierre `expectNoA11yViolations` del test. En T1 el DOM nació SIN clases
// de módulo (los tests de T1/T2 no asertan ninguna: estructura y roles; la
// conexión de T3 no cambia el DOM observable). El id del título es literal de
// Anatomía (no derivado del `testimonial.id` como en la card: el dialog
// muestra UN testimonio a la vez).
//
// Diferido restante (ÚNICO, declarado por la spec): foco inicial en el botón
// Close al abrir y retorno de foco al disparador al cerrar, top layer y
// ::backdrop reales — NATIVOS del navegador, verificación en QA F5 (jsdom no
// los implementa; RF-4 y tabla → Ciclo). Las medidas de la tabla (grid,
// scroll interno, entrada @starting-style, 580/print) se verifican por
// INSPECCIÓN del módulo + QA F5 (#101).

import { useEffect, useLayoutEffect, useRef } from "react";
import type { MouseEvent } from "react";

import type { Testimonial } from "@data/cv.types.generated";

import { HexAvatar } from "../HexAvatar";
import { Icon } from "../Icon";

import styles from "./TestimonialDialog.module.css";

// Id fijo de spec → Anatomía (`aria-labelledby="testimonial-dialog-title"` y
// el mismo id en el `<h2>`). Constante del módulo (no prop): el contrato la
// fija literal (export constante junto al componente permitida por
// react-refresh: `allowConstantExport`; no forma parte de la API pública).
const TITLE_ID = "testimonial-dialog-title";

// API (spec → API, COMPLETA desde T1): `testimonial === null` significa
// cerrado (montaje condicional, RF-1); `onClose` se emite SOLO desde el
// evento `close` del dialog (RF-2); `closeLabel` es el `aria-label` del
// botón, ya resuelto por el padre desde ui.{en,es}.ts (C2/C3). Sin
// `className` en la API (spec → API/plan → Interfaz).
export interface TestimonialDialogProps {
  /** null = cerrado. */
  testimonial: Testimonial | null;
  onClose: () => void;
  closeLabel: string;
}

export function TestimonialDialog({
  testimonial,
  onClose,
  closeLabel,
}: TestimonialDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Último valor de la prop, leído en el handler del evento `close` (tabla →
  // ciclo): distinguir cierre iniciado por el usuario (ref no-null → emitir
  // onClose) del iniciado por el padre (ref null → no emitir). Con
  // return-null el dialog ni existe, pero el ref se sincroniza igual para
  // que el handler montado nunca lea un valor obsoleto.
  const latestRef = useRef<Testimonial | null>(testimonial);

  // T2 — ORDEN del guard (razonamiento completo; el mismo matiz se declara en
  // el test del cierre por el padre). La spec → tabla fija que en valor→null
  // el `close` disparado por el cleanup "no llama onClose (el ref ya es
  // null)": la sincronización debe completarse ANTES de ese cleanup. Con
  // `useEffect` (deps ausentes) la sync viviría en el MISMO flush passive que
  // el cleanup de apertura, y React corre TODOS los destroy antes que los
  // creates: al despacharse `close()` el ref aún traería el valor viejo. La
  // fase de layout (useLayoutEffect, create síncrono en el commit) corre antes
  // del flush passive: el ref ya es null cuando el cleanup cierra. Matiz
  // MEDIDO en esta pila (React 19 + jsdom): el assert del test queda verde
  // incluso con useEffect, porque React borra la instancia interna del nodo
  // retirado en la fase de mutación y el `close` despachado sobre el nodo
  // desprendido ni llega al handler — detalle interno de eventos de React, no
  // contrato de la spec; el useLayoutEffect cumple la invariant POR SI MISMA
  // (si ese detalle cambiara, el guard sigue siendo correcto). Que el evento
  // llega al handler mientras el nodo está montado está probado en el test
  // "synthetic close event (Esc path)".
  useLayoutEffect(() => {
    latestRef.current = testimonial;
  });

  // RF-1: el dialog se abre cuando el NODO APARECE, no solo en el mount del
  // componente. La dep es la presencia (booleana): el consumidor real
  // (Carousel) mantiene esta pieza montada de forma permanente y alterna
  // `testimonial` null ↔ valor, así que con deps [] el effect no revivía en
  // la transición null→valor y el dialog quedaba sin `open` (reparo T1
  // ronda 1). Con `open === false` el nodo no existe (return null): no-op. Al
  // pasar a true —ya sea en el mount directo con valor (el effect de mount
  // corre siempre) o en un rerender null→valor— el `<dialog>` recién
  // adjunto se abre con showModal().
  const open = testimonial !== null;
  useEffect(() => {
    if (!open) {
      return;
    }
    // T2 / guía del review de T1: el nodo se CAPTURA en el cuerpo del effect.
    // En valor→null React desprende `dialogRef` en la fase de mutación (el
    // elemento se retira del DOM), antes del cleanup passive: leer
    // `dialogRef.current` en el cleanup daría null y `close()` no correría.
    const el = dialogRef.current;
    el?.showModal();
    return () => {
      // RF-3 / tabla → ciclo: cierre INICIADO POR EL PADRE (valor→null) o
      // desmontaje: `dialog.close()` solo si sigue abierto (si el usuario
      // cerró antes por botón, backdrop o Esc, `el.open` ya es false y no hay
      // un segundo `close()`). El `close` resultante NO emite `onClose`: el
      // guard de `handleClose` ya ve el ref en null — la sync de layout corrió
      // antes de este cleanup (comentario del useLayoutEffect; en esta pila
      // el nodo desprendido ni entrega el evento al handler, matiz medido).
      if (el && el.open) {
        el.close();
      }
    };
  }, [open]);

  // RF-2: ÚNICO call site de onClose. Disparado por el evento `close` del
  // dialog — nativo en botón Close/backdrop (vía close()) y en Esc (el
  // navegador no llama close() pero dispara `close`; spec → ciclo). El guard
  // del ref implementa "solo si el testimonial vigente no es null".
  const handleClose = () => {
    if (latestRef.current !== null) {
      onClose();
    }
  };

  // RF-3 / decisión 19 (backdrop real vs franja de padding): el click solo
  // cierra si su `target` es el propio `<dialog>` —los clicks del contenido
  // burbujean con target ≠ dialog y el guard corta antes de mirar coords—
  // Y el punto cae FUERA del bounding rect del dialog (donde está el
  // ::backdrop). Dentro del rect, aunque el target sea el dialog (franja de
  // `padding` del elemento), NO cierra. Como en el resto del ciclo, el cierre
  // pasa por `dialog.close()` — nunca `onClose` directo (No hacer): la
  // emisión la hace el evento `close` en `handleClose`. La detección vive en
  // el handler (evento con DOM; plan → Funciones puras: no se extrae a pura).
  const handleDialogClick = (event: MouseEvent<HTMLDialogElement>) => {
    const el = dialogRef.current;
    if (!el || event.target !== el) {
      return;
    }
    const rect = el.getBoundingClientRect();
    if (
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom
    ) {
      el.close();
    }
  };

  // RF-1 (decisión 18=b): cerrado = no montado. Los hooks de arriba corren
  // siempre (reglas de hooks: el retorno condicional va después).
  if (!testimonial) {
    return null;
  }

  return (
    // Anatomía literal: dialog nombrado por el h2 del autor (RF-4; aria-
    // labelledby → TITLE_ID). `onClick` implementa el backdrop real de
    // RF-3/decisión 19 (handleDialogClick; el padding y el contenido no
    // cierran). `.dialog` (T3): la tabla completa de la fila "Dialog" + la
    // entrada con @starting-style; el centrado y el top layer son NATIVOS de
    // la UA del dialog modal (la tabla no lista margin/position: no se
    // declara nada).
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby={TITLE_ID}
      onClose={handleClose}
      onClick={handleDialogClick}
    >
      {/* Botón Close (Anatomía: PRIMER hijo del dialog; `.close` —T3—:
          absolute top/right --space-4, cuadrado --size-control, radio
          --radius-12, fondo --color-surface-muted, color --color-text con
          hover --color-accent-text y anillo focus-visible estándar; el
          centrado del glifo y el reset de borde del <button> son necesidades
          mecánicas documentadas en el módulo). `onClick` SOLO llama
          `dialog.close()` (RF-2 / No hacer): el cierre despacha el evento
          `close`, y es ahí —y no acá— donde se invoca `onClose`. */}
      <button
        type="button"
        className={styles.close}
        aria-label={closeLabel}
        onClick={() => {
          dialogRef.current?.close();
        }}
      >
        {/* Ícono decorativo (el nombre del botón lo da aria-label; DESIGN
            → Do/Don't): sin `label` → aria-hidden; tamaño default
            `--size-icon` sin clase propia (tabla → Close). */}
        <Icon name="x" />
      </button>
      {/* Layout (Anatomía; `.layout` —T3—: grid con `gap: var(--space-6)`,
          `auto 1fr` SOLO ≥580 (RF-6: base = una columna) y scroll interno
          `overflow-y: auto` + `min-height: 0` (decisión 19; la limitación de
          altura viene del max-height del dialog, fila "Dialog") >
          aside (`.aside`: columna 1; apila avatar sobre comilla) + body
          (`.body`: columna 2). */}
      <div className={styles.layout}>
        <div className={styles.aside}>
          {/* Avatar hexagonal: la primitiva, no se reimplementa (RF-4 / No
              hacer); `alt` default "" → decorativa (el nombre está al lado).
              Sin `className`: la tabla → "Avatar" no le asigna clase propia
              en esta pieza (a diferencia de la card, con su offset). */}
          <HexAvatar src={testimonial.avatar.src} />
          {/* Comilla gradient (tabla → Comilla; debajo del avatar, orden de
              Anatomía): sin `label` → aria-hidden; `--icon-size: 2rem` por la
              clase `.quote` unida al propio <svg> vía `className` (Icon RF-6:
              @property inherits:false; misma convención que TestimonialCard;
              defs del gradiente: AppLayout en la app, armazón en tests).
              Oculta < 580 (RF-6): display: none base, visible en el único
              @media de layout del módulo. */}
          <Icon name="quote" tone="gradient" className={styles.quote} />
        </div>
        <div className={styles.body}>
          {/* Nombre accesible del dialog (RF-4): h2 con el id literal de
              Anatomía; niveles según spec (dialog usa h2; la card, h3). */}
          <h2 id={TITLE_ID}>{testimonial.author}</h2>
          {/* Rol y texto COMPLETO (RF-4). Sin clase propia: la tabla
              "Estilos y tokens" de ESTA pieza no define ninguna fila para el
              rol del dialog (el muted/offset es de la card; la muestra HTML
              de Anatomía `class="role"` no tiene estilo asignado y no se
              inventan propiedades — nota reportada al cerrar T3); el
              espaciado lo da el flujo de bloques (margen de párrafo UA) y el
              excedente de altura lo scrollea `.layout`. */}
          <p>{testimonial.role}</p>
          <p>{testimonial.text}</p>
        </div>
      </div>
    </dialog>
  );
}
