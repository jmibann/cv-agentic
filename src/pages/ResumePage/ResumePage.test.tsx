import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AccentGradientDefs } from "../../components/Icon";
import { cvByLocale } from "../../content";
import { uiEn } from "../../i18n/ui.en";
import { uiEs } from "../../i18n/ui.es";
import { LocaleProvider } from "../../providers/LocaleProvider";

import { ResumePage } from "./ResumePage";

import { expectNoA11yViolations } from "../../test/a11y";

import styles from "./ResumePage.module.css";

const RESUME_TITLE = uiEn.resume.title;
const EDUCATION = cvByLocale.en.education;
const EXPERIENCE = cvByLocale.en.experience;

const PAGE_CLASS = styles.page ?? "page";
const COLUMNS_CLASS = styles.columns ?? "columns";

const renderResumePage = (className?: string) =>
  render(
    <LocaleProvider>
      <ResumePage className={className} />
      <AccentGradientDefs />
    </LocaleProvider>,
  );

describe("ResumePage unique h1 with t.resume.title (T1: RF-1, Tests 1)", () => {
  it("renders exactly one level-1 heading named with t.resume.title", () => {
    renderResumePage();

    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(
      screen.getByRole("heading", { level: 1, name: RESUME_TITLE }),
    ).toBeInTheDocument();
  });
});

describe("ResumePage education and experience regions (T1: RF-2 columns, RF-5, Tests 2)", () => {
  const SECTIONS = [
    {
      name: uiEn.resume.education,
      entries: EDUCATION,
      titleId: "resume-education-title",
    },
    {
      name: uiEn.resume.experience,
      entries: EXPERIENCE,
      titleId: "resume-experience-title",
    },
  ];

  it("renders a named region per timeline with one listitem per entry, in data order", () => {
    if (EDUCATION.length === 0 || EXPERIENCE.length === 0) {
      throw new Error(
        "el contenido de ejemplo del kit debe traer education y experience no vacías (test 2 de la spec no puede correr vacío)",
      );
    }

    renderResumePage();

    for (const section of SECTIONS) {
      const region = screen.getByRole("region", { name: section.name });
      expect(region.tagName).toBe("SECTION");
      expect(region).toHaveAttribute("aria-labelledby", section.titleId);

      const heading = screen.getByRole("heading", {
        level: 2,
        name: section.name,
      });
      expect(heading).toHaveAttribute("id", section.titleId);
      expect(region).toContainElement(heading);

      const list = within(region).getByRole("list");
      const items = within(region).getAllByRole("listitem");
      expect(items).toHaveLength(section.entries.length);
      for (const item of items) {
        expect(item.parentElement).toBe(list);
        expect(within(item).getByRole("article")).toBeInTheDocument();
      }

      const itemHeadings = within(region).getAllByRole("heading", {
        level: 3,
      });
      expect(itemHeadings.map((headingEl) => headingEl.textContent)).toEqual(
        section.entries.map((entry) => entry.title),
      );
    }

    const educationRegion = screen.getByRole("region", {
      name: uiEn.resume.education,
    });
    const experienceRegion = screen.getByRole("region", {
      name: uiEn.resume.experience,
    });
    const columns = educationRegion.parentElement;
    if (columns === null) {
      throw new Error("las <section> deben colgar del bloque .columns (Anatomía)");
    }
    expect(columns.tagName).toBe("DIV");
    expect(columns).toHaveClass(COLUMNS_CLASS);
    expect(experienceRegion.parentElement).toBe(columns);
    expect(columns.children).toHaveLength(3);
    expect(columns.firstElementChild).toBe(experienceRegion);
    expect(columns.lastElementChild).toBe(educationRegion);
    const projectsRegion = screen.getByRole("region", {
      name: uiEn.resume.projects,
    });
    expect(experienceRegion.nextElementSibling).toBe(projectsRegion);
    expect(projectsRegion.nextElementSibling).toBe(educationRegion);

    const pageRoot = columns.parentElement;
    if (pageRoot === null) {
      throw new Error(".columns debe ser hijo del raíz .page (Anatomía)");
    }
    expect(pageRoot.tagName).toBe("DIV");
    expect(pageRoot).toHaveClass(PAGE_CLASS);
    const h1 = screen.getByRole("heading", { level: 1, name: RESUME_TITLE });
    expect(h1.parentElement).toBe(pageRoot);
    expect(pageRoot.firstElementChild).toBe(h1);
  });
});

describe("ResumePage in Spanish locale (T1: Tests 7, real LocaleProvider seeded es)", () => {
  it("shows the ui.es interface strings and the cv.es content when the active locale is es", () => {
    if (cvByLocale.es.education.length === 0 || cvByLocale.es.experience.length === 0) {
      throw new Error(
        "el contenido de ejemplo del kit debe traer education y experience en cv.es para el test 7",
      );
    }
    const esEntries = [...cvByLocale.es.education, ...cvByLocale.es.experience];
    const enTitles = new Set(
      [...EDUCATION, ...EXPERIENCE].map((entry) => entry.title),
    );
    if (!esEntries.some((entry) => !enTitles.has(entry.title))) {
      throw new Error(
        "los títulos de education/experience de cv.es deben diferir de los de cv.en al menos en uno para que el test 7 discrimine el contenido",
      );
    }

    document.documentElement.lang = "es";
    renderResumePage();
    expect(document.documentElement).toHaveAttribute("lang", "es");

    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(
      screen.getByRole("heading", { level: 1, name: uiEs.resume.title }),
    ).toBeInTheDocument();

    const sectionsEs = [
      { name: uiEs.resume.education, entries: cvByLocale.es.education },
      { name: uiEs.resume.experience, entries: cvByLocale.es.experience },
    ];
    for (const section of sectionsEs) {
      const region = screen.getByRole("region", { name: section.name });

      expect(within(region).getAllByRole("listitem")).toHaveLength(
        section.entries.length,
      );

      expect(
        within(region)
          .getAllByRole("heading", { level: 3 })
          .map((headingEl) => headingEl.textContent),
      ).toEqual(section.entries.map((entry) => entry.title));
    }
  });
});

// The content module is mocked so each test can empty a collection.
interface ResumeCvHarness {
  scenario:
    | "real"
    | "presentNull"
    | "educationEmpty"
    | "columnsEmpty"
    | "projectsEmpty"
    | "skillsEmpty";
}

const cvHarness = vi.hoisted((): ResumeCvHarness => ({
  scenario: "real",
}));

vi.mock("../../providers/LocaleProvider", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../../providers/LocaleProvider")>();
  return {
    ...actual,
    useCv: () => {
      const cv = actual.useCv();
      if (cvHarness.scenario === "presentNull") {
        const base = cv.education[0];
        if (base === undefined) {
          throw new Error(
            "el cv del locale activo debe traer al menos una entrada de education para el escenario del test 4",
          );
        }
        return { ...cv, education: [{ ...base, end: null }], experience: [] };
      }
      if (cvHarness.scenario === "educationEmpty") {
        return { ...cv, education: [] };
      }
      if (cvHarness.scenario === "columnsEmpty") {
        return { ...cv, education: [], experience: [], projects: [] };
      }
      if (cvHarness.scenario === "projectsEmpty") {
        return { ...cv, projects: [] };
      }
      if (cvHarness.scenario === "skillsEmpty") {
        return { ...cv, skills: [] };
      }
      return cv;
    },
  };
});

beforeEach(() => {
  cvHarness.scenario = "real";
});

describe("ResumePage presentLabel forwarded to an open-ended entry (T2: RF-7, Tests 4, mocked provider)", () => {
  beforeEach(() => {
    cvHarness.scenario = "presentNull";
  });

  it("shows t.timeline.present for the mocked end:null entry, proving the label travels through the page", () => {
    if (EDUCATION.length < 2) {
      throw new Error(
        "el contenido de ejemplo del kit debe traer al menos DOS entradas de education para que el escenario mockeado (1 listitem) del test 4 discrimine",
      );
    }

    renderResumePage();

    const region = screen.getByRole("region", {
      name: uiEn.resume.education,
    });
    expect(
      within(region).getByText(uiEn.timeline.present, { exact: false }),
    ).toBeInTheDocument();

    expect(within(region).getAllByRole("listitem")).toHaveLength(1);
    expect(
      screen.queryByRole("region", { name: uiEn.resume.experience }),
    ).not.toBeInTheDocument();

    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
  });
});

describe("ResumePage with education empty (T2: RF-2, Tests 5, mocked provider)", () => {
  beforeEach(() => {
    cvHarness.scenario = "educationEmpty";
  });

  it("renders no education region while Experience stays present and the h1 remains the only one", () => {
    if (EDUCATION.length === 0 || EXPERIENCE.length === 0) {
      throw new Error(
        "el contenido de ejemplo del kit debe traer education y experience no vacías para que el escenario 5a discrimine",
      );
    }

    renderResumePage();

    expect(
      screen.queryByRole("region", { name: uiEn.resume.education }),
    ).not.toBeInTheDocument();
    const experienceRegion = screen.getByRole("region", {
      name: uiEn.resume.experience,
    });
    expect(experienceRegion).toBeInTheDocument();

    const columns = experienceRegion.parentElement;
    if (columns === null) {
      throw new Error(
        "la <section> de experience debe colgar del bloque .columns (Anatomía)",
      );
    }
    expect(columns.tagName).toBe("DIV");
    expect(columns.children).toHaveLength(2);

    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
  });
});

describe("ResumePage with education and experience both empty (T2: RF-2, Tests 5, mocked provider)", () => {
  beforeEach(() => {
    cvHarness.scenario = "columnsEmpty";
  });

  it("renders no timeline regions, no columns container, and keeps the unique h1", () => {
    // Invariant: both collections must be non-empty, or the empty scenario would
    // prove nothing.
    if (EDUCATION.length === 0 || EXPERIENCE.length === 0) {
      throw new Error(
        "el contenido de ejemplo del kit debe traer education y experience no vacías para que el escenario 5b discrimine",
      );
    }

    renderResumePage();

    expect(
      screen.queryByRole("region", { name: uiEn.resume.education }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("region", { name: uiEn.resume.experience }),
    ).not.toBeInTheDocument();

    const h1 = screen.getByRole("heading", { level: 1, name: RESUME_TITLE });
    const pageRoot = h1.parentElement;
    if (pageRoot === null) {
      throw new Error("el h1 debe ser hijo del raíz .page (Anatomía)");
    }
    expect(pageRoot.querySelectorAll(":scope > div")).toHaveLength(0);

    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
  });
});

const SKILLS_TITLE = uiEn.resume.skills;
const SKILLS = cvByLocale.en.skills;

describe("ResumePage skills region (T3: RF-4, Tests 3)", () => {
  it("renders a region named by t.resume.skills with one labelled list and one listitem per skill in data order", () => {
    if (SKILLS.length === 0) {
      throw new Error(
        "el contenido de ejemplo del kit debe traer skills en cv.skills (test 3 de la spec no puede correr vacío)",
      );
    }

    renderResumePage();

    const region = screen.getByRole("region", { name: SKILLS_TITLE });
    expect(region.tagName).toBe("SECTION");
    expect(region).toHaveAttribute("aria-labelledby", "resume-skills-title");

    const heading = screen.getByRole("heading", { level: 2, name: SKILLS_TITLE });
    expect(heading).toHaveAttribute("id", "resume-skills-title");
    expect(region).toContainElement(heading);

    const list = within(region).getByRole("list");
    expect(list).toHaveAttribute("aria-labelledby", "resume-skills-title");

    const items = within(list).getAllByRole("listitem");
    expect(items).toHaveLength(SKILLS.length);
    expect(items.map((item) => item.textContent)).toEqual(SKILLS);

    const pageRoot = region.parentElement;
    if (pageRoot === null) {
      throw new Error(
        "la <section> de skills debe ser hijo del raíz .page (Anatomía)",
      );
    }
    expect(pageRoot.tagName).toBe("DIV");
    const h1 = screen.getByRole("heading", { level: 1, name: RESUME_TITLE });
    expect(pageRoot.firstElementChild).toBe(h1);
    const columns = pageRoot.querySelector(":scope > div");
    if (columns === null) {
      throw new Error(".columns debe seguir montado con el contenido real (Anatomía)");
    }
    expect(region.previousElementSibling).toBe(columns);
  });
});

describe("ResumePage with empty skills (T3: RF-4, Tests 6, mocked provider)", () => {
  beforeEach(() => {
    cvHarness.scenario = "skillsEmpty";
  });

  it("renders no skills region nor its h2 when skills is empty", () => {
    if (SKILLS.length === 0) {
      throw new Error(
        "el contenido de ejemplo del kit debe traer skills para que el escenario vacío (test 6) discrimine",
      );
    }

    renderResumePage();

    expect(
      screen.queryByRole("region", { name: SKILLS_TITLE }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { level: 2, name: SKILLS_TITLE }),
    ).not.toBeInTheDocument();

    expect(
      screen.getByRole("region", { name: uiEn.resume.education }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: uiEn.resume.experience }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
  });
});

describe("ResumePage className joining (T4: spec → API, G-B, Tests 9)", () => {
  it("joins an external className to the base .page class on the page root, coexisting", () => {
    const consumerClass = "app-tabpanel-resume";

    const { container } = renderResumePage(consumerClass);

    const pageRoot = container.firstElementChild;
    if (pageRoot === null) {
      throw new Error("ResumePage debe renderizar el raíz .page (Anatomía)");
    }
    const h1 = screen.getByRole("heading", { level: 1, name: RESUME_TITLE });
    expect(h1.parentElement).toBe(pageRoot);
    expect(pageRoot).toHaveClass(PAGE_CLASS);
    expect(pageRoot).toHaveClass(consumerClass);
  });
});

const PROJECTS = cvByLocale.en.projects;

describe("ResumePage projects region (T6: RF-2, RF-3, Tests 10)", () => {
  it("renders a region named by t.resume.projects with one listitem per entry, in data order", () => {
    if (PROJECTS.length === 0) {
      throw new Error(
        "el contenido debe traer al menos una entrada en cv.projects (test 10 de la spec no puede correr vacío)",
      );
    }

    renderResumePage();

    const region = screen.getByRole("region", { name: uiEn.resume.projects });
    expect(region.tagName).toBe("SECTION");
    expect(region).toHaveAttribute("aria-labelledby", "resume-projects-title");

    const heading = screen.getByRole("heading", {
      level: 2,
      name: uiEn.resume.projects,
    });
    expect(heading).toHaveAttribute("id", "resume-projects-title");
    expect(region).toContainElement(heading);

    expect(within(region).getAllByRole("listitem")).toHaveLength(PROJECTS.length);
    expect(
      within(region)
        .getAllByRole("heading", { level: 3 })
        .map((headingEl) => headingEl.textContent),
    ).toEqual(PROJECTS.map((entry) => entry.title));
  });
});

describe("ResumePage with empty projects (T6: RF-2, Tests 11, mocked provider)", () => {
  beforeEach(() => {
    cvHarness.scenario = "projectsEmpty";
  });

  it("renders no projects region while Experience and Education stay present", () => {
    if (PROJECTS.length === 0) {
      throw new Error(
        "el contenido debe traer projects para que el escenario vacío (test 11) discrimine",
      );
    }

    renderResumePage();

    expect(
      screen.queryByRole("region", { name: uiEn.resume.projects }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { level: 2, name: uiEn.resume.projects }),
    ).not.toBeInTheDocument();

    const experienceRegion = screen.getByRole("region", {
      name: uiEn.resume.experience,
    });
    const educationRegion = screen.getByRole("region", {
      name: uiEn.resume.education,
    });
    expect(experienceRegion.nextElementSibling).toBe(educationRegion);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
  });
});

describe("ResumePage accessibility audit (T4: cierre, Tests 8)", () => {
  it("has no accessibility violations with the full content", async () => {
    const { container } = renderResumePage();

    await expectNoA11yViolations(container);
  });
});
