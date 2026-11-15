// What jsdom cannot check here and is verified in a real browser instead: the
// top layer and painted ::backdrop, initial focus and focus return, the entry
// animation, the two-column layout, internal scrolling and print.
//
// The dialog is found by role because the test setup mocks showModal() to set
// the `open` attribute, and jsdom hides a <dialog> without it.

import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { Testimonial } from "@data/cv.types.generated";

import { expectNoA11yViolations } from "../../test/a11y";

import { HexAvatarDefs } from "../HexAvatar";
import { AccentGradientDefs } from "../Icon";

import { TestimonialDialog } from "./TestimonialDialog";
import type { TestimonialDialogProps } from "./TestimonialDialog";

// Fictional data, not real content.
const TESTIMONIAL: Testimonial = {
  id: "t-maria",
  author: "María González",
  role: "Product Manager, Acme Corp",
  avatar: { src: "/images/testimonials/maria.svg" },
  text: "Alex consistently delivered high-quality work and made complex features feel simple for our users.",
};

// Asserted as a literal instead of importing the component's constant, so the
// test is not a tautology.
const TITLE_ID = "testimonial-dialog-title";

const CLOSE_LABEL = "Close";

// The avatar clip path and the quote gradient need their <defs> in the
// document; in the app AppLayout mounts them once.
const testimonialDialog = (overrides: Partial<TestimonialDialogProps> = {}) => (
  <>
    <HexAvatarDefs />
    <AccentGradientDefs />
    <TestimonialDialog
      testimonial={TESTIMONIAL}
      onClose={() => undefined}
      closeLabel={CLOSE_LABEL}
      {...overrides}
    />
  </>
);

describe("TestimonialDialog conditional mount (T1: RF-1)", () => {
  it("renders nothing and mounts no dialog when testimonial is null", () => {
    // Rendered without the defs helpers so the container can be asserted empty.
    const { container } = render(
      <TestimonialDialog
        testimonial={null}
        onClose={() => undefined}
        closeLabel={CLOSE_LABEL}
      />,
    );

    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("opens the dialog when testimonial appears on a permanent tree (null to value, consumer contract)", () => {
    // The real consumer keeps the component mounted and toggles the prop, so
    // opening must follow the dialog appearing, not the component mounting.
    const onClose = vi.fn();
    const { rerender } = render(
      testimonialDialog({ testimonial: null, onClose }),
    );

    expect(screen.queryByRole("dialog")).toBeNull();

    rerender(testimonialDialog({ testimonial: TESTIMONIAL, onClose }));

    const dialog = screen.getByRole("dialog", { name: TESTIMONIAL.author });
    expect(dialog).toHaveAttribute("open");

    // Opening must not emit onClose.
    expect(onClose).not.toHaveBeenCalled();
  });
});

describe("TestimonialDialog open dialog named by the author (T1: RF-1, RF-4)", () => {
  it("mounts the dialog open via showModal and names it by its h2 through the fixed title id", () => {
    const { container } = render(testimonialDialog());

    expect(container.querySelector("clipPath#hex-avatar-outer")).not.toBeNull();
    expect(container.querySelector("linearGradient")).toHaveAttribute(
      "id",
      "accent-gradient",
    );

    const dialog = screen.getByRole("dialog", { name: TESTIMONIAL.author });
    expect(dialog.tagName).toBe("DIALOG");
    expect(dialog).toHaveAttribute("aria-labelledby", TITLE_ID);

    expect(dialog).toHaveAttribute("open");

    const heading = within(dialog).getByRole("heading", {
      level: 2,
      name: TESTIMONIAL.author,
    });
    expect(heading.tagName).toBe("H2");
    expect(heading.getAttribute("id")).toBe(TITLE_ID);
    expect(heading.getAttribute("id")).toBe(
      dialog.getAttribute("aria-labelledby"),
    );
    expect(heading.textContent).toBe(TESTIMONIAL.author);
    expect(within(dialog).getAllByRole("heading")).toHaveLength(1);
  });
});

describe("TestimonialDialog role and full text (T1: RF-4)", () => {
  it("shows the role and the complete testimonial text in the body column", () => {
    render(testimonialDialog());
    const dialog = screen.getByRole("dialog", { name: TESTIMONIAL.author });

    const roleParagraph = within(dialog).getByText(TESTIMONIAL.role);
    expect(roleParagraph.tagName).toBe("P");
    const textParagraph = within(dialog).getByText(TESTIMONIAL.text);
    expect(textParagraph.tagName).toBe("P");

    // Structure is asserted through tags and parent/child relations, not
    // through CSS module class names.
    expect(dialog.firstElementChild?.tagName).toBe("BUTTON");
    const layout = dialog.lastElementChild;
    expect(layout?.tagName).toBe("DIV");
    expect(dialog.children).toHaveLength(2);

    const aside = layout?.firstElementChild;
    const body = layout?.lastElementChild;
    expect(aside?.tagName).toBe("DIV");
    expect(body?.tagName).toBe("DIV");
    expect(layout?.children).toHaveLength(2);

    const heading = within(dialog).getByRole("heading", { level: 2 });
    expect(body?.firstElementChild).toBe(heading);
    expect(roleParagraph.parentElement).toBe(body);
    expect(textParagraph.parentElement).toBe(body);
    expect(body?.children).toHaveLength(3);
  });
});

describe("TestimonialDialog decorative avatar and quote (T1: RF-4)", () => {
  it("renders the HexAvatar with empty alt and the gradient quote below it in the aside", () => {
    render(testimonialDialog());
    const dialog = screen.getByRole("dialog", { name: TESTIMONIAL.author });

    // Selected by tag: alt="" removes the image from the accessibility tree,
    // so there is no role or name to query.
    const img = dialog.querySelector("img");
    expect(img).not.toBeNull();
    expect(img).toHaveAttribute("alt", "");
    expect(img).toHaveAttribute("src", TESTIMONIAL.avatar.src);
    expect(screen.queryByRole("img")).toBeNull();

    // Same for the quote: it is aria-hidden, so it is selected by structure.
    const quote = dialog.querySelector('svg[stroke="url(#accent-gradient)"]');
    expect(quote).not.toBeNull();
    expect(quote).toHaveClass("lucide-quote");
    expect(quote).toHaveAttribute("aria-hidden", "true");

    // closest() is not usable here: the avatar wrapper is the image's
    // grandparent, not its parent.
    const layout = dialog.lastElementChild;
    const aside = layout?.firstElementChild;
    expect(aside?.firstElementChild?.tagName).toBe("SPAN");
    expect(aside?.querySelector("img")).toBe(img);
    expect(aside?.lastElementChild).toBe(quote);
    expect(quote?.parentElement).toBe(aside);
  });
});

describe("TestimonialDialog close button named by closeLabel (T1: RF-2, Test 7)", () => {
  it("renders the Close button with type=button, aria-label from closeLabel and the x glyph", () => {
    render(testimonialDialog());
    const dialog = screen.getByRole("dialog", { name: TESTIMONIAL.author });

    const button = within(dialog).getByRole("button", { name: CLOSE_LABEL });
    expect(button.tagName).toBe("BUTTON");
    expect(button).toHaveAttribute("type", "button");
    expect(button).toHaveAttribute("aria-label", CLOSE_LABEL);

    expect(dialog.firstElementChild).toBe(button);
    const glyph = button.querySelector("svg");
    expect(glyph).not.toBeNull();
    expect(glyph).toHaveClass("lucide-x");
    expect(glyph).toHaveAttribute("aria-hidden", "true");
  });

  it("names the close button with whatever closeLabel arrives (prop wiring, no hardcoded)", () => {
    render(testimonialDialog({ closeLabel: "Cerrar" }));
    const dialog = screen.getByRole("dialog", { name: TESTIMONIAL.author });

    expect(within(dialog).queryByRole("button", { name: CLOSE_LABEL })).toBeNull();
    expect(
      within(dialog).getByRole("button", { name: "Cerrar" }),
    ).toHaveAttribute("aria-label", "Cerrar");
  });
});

describe("TestimonialDialog close button emits through the close event (T1: RF-2)", () => {
  it("calls onClose exactly once via the close event when the Close button is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(testimonialDialog({ onClose }));

    const dialog = screen.getByRole("dialog", { name: TESTIMONIAL.author });
    await user.click(within(dialog).getByRole("button", { name: CLOSE_LABEL }));

    // The mock only removes `open` and dispatches `close` inside close(), so a
    // single call plus a missing `open` proves the button went through
    // dialog.close() instead of calling onClose directly.
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(dialog).not.toHaveAttribute("open");
  });
});

describe("TestimonialDialog native close event emits onClose once (T2: RF-2)", () => {
  it("calls onClose exactly once when a synthetic close event fires (Esc path)", () => {
    // Esc does not call close(): the browser closes the dialog and fires the
    // `close` event. jsdom does not implement that, so the event is dispatched
    // by hand and `open` is left in place on purpose.
    const onClose = vi.fn();
    render(testimonialDialog({ onClose }));
    const dialog = screen.getByRole<HTMLDialogElement>("dialog", {
      name: TESTIMONIAL.author,
    });

    dialog.dispatchEvent(new Event("close"));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

// jsdom does no layout, so getBoundingClientRect returns all zeros and the
// inside/outside check could not be decided. The mocked rect spans 10..500
// horizontally and 10..400 vertically.
const mockDialogRect = (dialog: HTMLDialogElement) =>
  vi
    .spyOn(dialog, "getBoundingClientRect")
    .mockReturnValue(new DOMRect(10, 10, 490, 390));

// A native MouseEvent with coordinates: userEvent cannot target the backdrop.
const clickAt = (el: Element | null | undefined, clientX: number, clientY: number) => {
  el?.dispatchEvent(new MouseEvent("click", { clientX, clientY, bubbles: true }));
};

describe("TestimonialDialog backdrop closes, padding and content do not (T2: RF-3)", () => {
  it("closes via close() when the click targets the dialog outside its rect (real backdrop)", () => {
    const onClose = vi.fn();
    render(testimonialDialog({ onClose }));
    const dialog = screen.getByRole<HTMLDialogElement>("dialog", {
      name: TESTIMONIAL.author,
    });
    mockDialogRect(dialog);

    clickAt(dialog, 5, 5);

    // Exactly one call and no `open`: a handler calling onClose directly would
    // leave `open`, and one doing both would call twice.
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(dialog).not.toHaveAttribute("open");
  });

  it("keeps the dialog open when the click targets the dialog inside its rect (padding strip)", () => {
    const onClose = vi.fn();
    render(testimonialDialog({ onClose }));
    const dialog = screen.getByRole<HTMLDialogElement>("dialog", {
      name: TESTIMONIAL.author,
    });
    mockDialogRect(dialog);

    clickAt(dialog, 15, 15);

    expect(onClose).not.toHaveBeenCalled();
    expect(dialog).toHaveAttribute("open");
  });

  it("keeps the dialog open when the click bubbles up from the layout content", () => {
    const onClose = vi.fn();
    render(testimonialDialog({ onClose }));
    const dialog = screen.getByRole<HTMLDialogElement>("dialog", {
      name: TESTIMONIAL.author,
    });
    mockDialogRect(dialog);

    const layout = dialog.lastElementChild;
    expect(layout?.tagName).toBe("DIV");
    clickAt(layout, 250, 200);

    expect(onClose).not.toHaveBeenCalled();
    expect(dialog).toHaveAttribute("open");
  });
});

describe("TestimonialDialog parent-driven close and reopen cycle (T2: RF-3)", () => {
  it("cleanup calls dialog.close() without emitting onClose when the parent sets testimonial to null", () => {
    // The node is already detached when the cleanup runs, so close() is
    // observed with a spy on the instance: there is no accessible surface left.
    const onClose = vi.fn();
    const { rerender } = render(testimonialDialog({ onClose }));
    const dialog = screen.getByRole<HTMLDialogElement>("dialog", {
      name: TESTIMONIAL.author,
    });
    const closeSpy = vi.spyOn(dialog, "close");

    rerender(testimonialDialog({ testimonial: null, onClose }));

    expect(closeSpy).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("dialog")).toBeNull();
    // Known limitation: this assertion also passes if the ref sync were a
    // passive effect, because React 19 does not deliver the `close` event to
    // the handler of a detached node. The layout effect is still what
    // guarantees the order.
    expect(onClose).not.toHaveBeenCalled();
  });

  it("survives value null value without duplicated listeners: one onClose after reopening", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const { rerender } = render(testimonialDialog({ onClose }));
    expect(screen.getByRole("dialog", { name: TESTIMONIAL.author })).toHaveAttribute("open");

    rerender(testimonialDialog({ testimonial: null, onClose }));
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(onClose).not.toHaveBeenCalled();

    rerender(testimonialDialog({ testimonial: TESTIMONIAL, onClose }));
    const dialog = screen.getByRole("dialog", { name: TESTIMONIAL.author });
    expect(dialog).toHaveAttribute("open");

    await user.click(within(dialog).getByRole("button", { name: CLOSE_LABEL }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe("TestimonialDialog accessibility audit with the dialog open (T3: cierre, Tests esperados 8)", () => {
  it("has no accessibility violations with the full open dialog", async () => {
    const { container } = render(testimonialDialog());

    // Pins what is being audited: without these the audit could pass on an
    // empty or closed dialog.
    const dialog = screen.getByRole("dialog", { name: TESTIMONIAL.author });
    expect(dialog).toHaveAttribute("open");
    expect(
      within(dialog).getByRole("heading", {
        level: 2,
        name: TESTIMONIAL.author,
      }),
    ).toBeInTheDocument();
    expect(
      within(dialog).getByRole("button", { name: CLOSE_LABEL }),
    ).toBeInTheDocument();

    await expectNoA11yViolations(container);
  });
});
