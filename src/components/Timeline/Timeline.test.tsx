import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { Locale, TimelineEntry } from "@data/cv.types.generated";

import { Timeline } from "./Timeline";
import type { TimelineProps } from "./Timeline";

import { expectNoA11yViolations } from "../../test/a11y";

import styles from "./Timeline.module.css";

const ENTRY_CS: TimelineEntry = {
  id: "cs-degree",
  title: "B.Sc. in Computer Science",
  organization: "Northlake State University",
  start: "2012",
  end: "2017",
  description: "Focus on software engineering.",
};

const ENTRY_WAS: TimelineEntry = {
  id: "was-cert",
  title: "Web Accessibility Specialist",
  organization: "Example Accessibility Guild",
  start: "2018",
  end: null,
  description: "Audits and remediation of public websites.",
};

const ENTRY_BARE: TimelineEntry = {
  id: "bootcamp",
  title: "Frontend Bootcamp",
  organization: "",
  start: "2011",
  end: "2011",
  description: "",
};

const ENTRIES: readonly TimelineEntry[] = [ENTRY_CS, ENTRY_WAS, ENTRY_BARE];

const ID_PREFIX = "edu";
const LOCALE: Locale = "en";
const PRESENT_LABEL = "Present";

const timelineClass = styles.timeline ?? "timeline";

const timeline = (
  overrides: Partial<Pick<TimelineProps, "entries" | "className">> = {},
) => (
  <Timeline
    entries={ENTRIES}
    locale={LOCALE}
    presentLabel={PRESENT_LABEL}
    idPrefix={ID_PREFIX}
    {...overrides}
  />
);

describe("Timeline list structure (T1: RF-1)", () => {
  it("renders an ol with an explicit role=list and one listitem per entry", () => {
    render(timeline());

    const list = screen.getByRole("list");
    expect(list.tagName).toBe("OL");
    expect(list).toHaveAttribute("role", "list");
    expect(within(list).getAllByRole("listitem")).toHaveLength(ENTRIES.length);
  });
});

describe("Timeline item order (T1: RF-1)", () => {
  it("renders the items in data order with an h3 title per item", () => {
    render(timeline());

    const listitems = screen.getAllByRole("listitem");
    const titles = listitems.map((listitem) =>
      within(listitem).getByRole("heading", { level: 3 }).textContent,
    );
    expect(titles).toEqual(ENTRIES.map((entry) => entry.title));
  });
});

describe("Timeline article labelling (T1: RF-2, RF-5)", () => {
  it("wraps each item in an article labelled by its h3 carrying the fixed id formula", () => {
    render(timeline());

    screen.getAllByRole("listitem").forEach((listitem, index) => {
      const entry = ENTRIES[index];
      if (entry === undefined) {
        throw new Error(
          "listitem sin entrada correspondiente en el fixture (invariante)",
        );
      }

      const article = within(listitem).getByRole("article");
      const expectedId = `${ID_PREFIX}-${entry.id}-title`;
      expect(article).toHaveAttribute("aria-labelledby", expectedId);

      const heading = within(article).getByRole("heading", {
        level: 3,
        name: entry.title,
      });
      expect(heading.getAttribute("id")).toBe(
        article.getAttribute("aria-labelledby"),
      );
      expect(heading.getAttribute("id")).toBe(expectedId);
    });
  });
});

describe("Timeline entry fields (T1: RF-2)", () => {
  it("shows organization and description when the entry has them", () => {
    render(timeline());

    const firstArticle = screen.getByRole("article", {
      name: ENTRY_CS.title,
    });
    expect(
      within(firstArticle).getByText(ENTRY_CS.organization),
    ).toBeInTheDocument();
    expect(
      within(firstArticle).getByText(ENTRY_CS.description),
    ).toBeInTheDocument();

    const secondArticle = screen.getByRole("article", {
      name: ENTRY_WAS.title,
    });
    expect(
      within(secondArticle).getByText(ENTRY_WAS.organization),
    ).toBeInTheDocument();
    expect(
      within(secondArticle).getByText(ENTRY_WAS.description),
    ).toBeInTheDocument();
  });

  it("does not render empty paragraphs for an entry without organization or description", () => {
    render(timeline());

    const bareArticle = screen.getByRole("article", {
      name: ENTRY_BARE.title,
    });
    expect(bareArticle.querySelector("p:empty")).toBeNull();
    expect(
      within(bareArticle).getByRole("heading", {
        level: 3,
        name: ENTRY_BARE.title,
      }),
    ).toBeInTheDocument();
  });
});

describe("Timeline empty entries (T1: RF-1)", () => {
  it("renders nothing when entries is empty", () => {
    const { container } = render(timeline({ entries: [] }));
    expect(container).toBeEmptyDOMElement();
  });
});

describe("Timeline id prefixes (T1: RF-5, spec → Tests esperados 7)", () => {
  it("generates prefixed ids so two Timelines on the same page do not collide", () => {
    render(
      <>
        <Timeline
          entries={[ENTRY_CS]}
          locale={LOCALE}
          presentLabel={PRESENT_LABEL}
          idPrefix="edu"
        />
        <Timeline
          entries={[ENTRY_CS]}
          locale={LOCALE}
          presentLabel={PRESENT_LABEL}
          idPrefix="exp"
        />
      </>,
    );

    expect(screen.getAllByRole("list")).toHaveLength(2);
    const headings = screen.getAllByRole("heading", { level: 3 });
    expect(headings).toHaveLength(2);
    const ids = headings.map((heading) => heading.getAttribute("id"));
    expect(ids).toEqual(["edu-cs-degree-title", "exp-cs-degree-title"]);
    expect(new Set(ids).size).toBe(2);
  });
});

// extra: className joining is part of the API.
describe("Timeline className joining (T1: spec → API, G-B)", () => {
  it("joins an external className to the base class on the root ol", () => {
    const consumerClass = "resume-education";

    render(timeline({ className: consumerClass }));

    const list = screen.getByRole("list");
    expect(list).toHaveClass(timelineClass);
    expect(list).toHaveClass(consumerClass);
  });
});

const T2_RANGE: TimelineEntry = {
  id: "ms-ai",
  title: "M.Sc. in Applied Intelligence",
  organization: "Riverton Technical Institute",
  start: "2019-03",
  end: "2021-11",
  description: "Machine learning track.",
};

const T2_OPEN: TimelineEntry = {
  id: "lead-fe",
  title: "Lead Frontend Developer",
  organization: "Example Digital Studio",
  start: "2015",
  end: null,
  description: "Design systems and accessibility work.",
};

const T2_YEARS: TimelineEntry = {
  id: "doc-course",
  title: "Doctoral Coursework",
  organization: "Lakeside Graduate School",
  start: "2012",
  end: "2014",
  description: "Evening programme.",
};

const timelineT2 = ({
  entry,
  locale = "en",
  presentLabel = "Present",
}: {
  entry: TimelineEntry;
  locale?: Locale;
  presentLabel?: string;
}) => (
  <Timeline
    entries={[entry]}
    locale={locale}
    presentLabel={presentLabel}
    idPrefix="edu"
  />
);

const periodTimes = (article: HTMLElement): HTMLTimeElement[] =>
  Array.from(article.querySelectorAll("time"));

const requireTime = (time: HTMLTimeElement | undefined): HTMLTimeElement => {
  if (time === undefined) {
    throw new Error(
      "el período debe envolver cada fecha en <time dateTime> (RF-4)",
    );
  }
  return time;
};

describe("Timeline period with time per endpoint (T2: RF-3, RF-4)", () => {
  it("renders two time elements with raw datetime, en-formatted text and the fixed separator", () => {
    render(timelineT2({ entry: T2_RANGE }));

    const article = screen.getByRole("article", { name: T2_RANGE.title });
    const times = periodTimes(article);
    if (times.length !== 2) {
      throw new Error(
        `un rango debe renderizar exactamente dos <time> (RF-4, Tests esperados 6); se encontraron ${times.length}`,
      );
    }
    const start = requireTime(times[0]);
    const end = requireTime(times[1]);

    expect(start).toHaveAttribute("datetime", "2019-03");
    expect(end).toHaveAttribute("datetime", "2021-11");
    expect(start.textContent).toBe("Mar 2019");
    expect(end.textContent).toBe("Nov 2021");

    const period = start.parentElement;
    if (period === null) {
      throw new Error("cada <time> debe vivir en el <p class=period> (Anatomía)");
    }
    expect(period.tagName).toBe("P");
    expect(period.textContent).toBe("Mar 2019 — Nov 2021");
  });

  it("formats both endpoints for the es locale (spec → Tests esperados 5)", () => {
    render(
      timelineT2({ entry: T2_RANGE, locale: "es", presentLabel: "Actualidad" }),
    );

    const article = screen.getByRole("article", { name: T2_RANGE.title });
    const times = periodTimes(article);
    if (times.length !== 2) {
      throw new Error(
        `un rango debe renderizar exactamente dos <time> (RF-4, Tests esperados 6); se encontraron ${times.length}`,
      );
    }
    const start = requireTime(times[0]);
    const end = requireTime(times[1]);

    expect(start).toHaveAttribute("datetime", "2019-03");
    expect(start.textContent).toBe("mar 2019");
    expect(end.textContent).toBe("nov 2021");
    expect(start.parentElement?.textContent).toBe("mar 2019 — nov 2021");
  });

  it("renders a single time and the present label as plain text when end is null (RF-3, spec → Tests esperados 4 y 6)", () => {
    render(
      timelineT2({ entry: T2_OPEN, locale: "es", presentLabel: "Actualidad" }),
    );

    const article = screen.getByRole("article", { name: T2_OPEN.title });
    const times = periodTimes(article);
    expect(times).toHaveLength(1);
    const start = requireTime(times[0]);

    expect(start).toHaveAttribute("datetime", "2015");
    expect(start.textContent).toBe("2015");
    expect(start.parentElement?.textContent).toBe("2015 — Actualidad");
  });

  it("keeps bare YYYY values unchanged in datetime and text (RF-4)", () => {
    render(timelineT2({ entry: T2_YEARS }));

    const article = screen.getByRole("article", { name: T2_YEARS.title });
    const times = periodTimes(article);
    if (times.length !== 2) {
      throw new Error(
        `un rango debe renderizar exactamente dos <time> (RF-4, Tests esperados 6); se encontraron ${times.length}`,
      );
    }
    const start = requireTime(times[0]);
    const end = requireTime(times[1]);

    expect(start).toHaveAttribute("datetime", "2012");
    expect(start.textContent).toBe("2012");
    expect(end).toHaveAttribute("datetime", "2014");
    expect(end.textContent).toBe("2014");
    expect(start.parentElement?.textContent).toBe("2012 — 2014");
  });
});

describe("Timeline accessibility audit (T3: spec → Tests esperados 9)", () => {
  it("has no accessibility violations with the full timeline (range and open end)", async () => {
    const { container } = render(
      <Timeline
        entries={[T2_RANGE, T2_OPEN]}
        locale={LOCALE}
        presentLabel={PRESENT_LABEL}
        idPrefix="edu"
      />,
    );

    await expectNoA11yViolations(container);
  });
});
