import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { AccentGradientDefs } from "../Icon";

import buttonStyles from "../Button/Button.module.css";

import styles from "./Sidebar.module.css";

import { Sidebar } from "./Sidebar";
import type { SidebarLabels, SidebarProps } from "./Sidebar";

import type { ContactItem, Profile, SocialLink } from "@data/cv.types.generated";

import { expectNoA11yViolations } from "../../test/a11y";

const PROFILE: Profile = {
  name: "Alex Rivera",
  headline: "Frontend Developer",
  avatar: { src: "/images/avatar.png" },
  about: ["Example bio paragraph for the About panel."],
};

const CONTACT: readonly ContactItem[] = [
  { id: "email", type: "email", value: "alex@example.com" },
];

const SOCIAL: readonly SocialLink[] = [
  { id: "github", network: "github", url: "https://github.com/example" },
  { id: "linkedin", network: "linkedin", url: "https://www.linkedin.com/in/example" },
];

const LABELS: SidebarLabels = {
  region: "Profile",
  social: "Social profiles",
  showContacts: "Show Contacts",
  hideContacts: "Hide Contacts",
  downloadCv: "Download CV",
  avatarAlt: "Portrait of Alex Rivera",
  contact: {
    email: "Email",
    phone: "Phone",
    whatsapp: "WhatsApp",
    location: "Location",
  },
};

function renderSidebar(overrides: Partial<SidebarProps> = {}) {
  const props: SidebarProps = {
    profile: PROFILE,
    contact: CONTACT,
    social: SOCIAL,
    labels: LABELS,
    ...overrides,
  };
  return render(<Sidebar {...props} />);
}

describe("Sidebar landmark, identity and social structure (T2: RF-1, RF-6, RF-8, RF-9)", () => {
  it("renders a complementary <aside> named by labels.region containing identity and social", () => {
    renderSidebar();

    const region = screen.getByRole("complementary", { name: LABELS.region });
    expect(region.tagName).toBe("ASIDE");

    within(region).getByRole("img", { name: LABELS.avatarAlt });
    within(region).getByText(PROFILE.name);
    within(region).getByText(PROFILE.headline);
    within(region).getByRole("list", { name: LABELS.social });
  });

  it("shows the name in a <p> and the headline in a Badge, rendering no heading", () => {
    renderSidebar();

    expect(screen.queryAllByRole("heading")).toHaveLength(0);

    // The tag name is asserted too: "not a heading" alone would not pin down the
    // element.
    const name = screen.getByText(PROFILE.name);
    expect(name.tagName).toBe("P");

    const headline = screen.getByText(PROFILE.headline);
    expect(headline.tagName).toBe("SPAN");
  });

  it("renders the avatar img with its alt and without width, height or decoding attributes", () => {
    renderSidebar();

    const avatar = screen.getByRole("img", { name: LABELS.avatarAlt });
    expect(avatar).toHaveAttribute("src", PROFILE.avatar.src);

    expect(avatar).not.toHaveAttribute("width");
    expect(avatar).not.toHaveAttribute("height");
    expect(avatar).not.toHaveAttribute("decoding");
  });

  it("renders a named social list with one external link per network labeled by its brand", () => {
    renderSidebar();

    const list = screen.getByRole("list", { name: LABELS.social });
    expect(within(list).getAllByRole("listitem")).toHaveLength(SOCIAL.length);

    const links = within(list).getAllByRole("link");
    expect(links).toHaveLength(SOCIAL.length);
    expect(links.map((link) => link.getAttribute("aria-label"))).toEqual([
      "GitHub",
      "LinkedIn",
    ]);

    const github = within(list).getByRole("link", { name: "GitHub" });
    expect(github).toHaveAttribute("href", "https://github.com/example");
    expect(github).toHaveAttribute("target", "_blank");
    expect(github).toHaveAttribute("rel", "noopener noreferrer");

    const linkedin = within(list).getByRole("link", { name: "LinkedIn" });
    expect(linkedin).toHaveAttribute("href", "https://www.linkedin.com/in/example");
    expect(linkedin).toHaveAttribute("target", "_blank");
    expect(linkedin).toHaveAttribute("rel", "noopener noreferrer");

    for (const link of links) {
      const svg = link.querySelector("svg");
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute("aria-hidden", "true");
    }
  });

  it("does not render the social list when social is empty", () => {
    renderSidebar({ social: [] });

    expect(screen.queryByRole("list", { name: LABELS.social })).toBeNull();
    expect(screen.queryByRole("link", { name: "GitHub" })).toBeNull();
    expect(screen.queryByRole("link", { name: "LinkedIn" })).toBeNull();
    expect(screen.getByRole("complementary", { name: LABELS.region })).toBeInTheDocument();
    expect(screen.getByText(PROFILE.name)).toBeInTheDocument();
  });
});

const CONTACT_FULL: readonly ContactItem[] = [
  { id: "email", type: "email", value: "alex@example.com" },
  { id: "phone", type: "phone", value: "+54 11 5555-0100" },
  { id: "whatsapp", type: "whatsapp", value: "+54 9 11 5555-0100" },
  { id: "location", type: "location", value: "Buenos Aires, Argentina" },
];

const PROFILE_WITH_CV: Profile = {
  ...PROFILE,
  downloadCvUrl: "/cv/alex-rivera-cv.pdf",
};

const SEPARATOR_IN_ADDITIONAL = '#sidebar-contacts div[aria-hidden="true"]';

function renderSidebarWithDefs(overrides: Partial<SidebarProps> = {}) {
  const props: SidebarProps = {
    profile: PROFILE,
    contact: CONTACT_FULL,
    social: SOCIAL,
    labels: LABELS,
    ...overrides,
  };
  return render(
    <>
      <AccentGradientDefs />
      <Sidebar {...props} />
    </>,
  );
}

describe("Sidebar contacts: derived links, labels and separator (T3: RF-5, RF-6, RF-9)", () => {
  it("renders one contact list item per entry with its translated label and IconBox glyph", () => {
    const { container } = renderSidebarWithDefs();

    const region = screen.getByRole("complementary", { name: LABELS.region });

    expect(container.querySelector("#sidebar-contacts")).not.toBeNull();

    // The contacts list has no name of its own, so the lists are counted instead
    // of queried by name.
    const lists = within(region).getAllByRole("list");
    expect(lists).toHaveLength(2);
    expect(within(region).getByRole("list", { name: LABELS.social })).toBeInTheDocument();

    for (const item of CONTACT_FULL) {
      const label = screen.getByText(LABELS.contact[item.type]);
      expect(label.tagName).toBe("SPAN");

      const row = label.closest("li");
      if (row === null) {
        throw new Error(
          `expected the "${LABELS.contact[item.type]}" label to be inside a list item`,
        );
      }
      expect(row.parentElement?.tagName).toBe("UL");

      const iconBox = row.firstElementChild;
      expect(iconBox?.tagName).toBe("SPAN");
      expect(iconBox).toHaveAttribute("aria-hidden", "true");
      expect(iconBox?.querySelector('svg[stroke="url(#accent-gradient)"]')).not.toBeNull();
    }

    expect(container.querySelectorAll(SEPARATOR_IN_ADDITIONAL)).toHaveLength(1);
  });

  it("renders email and phone as mailto/tel links without target or rel", () => {
    renderSidebarWithDefs();

    const email = screen.getByRole("link", { name: "alex@example.com" });
    expect(email).toHaveAttribute("href", "mailto:alex@example.com");
    expect(email).not.toHaveAttribute("target");
    expect(email).not.toHaveAttribute("rel");

    const phone = screen.getByRole("link", { name: "+54 11 5555-0100" });
    expect(phone).toHaveAttribute("href", "tel:+541155550100");
    expect(phone).not.toHaveAttribute("target");
    expect(phone).not.toHaveAttribute("rel");

    expect(email).toHaveAttribute("title", "alex@example.com");
    expect(phone).toHaveAttribute("title", "+54 11 5555-0100");
  });

  it("opens the derived whatsapp link in a new tab with noopener noreferrer", () => {
    renderSidebarWithDefs();

    const whatsapp = screen.getByRole("link", { name: "+54 9 11 5555-0100" });
    expect(whatsapp).toHaveAttribute("href", "https://wa.me/5491155550100");
    expect(whatsapp).toHaveAttribute("target", "_blank");
    expect(whatsapp).toHaveAttribute("rel", "noopener noreferrer");
    expect(whatsapp).toHaveAttribute("title", "+54 9 11 5555-0100");
  });

  it("opens a contact with an explicit site href as an external link too", () => {
    renderSidebarWithDefs({
      contact: [
        {
          id: "site",
          type: "location",
          value: "alexrivera.dev",
          href: "https://alexrivera.dev",
        },
      ],
    });

    const site = screen.getByRole("link", { name: "alexrivera.dev" });
    expect(site).toHaveAttribute("href", "https://alexrivera.dev");
    expect(site).toHaveAttribute("target", "_blank");
    expect(site).toHaveAttribute("rel", "noopener noreferrer");
    expect(site).toHaveAttribute("title", "alexrivera.dev");
  });

  it("renders location as plain text, not a link", () => {
    renderSidebarWithDefs();

    expect(screen.queryByRole("link", { name: "Buenos Aires, Argentina" })).toBeNull();
    const value = screen.getByText("Buenos Aires, Argentina");
    expect(value.tagName).toBe("P");
    expect(value).toHaveAttribute("title", "Buenos Aires, Argentina");
  });

  it("shows a phone value without digits as plain text", () => {
    // extra: a phone or WhatsApp value with no digits is shown as plain text.
    renderSidebarWithDefs({
      contact: [{ id: "phone-bad", type: "phone", value: "N/D" }],
    });

    expect(screen.queryByRole("link", { name: "N/D" })).toBeNull();
    const value = screen.getByText("N/D");
    expect(value.tagName).toBe("P");
    expect(value).toHaveAttribute("title", "N/D");
  });

  it("renders no contacts list and no Separator when contact is empty and there is no downloadCvUrl", () => {
    const { container } = renderSidebarWithDefs({ contact: [] });

    const region = screen.getByRole("complementary", { name: LABELS.region });
    expect(within(region).getAllByRole("list")).toHaveLength(1);
    for (const contactLabel of Object.values(LABELS.contact)) {
      expect(screen.queryByText(contactLabel)).toBeNull();
    }
    expect(container.querySelectorAll(SEPARATOR_IN_ADDITIONAL)).toHaveLength(0);
    expect(container.querySelector("#sidebar-contacts")).not.toBeNull();
  });

  it("keeps the Separator when contact is empty but downloadCvUrl exists", () => {
    const { container } = renderSidebarWithDefs({
      contact: [],
      profile: PROFILE_WITH_CV,
    });

    const region = screen.getByRole("complementary", { name: LABELS.region });
    expect(within(region).getAllByRole("list")).toHaveLength(1);
    expect(container.querySelectorAll(SEPARATOR_IN_ADDITIONAL)).toHaveLength(1);
  });
});

const collapsedClass = styles.additionalCollapsed ?? "additionalCollapsed";

const CONTACTS_ID = "sidebar-contacts";

describe("Sidebar icon-only contacts disclosure (T4/T7: RF-3, RF-4)", () => {
  it("mounts the disclosure button collapsed, wired to the contacts block, as first child of the landmark", () => {
    const { container } = renderSidebarWithDefs();

    const button = screen.getByRole("button", { name: LABELS.showContacts });
    expect(button).toHaveAttribute("type", "button");
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(button).toHaveAttribute("aria-controls", CONTACTS_ID);

    const contacts = container.querySelector(`#${CONTACTS_ID}`);
    expect(contacts).not.toBeNull();

    // The collapsed state is a module class, never an inline style, so the print
    // rules can override it.
    expect(contacts).toHaveClass(collapsedClass);
    expect(contacts).not.toHaveAttribute("style");

    const region = screen.getByRole("complementary", { name: LABELS.region });
    expect(button.parentElement).toBe(region);
    expect(region.firstElementChild).toBe(button);
  });

  it("expands on click: aria-expanded true, hideContacts accessible name and the collapsed class removed", async () => {
    const user = userEvent.setup();
    const { container } = renderSidebarWithDefs();

    await user.click(screen.getByRole("button", { name: LABELS.showContacts }));

    const button = screen.getByRole("button", { name: LABELS.hideContacts });
    expect(screen.queryByRole("button", { name: LABELS.showContacts })).toBeNull();

    expect(button).toHaveAttribute("aria-expanded", "true");

    const contacts = container.querySelector(`#${CONTACTS_ID}`);
    expect(contacts).not.toBeNull();
    expect(contacts).not.toHaveClass(collapsedClass);
    expect(contacts).not.toHaveAttribute("style");
  });

  it("reverts on the second click: collapsed class, aria-expanded false and the showContacts accessible name", async () => {
    const user = userEvent.setup();
    const { container } = renderSidebarWithDefs();

    await user.click(screen.getByRole("button", { name: LABELS.showContacts }));
    await user.click(screen.getByRole("button", { name: LABELS.hideContacts }));

    const button = screen.getByRole("button", { name: LABELS.showContacts });
    expect(button).toHaveAttribute("aria-expanded", "false");

    const contacts = container.querySelector(`#${CONTACTS_ID}`);
    expect(contacts).not.toBeNull();
    expect(contacts).toHaveClass(collapsedClass);
  });

  it("renders the chevron inside the button as a decorative aria-hidden icon", () => {
    renderSidebarWithDefs();

    const button = screen.getByRole("button", { name: LABELS.showContacts });
    const chevron = button.querySelector("svg");
    expect(chevron).toBeInTheDocument();
    expect(chevron).toHaveAttribute("aria-hidden", "true");
  });

  it("is icon-only: data-print-hide root, aria-hidden chevron, no visible text and no CornerTab (T7: Test 10)", () => {
    const { container } = renderSidebarWithDefs();

    const button = screen.getByRole("button", { name: LABELS.showContacts });
    expect(button).toHaveAttribute("data-print-hide");
    expect(button.textContent).toBe("");
    expect(screen.queryByText(LABELS.showContacts)).toBeNull();

    const chevron = button.querySelector("svg");
    expect(chevron).toBeInTheDocument();
    expect(chevron).toHaveAttribute("aria-hidden", "true");

    const region = screen.getByRole("complementary", { name: LABELS.region });
    expect(button.parentElement).toBe(region);
    expect(within(region).getAllByRole("button")).toHaveLength(1);
    expect(container.querySelectorAll("button")).toHaveLength(1);
  });
});

const ctaFullWidthClass = buttonStyles.fullWidth ?? "fullWidth";

describe("Sidebar Download CV call-to-action (T5: RF-2)", () => {
  it("renders the Download CV link with its exact href and download attribute after the contacts", () => {
    renderSidebarWithDefs({ profile: PROFILE_WITH_CV });

    const link = screen.getByRole("link", { name: LABELS.downloadCv });
    expect(link.tagName).toBe("A");

    expect(link).toHaveAttribute("href", "/cv/alex-rivera-cv.pdf");

    expect(link).toHaveAttribute("download");

    expect(link).toHaveClass(ctaFullWidthClass);

    const glyph = link.querySelector("svg");
    expect(glyph).toBeInTheDocument();
    expect(glyph).toHaveAttribute("aria-hidden", "true");

    expect(link.closest("#sidebar-contacts")).not.toBeNull();
    expect(link.previousElementSibling?.tagName).toBe("UL");
  });

  it("renders no Download CV link when downloadCvUrl is absent and keeps the rest intact", () => {
    const { container } = renderSidebarWithDefs();

    expect(screen.queryByRole("link", { name: LABELS.downloadCv })).toBeNull();

    expect(screen.getByRole("link", { name: "alex@example.com" })).toBeInTheDocument();
    expect(container.querySelectorAll(SEPARATOR_IN_ADDITIONAL)).toHaveLength(1);
  });
});

const bodyClass = styles.additionalBody ?? "additionalBody";

const CONTACTS_ANIMATE_ATTR = "data-contacts-animate";

describe("contacts entrance (Cambio motion 3)", () => {
  it("wraps Separator, contacts list and CTA in a single additionalBody child, Separator before the list (test 11: RF-11)", () => {
    const { container } = renderSidebarWithDefs({ profile: PROFILE_WITH_CV });

    const contacts = container.querySelector(`#${CONTACTS_ID}`);
    if (contacts === null) {
      throw new Error(
        `expected #${CONTACTS_ID} to exist (RF-10: id alcanzable del disclosure)`,
      );
    }

    const wrappers = Array.from(contacts.children).filter(
      (child): child is HTMLElement =>
        child instanceof HTMLElement && child.classList.contains(bodyClass),
    );
    expect(wrappers).toHaveLength(1);
    const body = wrappers[0];
    if (body === undefined) {
      throw new Error(
        `expected #${CONTACTS_ID} to have exactly one direct child with the wrapper class "${bodyClass}"`,
      );
    }
    expect(body.tagName).toBe("DIV");

    const separator = body.querySelector('div[aria-hidden="true"]');
    if (separator === null) {
      throw new Error("expected the wrapper to contain the Separator (div[aria-hidden])");
    }
    const contactsList = within(body).getByRole("list");
    within(body).getByRole("link", { name: LABELS.downloadCv });

    expect(
      separator.compareDocumentPosition(contactsList) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("reflects expanded on data-contacts-animate: absent initially, on expand, off on collapse, on again on re-expand (test 12: RF-11)", async () => {
    const user = userEvent.setup();
    const { container } = renderSidebarWithDefs();

    const contacts = container.querySelector(`#${CONTACTS_ID}`);
    if (contacts === null) {
      throw new Error(`expected #${CONTACTS_ID} to exist (RF-10)`);
    }

    expect(contacts).not.toHaveAttribute(CONTACTS_ANIMATE_ATTR);

    await user.click(screen.getByRole("button", { name: LABELS.showContacts }));
    expect(contacts).toHaveAttribute(CONTACTS_ANIMATE_ATTR);

    await user.click(screen.getByRole("button", { name: LABELS.hideContacts }));
    expect(contacts).not.toHaveAttribute(CONTACTS_ANIMATE_ATTR);

    await user.click(screen.getByRole("button", { name: LABELS.showContacts }));
    expect(contacts).toHaveAttribute(CONTACTS_ANIMATE_ATTR);
  });

  it("marks the collapsed state with the module collapsed class and aria-expanded=false, without visibility assertions (test 13: RF-3/RF-11)", () => {
    // No toBeVisible() here: jsdom does not apply CSS Module styles, so the class
    // is what gets asserted.
    const { container } = renderSidebarWithDefs();

    const contacts = container.querySelector(`#${CONTACTS_ID}`);
    expect(contacts).not.toBeNull();
    expect(contacts).toHaveClass(collapsedClass);
    expect(screen.getByRole("button", { name: LABELS.showContacts })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });
});

describe("Sidebar accessibility audit collapsed and expanded (T6: Tests 9)", () => {
  it("has no accessibility violations with the contacts collapsed", async () => {
    const { container } = renderSidebarWithDefs();

    await expectNoA11yViolations(container);
  });

  it("has no accessibility violations with the contacts expanded", async () => {
    const user = userEvent.setup();
    const { container } = renderSidebarWithDefs();

    await user.click(screen.getByRole("button", { name: LABELS.showContacts }));
    expect(screen.getByRole("button", { name: LABELS.hideContacts })).toHaveAttribute(
      "aria-expanded",
      "true",
    );

    await expectNoA11yViolations(container);
  });
});
