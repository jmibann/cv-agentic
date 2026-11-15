import { render, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { expectNoA11yViolations } from "../../test/a11y";

import { Button } from "./Button";

import styles from "./Button.module.css";

describe("Button element branch (T1: RF-1)", () => {
  it("renders a <button> whose accessible name comes from children when no href is given", () => {
    const { getByRole } = render(<Button>Download CV</Button>);

    expect(getByRole("button", { name: "Download CV" })).toBeInTheDocument();
  });

  it("uses type=\"button\" by default when no type is given", () => {
    const { getByRole } = render(<Button>Download CV</Button>);

    expect(getByRole("button", { name: "Download CV" })).toHaveAttribute(
      "type",
      "button",
    );
  });

  it("passes an explicit type=\"submit\" to the <button>", () => {
    const { getByRole } = render(<Button type="submit">Send message</Button>);

    expect(getByRole("button", { name: "Send message" })).toHaveAttribute(
      "type",
      "submit",
    );
  });
});

describe("Button onClick and disabled (T2: RF-3)", () => {
  it("calls the onClick handler when the button is clicked", async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    const { getByRole } = render(
      <Button onClick={handleClick}>Download CV</Button>,
    );

    await user.click(getByRole("button", { name: "Download CV" }));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("does not call the onClick handler and renders the <button> disabled", async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    const { getByRole } = render(
      <Button disabled onClick={handleClick}>
        Download CV
      </Button>,
    );

    const button = getByRole("button", { name: "Download CV" });

    expect(button).toBeDisabled();

    await user.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });
});

describe("Button link branch (T3: RF-2, RF-8, RF-9)", () => {
  it("renders an <a> with the given href and accessible name from children", () => {
    const { getByRole } = render(<Button href="/files/cv.pdf">Download CV</Button>);

    const link = getByRole("link", { name: "Download CV" });
    expect(link).toHaveAttribute("href", "/files/cv.pdf");
  });

  it("adds rel=\"noopener noreferrer\" when target=\"_blank\" is given without rel", () => {
    const { getByRole } = render(
      <Button href="https://example.com/cv.pdf" target="_blank">
        Download CV
      </Button>,
    );

    const link = getByRole("link", { name: "Download CV" });
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("uses an explicit rel as-is without merging the default", () => {
    const { getByRole } = render(
      <Button
        href="https://example.com/cv.pdf"
        target="_blank"
        rel="nofollow"
      >
        Download CV
      </Button>,
    );

    expect(getByRole("link", { name: "Download CV" })).toHaveAttribute(
      "rel",
      "nofollow",
    );
  });

  it("transmits download to the <a> with its value", () => {
    const stringValue = render(
      <Button href="/files/cv.pdf" download="cv-2026.pdf">
        Download CV
      </Button>,
    );
    expect(
      within(stringValue.container).getByRole("link", { name: "Download CV" }),
    ).toHaveAttribute("download", "cv-2026.pdf");

    const boolValue = render(
      <Button href="/files/cv.pdf" download>
        Download CV
      </Button>,
    );
    expect(
      within(boolValue.container).getByRole("link", { name: "Download CV" }),
    ).toHaveAttribute("download");
  });
});

describe("Button decorative icon and iconPosition (T4: RF-4, RF-7)", () => {
  const getIconParts = (root: HTMLElement, labelText: string) => {
    const svg = root.querySelector("svg");
    const label = Array.from(root.childNodes).find(
      (node) =>
        node.nodeType === Node.TEXT_NODE &&
        (node.textContent?.trim() ?? "") === labelText,
    );
    if (svg === null || label === undefined) {
      throw new Error(
        `Falta ${svg === null ? "el <svg> decorativo" : "el nodo de texto del label"} en el raíz del Button`,
      );
    }
    return { svg, label };
  };

  it("renders the icon as a decorative aria-hidden svg keeping the accessible name as only the label text", () => {
    const { getByRole } = render(<Button icon="download">Download CV</Button>);

    const button = getByRole("button", { name: "Download CV" });
    expect(button).toHaveAccessibleName("Download CV");

    const { svg } = getIconParts(button, "Download CV");
    expect(svg).toHaveAttribute("aria-hidden", "true");
  });

  it("places the svg before the label text by default (iconPosition start)", () => {
    const { getByRole } = render(<Button icon="download">Download CV</Button>);

    const button = getByRole("button", { name: "Download CV" });
    const { svg, label } = getIconParts(button, "Download CV");
    expect(
      svg.compareDocumentPosition(label) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("places the svg after the label text when iconPosition=\"end\"", () => {
    const { getByRole } = render(
      <Button icon="download" iconPosition="end">
        Download CV
      </Button>,
    );

    const button = getByRole("button", { name: "Download CV" });
    const { svg, label } = getIconParts(button, "Download CV");
    expect(
      svg.compareDocumentPosition(label) & Node.DOCUMENT_POSITION_PRECEDING,
    ).toBeTruthy();
  });

  it("renders the decorative icon on the link branch with the accessible name intact and the svg first", () => {
    const { getByRole } = render(
      <Button href="/files/cv.pdf" icon="download">
        Download CV
      </Button>,
    );

    const link = getByRole("link", { name: "Download CV" });
    expect(link).toHaveAccessibleName("Download CV");

    const { svg, label } = getIconParts(link, "Download CV");
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(
      svg.compareDocumentPosition(label) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });
});

const smallClass = styles.small ?? "small";
const fullWidthClass = styles.fullWidth ?? "fullWidth";

describe("Button size, fullWidth classes and className join (T5: RF-6)", () => {
  it("applies the module .small class on the <button> root when size=\"small\"", () => {
    const { getByRole } = render(<Button size="small">Download CV</Button>);

    expect(getByRole("button", { name: "Download CV" })).toHaveClass(
      smallClass,
    );
  });

  it("does not apply the size or fullWidth classes when the props are omitted (defaults)", () => {
    const { getByRole } = render(<Button>Download CV</Button>);
    const button = getByRole("button", { name: "Download CV" });

    expect(button).not.toHaveClass(smallClass);
    expect(button).not.toHaveClass(fullWidthClass);
  });

  it("applies the module .fullWidth class on the root when fullWidth is set", () => {
    const { getByRole } = render(<Button fullWidth>Download CV</Button>);

    expect(getByRole("button", { name: "Download CV" })).toHaveClass(
      fullWidthClass,
    );
  });

  it("joins the external className together with .small and .fullWidth on the same root", () => {
    const externalClass = "sidebar-download";
    const { getByRole } = render(
      <Button size="small" fullWidth className={externalClass}>
        Download CV
      </Button>,
    );
    const button = getByRole("button", { name: "Download CV" });

    expect(button).toHaveClass(smallClass);
    expect(button).toHaveClass(fullWidthClass);
    expect(button).toHaveClass(externalClass);
  });

  it("applies the classes and the joined className on the link branch root", () => {
    const externalClass = "hero-download";
    const { getByRole } = render(
      <Button
        href="/files/cv.pdf"
        size="small"
        fullWidth
        className={externalClass}
      >
        Download CV
      </Button>,
    );
    const link = getByRole("link", { name: "Download CV" });

    expect(link).toHaveClass(smallClass);
    expect(link).toHaveClass(fullWidthClass);
    expect(link).toHaveClass(externalClass);
  });
});

describe("Button accessibility audit (T6: RF-5, RF-6)", () => {
  it("has no accessibility violations on the button branch with a decorative icon", async () => {
    const { container } = render(<Button icon="download">Download CV</Button>);

    await expectNoA11yViolations(container);
  });

  it("has no accessibility violations on the link branch", async () => {
    const { container } = render(
      <Button href="/files/cv.pdf" download="cv-2026.pdf" icon="download" iconPosition="end">
        Download CV
      </Button>,
    );

    await expectNoA11yViolations(container);
  });
});
