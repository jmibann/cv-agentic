import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { Testimonial } from "@data/cv.types.generated";

import { expectNoA11yViolations } from "../../test/a11y";

import { HexAvatarDefs } from "../HexAvatar";
import { AccentGradientDefs } from "../Icon";

import { TestimonialCard } from "./TestimonialCard";
import type { TestimonialCardProps } from "./TestimonialCard";

import boxStyles from "../Box/Box.module.css";

import styles from "./TestimonialCard.module.css";

const TESTIMONIAL: Testimonial = {
  id: "t-maria",
  author: "María González",
  role: "Product Manager, Acme Corp",
  avatar: { src: "/images/testimonials/maria.svg" },
  text: "Alex consistently delivered high-quality work and made complex features feel simple for our users.",
};

// Asserted as a literal instead of rebuilding the formula, so the test is not
// a tautology.
const NAME_ID = "testimonial-t-maria-name";

const OPEN_LABEL = "Read full testimonial from María González";

const testimonialCard = (overrides: Partial<TestimonialCardProps> = {}) => (
  <>
    <HexAvatarDefs />
    <AccentGradientDefs />
    <TestimonialCard
      testimonial={TESTIMONIAL}
      openLabel={OPEN_LABEL}
      onOpen={() => undefined}
      {...overrides}
    />
  </>
);

describe("TestimonialCard named article (T1: RF-7)", () => {
  it("renders an article named by its h3 through the fixed name id", () => {
    render(testimonialCard());

    const article = screen.getByRole("article", { name: TESTIMONIAL.author });
    expect(article.tagName).toBe("ARTICLE");
    expect(article).toHaveAttribute("aria-labelledby", NAME_ID);

    const heading = within(article).getByRole("heading", {
      level: 3,
      name: TESTIMONIAL.author,
    });
    expect(heading.getAttribute("id")).toBe(NAME_ID);
    expect(heading.getAttribute("id")).toBe(
      article.getAttribute("aria-labelledby"),
    );
    expect(heading.tagName).toBe("H3");
    expect(heading.textContent).toBe(TESTIMONIAL.author);
    expect(within(article).getAllByRole("heading")).toHaveLength(1);
  });
});

describe("TestimonialCard role and excerpt (T1: RF-4, RF-7)", () => {
  it("shows the role beside the name and the testimonial text as the excerpt", () => {
    render(testimonialCard());

    const article = screen.getByRole("article", { name: TESTIMONIAL.author });

    const roleParagraph = within(article).getByText(TESTIMONIAL.role);
    expect(roleParagraph.tagName).toBe("P");

    const excerpt = within(article).getByText(TESTIMONIAL.text);
    expect(excerpt.tagName).toBe("P");

    const heading = within(article).getByRole("heading", { level: 3 });
    expect(heading.parentElement).toBe(roleParagraph.parentElement);
    expect(heading.parentElement?.tagName).toBe("DIV");
    expect(excerpt.parentElement).toBe(article);
  });
});

describe("TestimonialCard decorative avatar (T1: RF-4)", () => {
  it("renders the HexAvatar image with an empty alt as the first column of the header", () => {
    const { container } = render(testimonialCard());

    expect(container.querySelector("clipPath#hex-avatar-outer")).not.toBeNull();
    expect(container.querySelector("linearGradient")).toHaveAttribute(
      "id",
      "accent-gradient",
    );

    const article = screen.getByRole("article", { name: TESTIMONIAL.author });

    const header = article.firstElementChild;
    expect(header?.tagName).toBe("DIV");
    const avatarWrap = header?.firstElementChild;
    expect(avatarWrap?.tagName).toBe("SPAN");

    const img = avatarWrap?.querySelector("img");
    expect(img).not.toBeNull();
    expect(img).toHaveAttribute("alt", "");
    expect(img).toHaveAttribute("src", TESTIMONIAL.avatar.src);

    expect(screen.queryByRole("img")).toBeNull();

    const heading = within(article).getByRole("heading", { level: 3 });
    expect(header?.lastElementChild).toBe(heading.parentElement);
    expect(heading.parentElement?.parentElement).toBe(header);
  });
});

describe("TestimonialCard decorative quote glyph (T1: RF-4)", () => {
  it("renders the quote icon as a decorative gradient svg with no accessible name", () => {
    render(testimonialCard());

    const article = screen.getByRole("article", { name: TESTIMONIAL.author });

    const glyph = article.querySelector('svg[stroke="url(#accent-gradient)"]');
    expect(glyph).not.toBeNull();
    expect(glyph).toHaveClass("lucide-quote");
    expect(glyph).toHaveAttribute("aria-hidden", "true");

    expect(within(article).queryByRole("img")).toBeNull();

    expect(glyph?.parentElement).toBe(article);
  });
});

describe("TestimonialCard stretched button is the only focusable (T2: RF-1)", () => {
  it("renders the named button as the only focusable control and keeps the article non-clickable", () => {
    render(testimonialCard());

    const article = screen.getByRole("article", { name: TESTIMONIAL.author });

    const button = within(article).getByRole("button", { name: OPEN_LABEL });
    expect(button).toHaveAttribute("aria-label", OPEN_LABEL);

    expect(button.tagName).toBe("BUTTON");
    expect(button).toHaveAttribute("type", "button");
    expect(button.childNodes).toHaveLength(0);
    expect(article.lastElementChild).toBe(button);

    expect(screen.getAllByRole("button")).toHaveLength(1);
    expect(screen.queryAllByRole("link")).toHaveLength(0);
    expect(screen.queryAllByRole("textbox")).toHaveLength(0);
    expect(screen.queryAllByRole("tab")).toHaveLength(0);
    expect(
      Array.from(
        article.querySelectorAll("button, a, input, select, textarea, [tabindex]"),
      ),
    ).toEqual([button]);

    // jsdom can only prove the absence of declarative hiding; the real display is
    // checked in a browser.
    expect(button).toBeVisible();
    expect(button).not.toHaveAttribute("hidden");
    expect(button).not.toHaveAttribute("disabled");

    expect(article).not.toHaveAttribute("tabindex");
    expect(article).not.toHaveAttribute("onclick");
  });
});

describe("TestimonialCard button activation (T2: RF-1)", () => {
  it("calls onOpen once with the testimonial id when the button is clicked", async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    render(testimonialCard({ onOpen }));

    await user.click(screen.getByRole("button", { name: OPEN_LABEL }));

    expect(onOpen).toHaveBeenCalledTimes(1);
    expect(onOpen).toHaveBeenCalledWith("t-maria");
  });

  it("calls onOpen once with the testimonial id when Enter activates the focused button", async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    render(testimonialCard({ onOpen }));

    await user.tab();
    expect(screen.getByRole("button", { name: OPEN_LABEL })).toHaveFocus();

    await user.keyboard("{Enter}");

    expect(onOpen).toHaveBeenCalledTimes(1);
    expect(onOpen).toHaveBeenCalledWith("t-maria");
  });

  it("calls onOpen once with the testimonial id when Space activates the focused button", async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    render(testimonialCard({ onOpen }));

    await user.tab();
    expect(screen.getByRole("button", { name: OPEN_LABEL })).toHaveFocus();

    await user.keyboard(" ");

    expect(onOpen).toHaveBeenCalledTimes(1);
    expect(onOpen).toHaveBeenCalledWith("t-maria");
  });
});

// extra: className forwarding is part of the API.
describe("TestimonialCard className forwarding (T1: spec → API, G-B)", () => {
  it("joins an external className on the root article alongside .card and the Box inner class", () => {
    const consumerClass = "testimonial-carousel-item";
    const innerClass = boxStyles.inner ?? "inner";
    const cardClass = styles.card ?? "card";

    render(testimonialCard({ className: consumerClass }));

    const article = screen.getByRole("article", { name: TESTIMONIAL.author });
    expect(article).toHaveClass(innerClass);
    expect(article).toHaveClass(cardClass);
    expect(article).toHaveClass(consumerClass);
  });
});

describe("TestimonialCard accessibility audit (T3: cierre, spec → Tests esperados 6)", () => {
  it("has no accessibility violations with the full card", async () => {
    const { container } = render(testimonialCard());

    const article = screen.getByRole("article", { name: TESTIMONIAL.author });
    expect(
      within(article).getByRole("heading", {
        level: 3,
        name: TESTIMONIAL.author,
      }),
    ).toBeInTheDocument();
    expect(
      within(article).getByRole("button", { name: OPEN_LABEL }),
    ).toBeInTheDocument();
    expect(within(article).getByText(TESTIMONIAL.text)).toBeInTheDocument();
    expect(container.querySelector("clipPath#hex-avatar-outer")).not.toBeNull();
    expect(container.querySelector("linearGradient")).toHaveAttribute(
      "id",
      "accent-gradient",
    );

    await expectNoA11yViolations(container);
  });
});
