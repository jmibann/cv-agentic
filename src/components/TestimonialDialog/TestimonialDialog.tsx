import { useEffect, useLayoutEffect, useRef } from "react";
import type { MouseEvent } from "react";

import type { Testimonial } from "@data/cv.types.generated";

import { HexAvatar } from "../HexAvatar";
import { Icon } from "../Icon";

import styles from "./TestimonialDialog.module.css";

// Fixed id: the dialog shows one testimonial at a time, so it does not need
// to be derived from the testimonial id.
const TITLE_ID = "testimonial-dialog-title";

export interface TestimonialDialogProps {
  /** null = closed (the dialog is not mounted). */
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

  // Latest prop value, read by the `close` handler to tell a close started by
  // the user (emit onClose) from one started by the parent (do not emit).
  const latestRef = useRef<Testimonial | null>(testimonial);

  // Layout effect, not a passive one: when the parent sets the prop to null,
  // the ref must already be null by the time the open effect's cleanup calls
  // close(). Passive effects run every destroy before any create, so a passive
  // sync would still hold the old value at that point.
  useLayoutEffect(() => {
    latestRef.current = testimonial;
  });

  // Depend on presence, not on mount: the carousel keeps this component
  // mounted and toggles the prop between null and a value, so an empty
  // dependency list would never reopen the dialog.
  const open = testimonial !== null;
  useEffect(() => {
    if (!open) {
      return;
    }
    // Capture the node here: React detaches the ref during the mutation phase,
    // before this cleanup runs, so reading dialogRef.current there gives null.
    const el = dialogRef.current;
    el?.showModal();
    return () => {
      // Only if still open: the user may already have closed it.
      if (el && el.open) {
        el.close();
      }
    };
  }, [open]);

  // The only place that calls onClose. Every way of closing (button, backdrop,
  // Esc) ends in the native `close` event, so they all go through here.
  const handleClose = () => {
    if (latestRef.current !== null) {
      onClose();
    }
  };

  // A click on the backdrop targets the dialog itself, but so does a click on
  // the dialog's own padding. Checking the coordinates against the bounding
  // rect tells them apart: only clicks outside the box close.
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

  if (!testimonial) {
    return null;
  }

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby={TITLE_ID}
      onClose={handleClose}
      onClick={handleDialogClick}
    >
      {/* Calls dialog.close(), never onClose directly: the `close` event is
          the single source of truth for closing. */}
      <button
        type="button"
        className={styles.close}
        aria-label={closeLabel}
        onClick={() => {
          dialogRef.current?.close();
        }}
      >
        <Icon name="x" />
      </button>
      <div className={styles.layout}>
        <div className={styles.aside}>
          {/* Decorative: the author's name is right next to it. */}
          <HexAvatar src={testimonial.avatar.src} />
          {/* The size class goes on the icon itself: --icon-size does not
              inherit, so a wrapper could not set it. */}
          <Icon name="quote" tone="gradient" className={styles.quote} />
        </div>
        <div className={styles.body}>
          <h2 id={TITLE_ID}>{testimonial.author}</h2>
          <p className={styles.role}>{testimonial.role}</p>
          <p>{testimonial.text}</p>
        </div>
      </div>
    </dialog>
  );
}
