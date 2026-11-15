import { useState } from "react";

import { Badge } from "../Badge";
import { Box } from "../Box";
import { BRAND_NAMES, BrandIcon } from "../BrandIcon";
import { Button } from "../Button";
import { Icon } from "../Icon";
import { IconBox } from "../IconBox";
import { Overhead } from "../Overhead";
import { Separator } from "../Separator";

import type { IconName } from "../Icon";

import type { ContactItem, Profile, SocialLink } from "@data/cv.types.generated";

import styles from "./Sidebar.module.css";

import { getContactHref } from "./getContactHref";
import { assetUrl } from "../../utils/assetUrl";

export interface SidebarLabels {
  region: string;
  social: string;
  /** The disclosure button is icon-only, so this label is its only name. */
  showContacts: string;
  hideContacts: string;
  downloadCv: string;
  /** Built by the parent from the profile name; this component composes no text. */
  avatarAlt: string;
  contact: Record<ContactItem["type"], string>;
}

export interface SidebarProps {
  profile: Profile;
  contact: readonly ContactItem[];
  social: readonly SocialLink[];
  labels: SidebarLabels;
  className?: string;
}

// Record<type, IconName> is exhaustive: a new contact type without an icon
// fails the type check.
const CONTACT_ICONS: Record<ContactItem["type"], IconName> = {
  email: "mail",
  phone: "phone",
  whatsapp: "message-circle",
  location: "map-pin",
};

// Fixed id shared with the button's aria-controls and the global print rules.
const CONTACTS_CONTAINER_ID = "sidebar-contacts";

export function Sidebar({ profile, contact, social, labels, className }: SidebarProps) {
  // Collapsed by default below 1200px. From 1200px up the visibility comes from
  // CSS, not from this state, so no matchMedia is needed.
  const [expanded, setExpanded] = useState(false);

  // The base class is always present because it carries the transform
  // transition, so the closing rotation is animated too.
  const chevronClassName = [
    styles.chevron,
    expanded ? styles.chevronRotated : undefined,
  ]
    .filter((cls): cls is string => cls !== undefined)
    .join(" ");

  // Collapsing uses a class, never an inline style: print and the 1200px media
  // query must be able to override it.
  const additionalClassName = [
    styles.additional,
    expanded ? undefined : styles.additionalCollapsed,
  ]
    .filter((cls): cls is string => cls !== undefined)
    .join(" ");

  return (
    <Box variant="outer" as="aside" aria-label={labels.region} className={className}>
      {/* Icon-only disclosure button, first child of the landmark. A corner tab
          was dropped here because its background overlapped the name at 375px. */}
      <button
        type="button"
        className={styles.disclosure}
        data-print-hide
        aria-label={expanded ? labels.hideContacts : labels.showContacts}
        aria-expanded={expanded}
        aria-controls={CONTACTS_CONTAINER_ID}
        onClick={() => {
          setExpanded((current) => !current);
        }}
      >
        <Icon name="chevron-down" className={chevronClassName} />
      </button>

      <div className={styles.baseInfo}>
        {/* No width/height attributes: the size comes from a token in CSS and
            changes by breakpoint. */}
        <figure className={styles.avatar}>
          <img src={assetUrl(profile.avatar.src)} alt={labels.avatarAlt} />
        </figure>

        {/* The name is a <p>, not a heading: the page's only h1 belongs to the tab
            panel. */}
        <div className={styles.identity}>
          <p className={styles.name}>{profile.name}</p>
          <Badge>{profile.headline}</Badge>
        </div>

        {social.length > 0 && (
          <ul className={styles.social} aria-label={labels.social}>
            {social.map((link) => (
              // External links always open in a new tab with rel="noopener noreferrer".
              <li key={link.id}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={BRAND_NAMES[link.network]}
                >
                  <BrandIcon network={link.network} />
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div
        id={CONTACTS_CONTAINER_ID}
        className={additionalClassName}
        data-contacts-animate={expanded ? "" : undefined}
      >
        <div className={styles.additionalBody}>
          {/* No separator when there is nothing below it. */}
          {(contact.length > 0 || profile.downloadCvUrl !== undefined) && <Separator />}

          {contact.length > 0 && (
            <ul className={styles.contacts}>
              {contact.map((item) => {
                // An explicit href wins; otherwise it is derived from the type. undefined
                // means the value is shown as plain text.
                const href = getContactHref(item);

                // External means an explicit http(s) href or a derived WhatsApp link: decided
                // by type and field, never by guessing from the domain.
                const external =
                  item.href !== undefined ? /^https?:/i.test(item.href) : item.type === "whatsapp";

                return (
                  <li key={item.id}>
                    <IconBox icon={CONTACT_ICONS[item.type]} />
                    <div>
                      <Overhead>{labels.contact[item.type]}</Overhead>

                      {/* The full value goes in `title` because the visible text may be cut with
                          an ellipsis. */}
                      {href !== undefined ? (
                        <a
                          href={href}
                          title={item.value}
                          target={external ? "_blank" : undefined}
                          rel={external ? "noopener noreferrer" : undefined}
                        >
                          {item.value}
                        </a>
                      ) : (
                        <p title={item.value}>{item.value}</p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {profile.downloadCvUrl !== undefined && (
            <Button
              href={assetUrl(profile.downloadCvUrl)}
              download
              icon="download"
              fullWidth
              className={styles.cta}
            >
              {labels.downloadCv}
            </Button>
          )}
        </div>
      </div>
    </Box>
  );
}
