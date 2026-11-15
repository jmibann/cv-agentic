import { render, screen, within } from "@testing-library/react";
import { fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { afterEach, vi } from "vitest";

import type { Testimonial } from "@data/cv.types.generated";

import { expectNoA11yViolations } from "../../test/a11y";

import { HexAvatarDefs } from "../HexAvatar";
import { AccentGradientDefs } from "../Icon";

import { TestimonialCarousel } from "./TestimonialCarousel";
import type {
  TestimonialCarouselLabels,
  TestimonialCarouselProps,
} from "./TestimonialCarousel";

import styles from "./TestimonialCarousel.module.css";

const TESTIMONIAL_A: Testimonial = {
  id: "t-a",
  author: "Ada Lovelace",
  role: "Engineering Lead, Analytical Engines",
  avatar: { src: "/images/testimonials/ada.svg" },
  text: "Ada delivered exceptional results across every milestone of the program.",
};
const TESTIMONIAL_B: Testimonial = {
  id: "t-b",
  author: "Grace Hopper",
  role: "Product Director, Compiler Labs",
  avatar: { src: "/images/testimonials/grace.svg" },
  text: "Grace turned a chaotic roadmap into a predictable shipping machine.",
};
const TESTIMONIAL_C: Testimonial = {
  id: "t-c",
  author: "Alan Turing",
  role: "Chief Scientist, Enigma Works",
  avatar: { src: "/images/testimonials/alan.svg" },
  text: "Alan reasoned about the hardest problems better than anyone I worked with.",
};

const TESTIMONIALS: readonly Testimonial[] = [
  TESTIMONIAL_A,
  TESTIMONIAL_B,
  TESTIMONIAL_C,
];

const LABELS: TestimonialCarouselLabels = {
  carousel: "Testimonials",
  slide: "{current} of {total}",
  goToSlide: "Go to slide {n}",
  readMore: "Read full testimonial from {author}",
  close: "Close",
};

const carousel = (overrides: Partial<TestimonialCarouselProps> = {}) => (
  <>
    <HexAvatarDefs />
    <AccentGradientDefs />
    <TestimonialCarousel testimonials={TESTIMONIALS} labels={LABELS} {...overrides} />
  </>
);

describe("TestimonialCarousel single named carousel region (T2: RF-1, Tests 5)", () => {
  it("renders exactly one carousel section as the named region without nesting another section", () => {
    const { container } = render(carousel());

    const region = screen.getByRole("region", { name: LABELS.carousel });
    expect(region.tagName).toBe("SECTION");
    expect(region).toHaveAttribute("aria-roledescription", "carousel");
    expect(region).toHaveAttribute("aria-label", LABELS.carousel);
    expect(region).not.toHaveAttribute("aria-labelledby");

    expect(container.querySelectorAll("section")).toHaveLength(1);
    expect(container.querySelectorAll("section")[0]).toBe(region);
    expect(region.querySelector("section")).toBeNull();

    expect(screen.queryByRole("dialog")).toBeNull();
    expect(container.querySelector("dialog")).toBeNull();
  });
});

describe("TestimonialCarousel slide groups one-based n of total (T2: RF-1, Tests 6)", () => {
  it("renders one slide group per testimonial named one of three through three of three in order", () => {
    render(carousel());

    const groupA = screen.getByRole("group", { name: "1 of 3" });
    const groupB = screen.getByRole("group", { name: "2 of 3" });
    const groupC = screen.getByRole("group", { name: "3 of 3" });
    expect(screen.getAllByRole("group")).toHaveLength(3);

    for (const group of [groupA, groupB, groupC]) {
      expect(group).toHaveAttribute("aria-roledescription", "slide");
    }

    expect(groupA.tagName).toBe("DIV");
    expect(groupB.tagName).toBe("DIV");
    expect(groupC.tagName).toBe("DIV");
    const track = groupA.parentElement;
    expect(track?.tagName).toBe("DIV");
    expect(track?.children).toHaveLength(3);
    expect(track?.parentElement).toBe(
      screen.getByRole("region", { name: LABELS.carousel }),
    );

    expect(
      within(groupA).getByRole("heading", {
        level: 3,
        name: TESTIMONIAL_A.author,
      }),
    ).toBeInTheDocument();
    expect(
      within(groupB).getByRole("article", { name: TESTIMONIAL_B.author }),
    ).toBeInTheDocument();
    expect(
      within(groupC).getByRole("article", { name: TESTIMONIAL_C.author }),
    ).toBeInTheDocument();
  });
});

describe("TestimonialCarousel region named by labelledBy (T2: RF-1, Tests 5)", () => {
  it("takes the accessible name from the referenced heading when labelledBy is given", () => {
    const HEADING_ID = "about-testimonials-title";
    const HEADING_TEXT = "What clients say";
    render(
      <>
        <h2 id={HEADING_ID}>{HEADING_TEXT}</h2>
        <TestimonialCarousel
          testimonials={TESTIMONIALS}
          labels={LABELS}
          labelledBy={HEADING_ID}
        />
      </>,
    );

    const region = screen.getByRole("region", { name: HEADING_TEXT });
    expect(region).toHaveAttribute("aria-labelledby", HEADING_ID);
    expect(region).not.toHaveAttribute("aria-label");
    expect(region).toHaveAttribute("aria-roledescription", "carousel");
  });
});

describe("TestimonialCarousel empty testimonials (T2: RF-1, Tests 11)", () => {
  it("renders nothing when testimonials is empty", () => {
    const { container } = render(
      <TestimonialCarousel testimonials={[]} labels={LABELS} />,
    );

    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByRole("region")).toBeNull();
  });
});

describe("TestimonialCarousel wires the single dialog through card open and close (T2: RF-6, Tests 10)", () => {
  it("opens the dialog with that author from the card button and removes it on close", async () => {
    const user = userEvent.setup();
    const { container } = render(carousel());

    await user.click(
      screen.getByRole("button", {
        name: "Read full testimonial from Grace Hopper",
      }),
    );

    const dialog = screen.getByRole("dialog", { name: TESTIMONIAL_B.author });
    expect(dialog).toHaveAttribute("open");
    expect(within(dialog).getByText(TESTIMONIAL_B.text)).toBeInTheDocument();

    await user.click(within(dialog).getByRole("button", { name: "Close" }));

    expect(screen.queryByRole("dialog")).toBeNull();
    expect(container.querySelector("dialog")).toBeNull();
  });
});

// jsdom does no layout, so offsets and sizes are mocked to give the carousel
// something to measure.
const mockCarouselLayout = (
  slideOffsets: readonly number[],
  scrollWidth: number,
  clientWidth: number,
): void => {
  vi.spyOn(HTMLElement.prototype, "offsetLeft", "get").mockImplementation(
    function (this: HTMLElement): number {
      const parent = this.parentElement;
      if (parent === null) {
        return 0;
      }
      const index = Array.from(parent.children).indexOf(this);
      return slideOffsets[index] ?? 0;
    },
  );
  vi.spyOn(Element.prototype, "scrollWidth", "get").mockReturnValue(
    scrollWidth,
  );
  vi.spyOn(Element.prototype, "clientWidth", "get").mockReturnValue(clientWidth);
};

const stubSyncRaf = (): void => {
  vi.stubGlobal(
    "requestAnimationFrame",
    (callback: FrameRequestCallback): number => {
      callback(0);
      return 1;
    },
  );
};

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("TestimonialCarousel renders one bullet per reachable stop with the first aria-current (T3: RF-3, Tests 7)", () => {
  it("renders two bullets named go to slide 1 and 2 with the first carrying aria-current true", () => {
    mockCarouselLayout([0, 300, 600], 900, 600);
    render(carousel());

    const bullet1 = screen.getByRole("button", { name: "Go to slide 1" });
    const bullet2 = screen.getByRole("button", { name: "Go to slide 2" });
    expect(
      screen.getAllByRole("button", { name: /Go to slide/ }),
    ).toHaveLength(2);

    expect(bullet1).toHaveAttribute("aria-current", "true");
    expect(bullet2).not.toHaveAttribute("aria-current");

    const pagination = bullet1.parentElement;
    expect(pagination?.tagName).toBe("DIV");
    expect(pagination?.children).toHaveLength(2);
    expect(pagination?.children.item(1)).toBe(bullet2);
    const region = screen.getByRole("region", { name: LABELS.carousel });
    expect(pagination?.parentElement).toBe(region);
    expect(pagination?.previousElementSibling?.tagName).toBe("DIV");

    expect(screen.getAllByRole("group")).toHaveLength(3);
  });
});

describe("TestimonialCarousel moves aria-current to the bullet of the active stop on scroll (T3: RF-5, Tests 9)", () => {
  it("moves aria-current from bullet 1 to bullet 2 when the track scrolls to the second stop", () => {
    stubSyncRaf();
    mockCarouselLayout([0, 300, 600], 900, 600);
    render(carousel());

    const track = screen
      .getByRole("group", { name: "1 of 3" })
      .parentElement;
    if (track === null) {
      throw new Error("T3: el slide no tiene track padre en el DOM");
    }

    Object.defineProperty(track, "scrollLeft", {
      value: 300,
      configurable: true,
    });
    fireEvent.scroll(track);

    const bullet1 = screen.getByRole("button", { name: "Go to slide 1" });
    const bullet2 = screen.getByRole("button", { name: "Go to slide 2" });
    expect(bullet2).toHaveAttribute("aria-current", "true");
    expect(bullet1).not.toHaveAttribute("aria-current");
  });
});

describe("TestimonialCarousel renders no bullets when there is one stop or fewer (T3: RF-3, Tests 11)", () => {
  it("renders no bullets for a single testimonial but keeps the region and its card", () => {
    mockCarouselLayout([0], 600, 600);
    render(carousel({ testimonials: [TESTIMONIAL_A] }));

    expect(
      screen.queryAllByRole("button", { name: /Go to slide/ }),
    ).toHaveLength(0);
    expect(screen.getByRole("group", { name: "1 of 1" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: "Read full testimonial from Ada Lovelace",
      }),
    ).toBeInTheDocument();
  });

  it("renders no bullets for two testimonials displayed two per view", () => {
    mockCarouselLayout([0, 300], 600, 600);
    render(carousel({ testimonials: [TESTIMONIAL_A, TESTIMONIAL_B] }));

    expect(
      screen.queryAllByRole("button", { name: /Go to slide/ }),
    ).toHaveLength(0);
    expect(screen.getAllByRole("group")).toHaveLength(2);
  });
});

describe("TestimonialCarousel bullet click scrolls the track to its stop with behavior read at click time (T4: RF-4, Tests 8)", () => {
  const renderWithTrackScrollSpy = () => {
    mockCarouselLayout([0, 300, 600], 900, 600);
    render(carousel());

    const track = screen
      .getByRole("group", { name: "1 of 3" })
      .parentElement;
    if (track === null) {
      throw new Error("T4: el slide no tiene track padre en el DOM");
    }
    const scrollTo = vi.fn();
    Object.defineProperty(track, "scrollTo", {
      value: scrollTo,
      configurable: true,
    });
    return { scrollTo };
  };

  it("calls scrollTo once with the second stop left and behavior auto when matchMedia defaults to matches false", async () => {
    const user = userEvent.setup();
    const { scrollTo } = renderWithTrackScrollSpy();

    await user.click(screen.getByRole("button", { name: "Go to slide 2" }));

    expect(scrollTo).toHaveBeenCalledTimes(1);
    expect(scrollTo).toHaveBeenCalledWith({ left: 300, behavior: "auto" });
  });

  it("calls scrollTo with behavior smooth when matchMedia reports no-preference matching", async () => {
    vi.stubGlobal("matchMedia", () => ({ matches: true }));
    const user = userEvent.setup();
    const { scrollTo } = renderWithTrackScrollSpy();

    await user.click(screen.getByRole("button", { name: "Go to slide 2" }));

    expect(scrollTo).toHaveBeenCalledTimes(1);
    expect(scrollTo).toHaveBeenCalledWith({ left: 300, behavior: "smooth" });
  });

  // extra: the active bullet is not an exception; clicking it scrolls too.
  it("calls scrollTo once to the current stop when clicking the already active bullet", async () => {
    const user = userEvent.setup();
    const { scrollTo } = renderWithTrackScrollSpy();

    const bullet1 = screen.getByRole("button", { name: "Go to slide 1" });
    expect(bullet1).toHaveAttribute("aria-current", "true");

    await user.click(bullet1);

    expect(scrollTo).toHaveBeenCalledTimes(1);
    expect(scrollTo).toHaveBeenCalledWith({ left: 0, behavior: "auto" });
  });
});

// extra: className forwarding is part of the API.
describe("TestimonialCarousel className forwarding on the carousel section (T5: spec → API, G-B)", () => {
  it("joins an external className on the root section alongside the .carousel base", () => {
    const consumerClass = "about-testimonials-carousel";
    const carouselClass = styles.carousel ?? "carousel";

    render(carousel({ className: consumerClass }));

    const region = screen.getByRole("region", { name: LABELS.carousel });
    expect(region).toHaveClass(carouselClass);
    expect(region).toHaveClass(consumerClass);
  });
});

describe("TestimonialCarousel accessibility audit closed and with the dialog open (T5: cierre, Tests esperados 12)", () => {
  it("has no accessibility violations with the full closed carousel", async () => {
    mockCarouselLayout([0, 300, 600], 900, 600);
    const { container } = render(carousel());

    const region = screen.getByRole("region", { name: LABELS.carousel });
    expect(region).toHaveAttribute("aria-roledescription", "carousel");
    expect(screen.getAllByRole("group")).toHaveLength(3);
    expect(
      screen.getAllByRole("button", { name: /Go to slide/ }),
    ).toHaveLength(2);
    expect(
      screen.getByRole("button", { name: "Go to slide 1" }),
    ).toHaveAttribute("aria-current", "true");
    expect(container.querySelector("dialog")).toBeNull();
    expect(container.querySelector("clipPath#hex-avatar-outer")).not.toBeNull();
    expect(container.querySelector("linearGradient")).toHaveAttribute(
      "id",
      "accent-gradient",
    );

    await expectNoA11yViolations(container);
  });

  it("has no accessibility violations with the dialog open", async () => {
    const user = userEvent.setup();
    mockCarouselLayout([0, 300, 600], 900, 600);
    const { container } = render(carousel());

    await user.click(
      screen.getByRole("button", {
        name: "Read full testimonial from Grace Hopper",
      }),
    );

    const dialog = screen.getByRole("dialog", { name: TESTIMONIAL_B.author });
    expect(dialog).toHaveAttribute("open");

    await expectNoA11yViolations(container);
  });
});
