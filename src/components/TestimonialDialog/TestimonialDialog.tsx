// TestimonialDialog — testimonio completo en un `<dialog>` nativo
// (specs/content/TestimonialDialog/spec.md). T1: montaje condicional con
// contenido (RF-1, RF-4): `testimonial === null` → `return null` (decisión
// 18=b: no hay `<dialog>` en el DOM); con valor monta el dialog y lo abre con
// `dialog.showModal()` en el effect de mount (efecto observable en jsdom como
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
// Diferidos declarados (tasks.md): T2 conecta el resto del ciclo (cleanup del
// mount-effect con `dialog.close()` si `dialog.open` para el valor→null desde
// el padre, y la detección de backdrop real vs franja de padding en click —
// RF-3); T3 crea el módulo CSS y conecta las clases de Anatomía (`.dialog`,
// `.close`, `.layout`, `.aside`, `.body`, `.quote`) — en T1 el DOM nace SIN
// clases de módulo: los tests de T1 no asertan ninguna (elección declarada al
// orchestrator: tasks asigna el módulo a T3, criterio TestimonialCard donde
// las internas conectaban en la tarea de estilos) —, el `@media print`, la
// entrada con `@starting-style` y el cierre `expectNoA11yViolations` e
// `index.ts`. El id del título es literal de Anatomía (no derivado del
// `testimonial.id` como en la card: el dialog muestra UN testimonio a la vez).

import { useEffect, useRef } from "react";

import type { Testimonial } from "@data/cv.types.generated";

import { HexAvatar } from "../HexAvatar";
import { Icon } from "../Icon";

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

  useEffect(() => {
    latestRef.current = testimonial;
  });

  // RF-1: effect de MOUNT (deps []): con valor, el dialog recién montado se
  // abre con showModal(). Sin guard `dialogRef.current` el query puede ser
  // null en el primer commit cuando el componente nació con null (return
  // null: no hay dialog); la cadena opcional lo deja en no-op. El cleanup
  // (close si open, valor→null desde el padre) es de T2.
  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  // RF-2: ÚNICO call site de onClose. Disparado por el evento `close` del
  // dialog — nativo en botón Close/backdrop (vía close()) y en Esc (el
  // navegador no llama close() pero dispara `close`; spec → ciclo). El guard
  // del ref implementa "solo si el testimonial vigente no es null".
  const handleClose = () => {
    if (latestRef.current !== null) {
      onClose();
    }
  };

  // RF-1 (decisión 18=b): cerrado = no montado. Los hooks de arriba corren
  // siempre (reglas de hooks: el retorno condicional va después).
  if (!testimonial) {
    return null;
  }

  return (
    // Anatomía literal: dialog nombrado por el h2 del autor (RF-4; aria-
    // labelledby → TITLE_ID). Clase `.dialog`: T3 (módulo).
    <dialog ref={dialogRef} aria-labelledby={TITLE_ID} onClose={handleClose}>
      {/* Botón Close (Anatomía: PRIMER hijo del dialog; `.close` con
          posición absolute: T3). `onClick` SOLO llama `dialog.close()`
          (RF-2 / No hacer): el cierre despacha el evento `close`, y es ahí
          —y no acá— donde se invoca `onClose`. */}
      <button
        type="button"
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
      {/* Layout (Anatomía; `.layout` grid auto|1fr, gap y overflow-y: T3) >
          aside (`.aside`: columna 1, oculta la comilla < 580 en T3) + body
          (`.body`: columna 2). */}
      <div>
        <div>
          {/* Avatar hexagonal: la primitiva, no se reimplementa (RF-4 / No
              hacer); `alt` default "" → decorativa (el nombre está al lado). */}
          <HexAvatar src={testimonial.avatar.src} />
          {/* Comilla gradient (tabla → Comilla; debajo del avatar, orden de
              Anatomía): sin `label` → aria-hidden; `--icon-size: 2rem` por
              la clase `.quote` en T3 (misma convención que TestimonialCard;
              defs del gradiente: AppLayout en la app, armazón en tests). */}
          <Icon name="quote" tone="gradient" />
        </div>
        <div>
          {/* Nombre accesible del dialog (RF-4): h2 con el id literal de
              Anatomía; niveles según spec (dialog usa h2; la card, h3). */}
          <h2 id={TITLE_ID}>{testimonial.author}</h2>
          {/* Rol y texto COMPLETO (RF-4; `.role` muted y márgenes: T3). */}
          <p>{testimonial.role}</p>
          <p>{testimonial.text}</p>
        </div>
      </div>
    </dialog>
  );
}
