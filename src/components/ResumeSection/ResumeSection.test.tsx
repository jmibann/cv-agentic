import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { Locale, TimelineEntry } from "@data/cv.types.generated";

import { AccentGradientDefs } from "../Icon";

import { ResumeSection } from "./ResumeSection";
import type { ResumeSectionProps } from "./ResumeSection";

import { expectNoA11yViolations } from "../../test/a11y";

import styles from "./ResumeSection.module.css";

const ENTRY_CS: TimelineEntry = {
  id: "cs-degree",
  title: "B.Sc. in Computer Science",
  organization: "Northlake State University",
  start: "2012",
  end: "2017",
  description: "Focus on software engineering.",
};

const ENTRY_LEAD: TimelineEntry = {
  id: "lead-fe",
  title: "Lead Frontend Developer",
  organization: "Example Digital Studio",
  start: "2018",
  end: null,
  description: "Design systems and accessibility work.",
};

const ENTRIES: readonly TimelineEntry[] = [ENTRY_CS, ENTRY_LEAD];

const TITLE = "Education";
const SECTION_ID = "education";
const ICON = "book-open";
const ID_PREFIX = "edu";
const LOCALE: Locale = "en";
const PRESENT_LABEL = "Present";

const resumeSection = (
  overrides: Partial<
    Pick<
      ResumeSectionProps,
      "id" | "title" | "timelineIdPrefix" | "entries" | "className"
    >
  > = {},
) => (
  <>
    <AccentGradientDefs />
    <ResumeSection
      id={SECTION_ID}
      timelineIdPrefix={ID_PREFIX}
      title={TITLE}
      icon={ICON}
      entries={ENTRIES}
      locale={LOCALE}
      presentLabel={PRESENT_LABEL}
      {...overrides}
    />
  </>
);

describe("ResumeSection named region (T1: RF-1, RF-3, RF-5)", () => {
  it("renders a section region named by its h2 through the derived title id", () => {
    render(resumeSection());

    const region = screen.getByRole("region", { name: TITLE });
    expect(region.tagName).toBe("SECTION");
    expect(region).toHaveAttribute(
      "aria-labelledby",
      "resume-education-title",
    );

    const heading = within(region).getByRole("heading", {
      level: 2,
      name: TITLE,
    });
    expect(heading.getAttribute("id")).toBe("resume-education-title");
    expect(heading.getAttribute("id")).toBe(
      region.getAttribute("aria-labelledby"),
    );
  });
});

describe("ResumeSection heading icon (T1: RF-2, spec → Tests esperados 2)", () => {
  it("renders the decorative IconBox glyph inside the h2 keeping its accessible name as only the text", () => {
    render(resumeSection());

    const region = screen.getByRole("region", { name: TITLE });
    const heading = within(region).getByRole("heading", { level: 2 });

    const iconBox = heading.firstElementChild;
    expect(iconBox?.tagName).toBe("SPAN");
    expect(iconBox).toHaveAttribute("aria-hidden", "true");
    expect(
      iconBox?.querySelector('svg[stroke="url(#accent-gradient)"]'),
    ).not.toBeNull();
    expect(heading.textContent).toBe(TITLE);
  });
});

describe("ResumeSection timeline delegation (T1: RF-2)", () => {
  it("renders a list with one listitem per entry in data order inside the region", () => {
    render(resumeSection());

    const region = screen.getByRole("region", { name: TITLE });
    const list = within(region).getByRole("list");
    const listitems = within(list).getAllByRole("listitem");
    expect(listitems).toHaveLength(ENTRIES.length);

    const itemHeadings = listitems.map((listitem) =>
      within(listitem).getByRole("heading", { level: 3 }),
    );
    expect(itemHeadings.map((heading) => heading.textContent)).toEqual(
      ENTRIES.map((entry) => entry.title),
    );

    expect(itemHeadings.map((heading) => heading.getAttribute("id"))).toEqual([
      "edu-cs-degree-title",
      "edu-lead-fe-title",
    ]);
  });

  it("keeps the heading hierarchy: one h2 then the item h3s inside the region (RF-5)", () => {
    render(resumeSection());

    const region = screen.getByRole("region", { name: TITLE });
    const levels = within(region)
      .getAllByRole("heading")
      .map((heading) => heading.tagName);
    expect(levels).toEqual(["H2", "H3", "H3"]);
  });

  // extra: locale and presentLabel are forwarded to the timeline.
  it("renders the received presentLabel in the item period inside the region (T1: RF-2)", () => {
    render(resumeSection());

    const region = screen.getByRole("region", { name: TITLE });
    const openArticle = within(region).getByRole("article", {
      name: ENTRY_LEAD.title,
    });
    expect(openArticle.textContent).toContain("2018 — Present");
  });
});

describe("ResumeSection empty entries (T1: RF-1)", () => {
  it("renders nothing when entries is empty", () => {
    const { container } = render(
      <ResumeSection
        id={SECTION_ID}
        timelineIdPrefix={ID_PREFIX}
        title={TITLE}
        icon={ICON}
        entries={[]}
        locale={LOCALE}
        presentLabel={PRESENT_LABEL}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});

describe("ResumeSection id derivation (T1: RF-3, spec → Tests esperados 5)", () => {
  it("derives distinct title ids per section and routes item ids through each explicit prefix", () => {
    render(
      <>
        <AccentGradientDefs />
        <ResumeSection
          id="education"
          timelineIdPrefix="edu"
          title="Education"
          icon="book-open"
          entries={[ENTRY_CS]}
          locale={LOCALE}
          presentLabel={PRESENT_LABEL}
        />
        <ResumeSection
          id="experience"
          timelineIdPrefix="exp"
          title="Experience"
          icon="briefcase"
          entries={[ENTRY_LEAD]}
          locale={LOCALE}
          presentLabel={PRESENT_LABEL}
        />
      </>,
    );

    const educationRegion = screen.getByRole("region", { name: "Education" });
    const experienceRegion = screen.getByRole("region", {
      name: "Experience",
    });
    expect(educationRegion).toHaveAttribute(
      "aria-labelledby",
      "resume-education-title",
    );
    expect(experienceRegion).toHaveAttribute(
      "aria-labelledby",
      "resume-experience-title",
    );

    const titleIds = screen
      .getAllByRole("heading", { level: 2 })
      .map((heading) => heading.getAttribute("id"));
    expect(titleIds).toEqual([
      "resume-education-title",
      "resume-experience-title",
    ]);
    expect(new Set(titleIds).size).toBe(2);

    expect(
      within(educationRegion)
        .getByRole("heading", { level: 3, name: ENTRY_CS.title })
        .getAttribute("id"),
    ).toBe("edu-cs-degree-title");
    expect(
      within(experienceRegion)
        .getByRole("heading", { level: 3, name: ENTRY_LEAD.title })
        .getAttribute("id"),
    ).toBe("exp-lead-fe-title");
  });
});

// extra: className joining is part of the API.
describe("ResumeSection className joining (T1: spec → API, G-B)", () => {
  it("joins an external className to the base class on the root section", () => {
    const consumerClass = "resume-panel";
    const baseClass = styles.resumeSection ?? "resumeSection";

    render(resumeSection({ className: consumerClass }));

    const region = screen.getByRole("region", { name: TITLE });
    expect(region).toHaveClass(baseClass);
    expect(region).toHaveClass(consumerClass);
  });
});

describe("ResumeSection accessibility audit (T2: spec → Tests esperados 6)", () => {
  it("has no accessibility violations with the full section (title and timeline)", async () => {
    const { container } = render(resumeSection());

    await expectNoA11yViolations(container);
  });
});
