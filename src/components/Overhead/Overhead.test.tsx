import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Overhead } from "./Overhead";

import { expectNoA11yViolations } from "../../test/a11y";

import styles from "./Overhead.module.css";

const overheadClass = styles.overhead ?? "overhead";

describe("Overhead base render (T1: RF-1)", () => {
  it("renders the children text untransformed in the DOM (uppercase comes from CSS)", () => {
    const { getByText } = render(<Overhead>Email</Overhead>);

    const root = getByText("Email");

    expect(root).toBeInTheDocument();
    expect(root.textContent).toBe("Email");
  });
});

describe("Overhead as prop and className joining (T2: RF-2)", () => {
  // extra: the default element is part of the API but not of the listed tests.
  it("renders a <span> root by default", () => {
    const { getByText } = render(<Overhead>Email</Overhead>);

    const root = getByText("Email");

    expect(root.tagName).toBe("SPAN");
  });

  it("renders a <dt> inside the dl scaffold when as=\"dt\"", () => {
    const { getByText } = render(
      <dl>
        <Overhead as="dt">Email</Overhead>
      </dl>,
    );

    const root = getByText("Email");

    expect(root.tagName).toBe("DT");
    expect(root.parentElement?.tagName).toBe("DL");
  });

  it("joins an external className to the base class on the default span root", () => {
    const consumerClass = "contact-overhead";

    const { getByText } = render(
      <Overhead className={consumerClass}>Email</Overhead>,
    );

    const root = getByText("Email");

    expect(root.tagName).toBe("SPAN");
    expect(root).toHaveClass(overheadClass);
    expect(root).toHaveClass(consumerClass);
  });

  it("joins an external className to the base class on the dt root when as=\"dt\"", () => {
    const consumerClass = "contact-overhead";

    const { getByText } = render(
      <dl>
        <Overhead as="dt" className={consumerClass}>
          Email
        </Overhead>
      </dl>,
    );

    const root = getByText("Email");

    expect(root.tagName).toBe("DT");
    expect(root.parentElement?.tagName).toBe("DL");
    expect(root).toHaveClass(overheadClass);
    expect(root).toHaveClass(consumerClass);
  });
});

describe("Overhead accessibility audit (T3: RF-6)", () => {
  it("has no accessibility violations rendering a loose span overhead", async () => {
    const { container } = render(<Overhead>Email</Overhead>);

    await expectNoA11yViolations(container);
  });

  it("has no accessibility violations rendering a dt overhead inside a dl", async () => {
    const { container } = render(
      <dl>
        <Overhead as="dt">Email</Overhead>
        <dd>alex@example.com</dd>
      </dl>,
    );

    await expectNoA11yViolations(container);
  });
});
