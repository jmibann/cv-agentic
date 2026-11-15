import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { expectNoA11yViolations } from "../../test/a11y";

import { SkillList } from "./SkillList";
import type { SkillListProps } from "./SkillList";

import badgeStyles from "../Badge/Badge.module.css";

import styles from "./SkillList.module.css";

const SKILLS: readonly string[] = ["React", "TypeScript", "a11y"];
const LABEL = "Skills";
const HEADING_ID = "resume-skills-title";

const badgeClass = badgeStyles.badge ?? "badge";
const skillListClass = styles.skillList ?? "skillList";

describe("SkillList named chip list (T1: RF-1, RF-3)", () => {
  it("renders a list named by label with one Badge li per skill in data order", () => {
    render(<SkillList label={LABEL} skills={SKILLS} />);

    const list = screen.getByRole("list", { name: LABEL });
    expect(list.tagName).toBe("UL");

    expect(list).toHaveAttribute("aria-label", LABEL);
    expect(list).not.toHaveAttribute("aria-labelledby");

    const listitems = within(list).getAllByRole("listitem");
    expect(listitems).toHaveLength(SKILLS.length);
    expect(listitems.map((listitem) => listitem.textContent)).toEqual(SKILLS);

    for (const listitem of listitems) {
      expect(listitem.tagName).toBe("LI");
      expect(listitem.parentElement).toBe(list);
      expect(listitem.className).toBe(badgeClass);
    }
  });
});

describe("SkillList labelledBy name (T1: RF-2, spec → Tests esperados 2)", () => {
  it("takes the accessible name from the referenced heading when labelledBy is given", () => {
    render(
      <>
        <h2 id={HEADING_ID}>{LABEL}</h2>
        <SkillList labelledBy={HEADING_ID} skills={SKILLS} />
      </>,
    );

    const list = screen.getByRole("list", { name: LABEL });
    expect(list).toHaveAttribute("aria-labelledby", HEADING_ID);
    expect(list).not.toHaveAttribute("aria-label");
  });
});

describe("SkillList empty skills (T1: RF-1)", () => {
  it("renders nothing when skills is empty", () => {
    const { container } = render(<SkillList label={LABEL} skills={[]} />);

    expect(container).toBeEmptyDOMElement();
  });
});

describe("SkillList accessible name must be exactly one (T1: RF-2, types)", () => {
  it("does not compile when both label and labelledBy are passed", () => {
    // @ts-expect-error passing both accessible names must not compile.
    const bothNames: SkillListProps = {
      skills: SKILLS,
      label: LABEL,
      labelledBy: HEADING_ID,
    };
    expect(bothNames.skills).toBe(SKILLS);
  });

  it("does not compile when neither label nor labelledBy is passed", () => {
    // @ts-expect-error omitting both accessible names must not compile.
    const noName: SkillListProps = { skills: SKILLS };
    expect(noName.skills).toBe(SKILLS);
  });
});

describe("SkillList className joining (T1: spec → API, G-B)", () => {
  it("joins an external className to the base class on the root ul", () => {
    const consumerClass = "resume-panel-skills";
    render(
      <SkillList label={LABEL} skills={SKILLS} className={consumerClass} />,
    );

    const list = screen.getByRole("list", { name: LABEL });
    expect(list).toHaveClass(skillListClass);
    expect(list).toHaveClass(consumerClass);
  });
});

describe("SkillList duplicate skills (T2: RF-6, spec → Tests esperados 5)", () => {
  it("renders duplicated skills without a React duplicate-key warning", () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {
      });

    const skillsWithDuplicates: readonly string[] = [
      "React",
      "React",
      "TypeScript",
    ];

    try {
      render(<SkillList label={LABEL} skills={skillsWithDuplicates} />);

      const list = screen.getByRole("list", { name: LABEL });
      const listitems = within(list).getAllByRole("listitem");
      expect(listitems).toHaveLength(3);
      expect(listitems.map((listitem) => listitem.textContent)).toEqual(
        skillsWithDuplicates,
      );

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

describe("SkillList accessibility audit (T2: cierre, spec → Tests esperados 7)", () => {
  it("has no accessibility violations with the full chip list", async () => {
    const { container } = render(<SkillList label={LABEL} skills={SKILLS} />);

    const list = screen.getByRole("list", { name: LABEL });
    expect(within(list).getAllByRole("listitem")).toHaveLength(
      SKILLS.length,
    );

    await expectNoA11yViolations(container);
  });
});
