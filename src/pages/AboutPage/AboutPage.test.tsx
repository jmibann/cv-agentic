import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { HexAvatarDefs } from "../../components/HexAvatar";
import { AccentGradientDefs } from "../../components/Icon";
import { cvByLocale } from "../../content";
import { uiEn } from "../../i18n/ui.en";
import { uiEs } from "../../i18n/ui.es";
import { LocaleProvider } from "../../providers/LocaleProvider";

import exampleEn from "@data/cv.example.en.json";
import exampleEs from "@data/cv.example.es.json";
import type { Testimonial } from "@data/cv.types.generated";

import { AboutPage } from "./AboutPage";

import { expectNoA11yViolations } from "../../test/a11y";

import styles from "./AboutPage.module.css";

const ABOUT_TITLE = uiEn.about.title;
const ABOUT_PARAGRAPHS = cvByLocale.en.profile.about;

const PAGE_CLASS = styles.page ?? "page";
const INTRO_CLASS = styles.intro ?? "intro";
const SERVICES_CLASS = styles.services ?? "services";

const renderAboutPage = (className?: string) =>
  render(
    <LocaleProvider>
      <AboutPage className={className} />
      <AccentGradientDefs />
      <HexAvatarDefs />
    </LocaleProvider>,
  );

describe("AboutPage unique h1 with t.about.title (T1: RF-1, Tests 1)", () => {
  it("renders exactly one level-1 heading named with t.about.title", () => {
    renderAboutPage();

    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(
      screen.getByRole("heading", { level: 1, name: ABOUT_TITLE }),
    ).toBeInTheDocument();
  });
});

describe("AboutPage intro paragraphs (T1: RF-2 intro, Tests 2)", () => {
  it("renders one paragraph per profile.about entry, all inside a single intro block under the page root", () => {
    const { container } = renderAboutPage();

    if (ABOUT_PARAGRAPHS.length === 0) {
      throw new Error(
        "el contenido de ejemplo del kit debe traer párrafos en profile.about (test 2 de la spec no puede correr vacío)",
      );
    }

    const pageRoot = container.firstElementChild;
    if (pageRoot === null) {
      throw new Error("AboutPage debe renderizar el raíz div.page (Anatomía)");
    }
    expect(pageRoot.tagName).toBe("DIV");
    expect(pageRoot).toHaveClass(PAGE_CLASS);
    const introBlocks = pageRoot.querySelectorAll(":scope > div");
    expect(introBlocks).toHaveLength(1);
    const intro = introBlocks[0];
    if (intro === undefined) {
      throw new Error("el raíz .page debe tener el bloque .intro como único div hijo directo (Anatomía)");
    }
    expect(intro).toHaveClass(INTRO_CLASS);

    const paragraphs = Array.from(intro.querySelectorAll("p"));
    expect(paragraphs).toHaveLength(ABOUT_PARAGRAPHS.length);
    expect(paragraphs.map((paragraph) => paragraph.textContent)).toEqual(
      ABOUT_PARAGRAPHS,
    );

    for (const paragraph of paragraphs) {
      expect(paragraph.parentElement).toBe(intro);
    }

    const heading = screen.getByRole("heading", { level: 1, name: ABOUT_TITLE });
    expect(heading.parentElement).toBe(pageRoot);
    expect(pageRoot.firstElementChild).toBe(heading);
  });
});

// The content module is mocked so each test can empty a collection.
interface CvHarness {
  emptyServices: boolean;
  emptyTestimonials: boolean;
  testimonialsFixture: Testimonial[] | null;
}

const cvHarness = vi.hoisted((): CvHarness => ({
  emptyServices: false,
  emptyTestimonials: false,
  testimonialsFixture: null,
}));

vi.mock("../../providers/LocaleProvider", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../../providers/LocaleProvider")>();
  return {
    ...actual,
    useCv: () => {
      const cv = actual.useCv();
      if (cvHarness.emptyServices) {
        return { ...cv, services: [] };
      }
      if (cvHarness.emptyTestimonials) {
        return { ...cv, testimonials: [] };
      }
      if (cvHarness.testimonialsFixture !== null) {
        return { ...cv, testimonials: cvHarness.testimonialsFixture };
      }
      return cv;
    },
  };
});

beforeEach(() => {
  cvHarness.emptyServices = false;
  cvHarness.emptyTestimonials = false;
  cvHarness.testimonialsFixture = null;
});

const SERVICES_TITLE = uiEn.about.services;
const SERVICES = cvByLocale.en.services;

describe("AboutPage services region (T2: RF-2 services, RF-5, Tests 3)", () => {
  it("renders a region named by t.about.services with one li-wrapped article per service inside a ul", () => {
    if (SERVICES.length === 0) {
      throw new Error(
        "el contenido de ejemplo del kit debe traer servicios en cv.services (test 3 de la spec no puede correr vacío)",
      );
    }

    renderAboutPage();

    const region = screen.getByRole("region", { name: SERVICES_TITLE });
    expect(region).toHaveAttribute("aria-labelledby", "about-services-title");
    expect(region.tagName).toBe("SECTION");

    const heading = screen.getByRole("heading", {
      level: 2,
      name: SERVICES_TITLE,
    });
    expect(heading).toHaveAttribute("id", "about-services-title");
    expect(region).toContainElement(heading);

    const list = within(region).getByRole("list");
    expect(list).toHaveClass(SERVICES_CLASS);
    const items = within(region).getAllByRole("listitem");
    expect(items).toHaveLength(SERVICES.length);
    for (const item of items) {
      expect(item.parentElement).toBe(list);
    }

    for (const service of SERVICES) {
      const article = within(region).getByRole("article", {
        name: service.title,
      });
      const parent = article.parentElement;
      if (parent === null) {
        throw new Error(
          `la ServiceCard de "${service.title}" debe vivir dentro de un <li> (Anatomía)`,
        );
      }
      expect(parent.tagName).toBe("LI");
      expect(within(parent).getAllByRole("article")).toHaveLength(1);
    }

    const pageRoot = region.parentElement;
    if (pageRoot === null) {
      throw new Error(
        "la <section> de servicios debe ser hijo del raíz .page (Anatomía)",
      );
    }
    expect(pageRoot.tagName).toBe("DIV");
    const h1 = screen.getByRole("heading", { level: 1, name: ABOUT_TITLE });
    expect(pageRoot.firstElementChild).toBe(h1);
  });
});

describe("AboutPage with empty services (T2: RF-2, Tests 5a, mocked provider)", () => {
  beforeEach(() => {
    cvHarness.emptyServices = true;
  });

  it("renders no services region nor its h2 and keeps the unique h1 when services is empty", () => {
    if (SERVICES.length === 0) {
      throw new Error(
        "el contenido de ejemplo del kit debe traer servicios para que el escenario vacío (test 5a) discrimine",
      );
    }

    renderAboutPage();

    expect(
      screen.queryByRole("region", { name: SERVICES_TITLE }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { level: 2, name: SERVICES_TITLE }),
    ).not.toBeInTheDocument();
    expect(screen.queryAllByRole("list")).toHaveLength(0);

    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(
      screen.getByRole("heading", { level: 1, name: ABOUT_TITLE }),
    ).toBeInTheDocument();
  });
});

const TESTIMONIALS_TITLE = uiEn.about.testimonials;
const TESTIMONIALS_FIXTURE_EN: Testimonial[] = exampleEn.testimonials;
const TESTIMONIALS_FIXTURE_ES: Testimonial[] = exampleEs.testimonials;

describe("AboutPage testimonials region is the carousel own section (T3: RF-2 testimonials, RF-3, Tests 4)", () => {
  it("renders the carousel section named by t.about.testimonials as direct sibling of its h2, fed with the raw t.testimonials templates", () => {
    const testimonials = TESTIMONIALS_FIXTURE_EN;
    cvHarness.testimonialsFixture = testimonials;

    renderAboutPage();

    const region = screen.getByRole("region", { name: TESTIMONIALS_TITLE });
    expect(region.tagName).toBe("SECTION");
    expect(region).toHaveAttribute("aria-roledescription", "carousel");

    expect(region).toHaveAttribute("aria-labelledby", "about-testimonials-title");
    expect(region).not.toHaveAttribute("aria-label");

    const heading = screen.getByRole("heading", {
      level: 2,
      name: TESTIMONIALS_TITLE,
    });
    expect(heading).toHaveAttribute("id", "about-testimonials-title");

    const pageRoot = region.parentElement;
    if (pageRoot === null) {
      throw new Error(
        "la <section> del carrusel debe ser hijo del raíz .page (decisión 20: sin wrapper)",
      );
    }
    expect(pageRoot.tagName).toBe("DIV");
    expect(heading.parentElement).toBe(pageRoot);
    expect(region.previousElementSibling).toBe(heading);
    const h1 = screen.getByRole("heading", { level: 1, name: ABOUT_TITLE });
    expect(pageRoot.firstElementChild).toBe(h1);

    for (let index = 0; index < testimonials.length; index += 1) {
      const slideName = uiEn.testimonials.slideLabel
        .replace("{current}", String(index + 1))
        .replace("{total}", String(testimonials.length));
      expect(within(region).getByRole("group", { name: slideName })).toBeInTheDocument();
    }

    for (const testimonial of testimonials) {
      const openName = uiEn.testimonials.readMore.replace(
        "{author}",
        testimonial.author,
      );
      expect(
        within(region).getByRole("button", { name: openName }),
      ).toBeInTheDocument();
    }
  });
});

describe("AboutPage with empty testimonials (T3: RF-2, Tests 5b, mocked provider)", () => {
  beforeEach(() => {
    cvHarness.emptyTestimonials = true;
  });

  it("renders no testimonials h2 nor carousel region and keeps the unique h1 when testimonials is empty", () => {
    renderAboutPage();

    expect(
      screen.queryByRole("heading", { level: 2, name: TESTIMONIALS_TITLE }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("region", { name: TESTIMONIALS_TITLE }),
    ).not.toBeInTheDocument();
    expect(screen.queryAllByRole("group")).toHaveLength(0);
    for (const testimonial of TESTIMONIALS_FIXTURE_EN) {
      expect(
        screen.queryByRole("article", { name: testimonial.author }),
      ).not.toBeInTheDocument();
    }

    expect(screen.getByRole("region", { name: SERVICES_TITLE })).toBeInTheDocument();

    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
  });
});

describe("AboutPage in Spanish locale (T3: Tests 6, real LocaleProvider seeded es)", () => {
  it("shows the ui.es interface strings and the cv.es content when the active locale is es", () => {
    if (
      cvByLocale.es.services.length === 0 ||
      cvByLocale.es.profile.about.length === 0
    ) {
      throw new Error(
        "el contenido del kit debe traer about y services en cv.es para el test 6",
      );
    }

    const esTestimonials = TESTIMONIALS_FIXTURE_ES;
    cvHarness.testimonialsFixture = esTestimonials;

    document.documentElement.lang = "es";
    renderAboutPage();
    expect(document.documentElement).toHaveAttribute("lang", "es");

    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(
      screen.getByRole("heading", { level: 1, name: uiEs.about.title }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: uiEs.about.services }),
    ).toBeInTheDocument();
    const regionEs = screen.getByRole("region", {
      name: uiEs.about.testimonials,
    });
    expect(regionEs).toHaveAttribute("aria-roledescription", "carousel");

    for (const paragraph of cvByLocale.es.profile.about) {
      expect(screen.getByText(paragraph)).toBeInTheDocument();
    }
    for (const service of cvByLocale.es.services) {
      expect(
        screen.getByRole("article", { name: service.title }),
      ).toBeInTheDocument();
    }

    for (let index = 0; index < esTestimonials.length; index += 1) {
      const slideName = uiEs.testimonials.slideLabel
        .replace("{current}", String(index + 1))
        .replace("{total}", String(esTestimonials.length));
      expect(
        within(regionEs).getByRole("group", { name: slideName }),
      ).toBeInTheDocument();
    }
    for (const testimonial of esTestimonials) {
      const openName = uiEs.testimonials.readMore.replace(
        "{author}",
        testimonial.author,
      );
      expect(
        within(regionEs).getByRole("button", { name: openName }),
      ).toBeInTheDocument();
    }
  });
});

describe("AboutPage className joining (T4: spec → API, G-B, Tests 8)", () => {
  it("joins an external className to the base .page class on the page root, coexisting", () => {
    const consumerClass = "app-tabpanel-about";

    renderAboutPage(consumerClass);

    const h1 = screen.getByRole("heading", { level: 1, name: ABOUT_TITLE });
    const pageRoot = h1.parentElement;
    if (pageRoot === null) {
      throw new Error("el h1 debe ser hijo del raíz .page (Anatomía)");
    }
    expect(pageRoot).toHaveClass(PAGE_CLASS);
    expect(pageRoot).toHaveClass(consumerClass);
  });
});

describe("AboutPage accessibility audit (T4: cierre, Tests 7)", () => {
  it("has no accessibility violations with the full content in English", async () => {
    const { container } = renderAboutPage();

    await expectNoA11yViolations(container);
  });

  it("has no accessibility violations with the full content in Spanish", async () => {
    document.documentElement.lang = "es";

    const { container } = renderAboutPage();

    await expectNoA11yViolations(container);
  });
});
