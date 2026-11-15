import type { MouseEvent, ReactNode } from "react";
import { useRef, useState } from "react";

import { useCv, useLocale } from "../../providers/LocaleProvider";
import { AboutPage } from "../../pages/AboutPage";
import { ResumePage } from "../../pages/ResumePage";
import { useHashTab } from "../../lib/useHashTab";
import { getTabDirection } from "../../lib/tabDirection";
import type { MotionDirection } from "../../lib/tabDirection";
import { format } from "../../i18n/format";

import { AccentGradientDefs } from "../Icon";
import { HexAvatarDefs } from "../HexAvatar";
import { Box } from "../Box";
import { ControlsBar } from "../ControlsBar";
import { NavTabs, getTabId } from "../NavTabs";
import { Sidebar } from "../Sidebar";
import type { SidebarLabels } from "../Sidebar";

import styles from "./AppLayout.module.css";

const TAB_IDS = ["about", "resume"] as const;
type TabId = (typeof TAB_IDS)[number];

// Narrows the string NavTabs emits to a tab id without a cast.
const isTabId = (id: string): id is TabId =>
  (TAB_IDS as readonly string[]).includes(id);

export interface AppLayoutProps {
  className?: string;
}

export function AppLayout({ className }: AppLayoutProps): ReactNode {
  const { t } = useLocale();
  const cv = useCv();
  const [active, setActive] = useHashTab(TAB_IDS, "about");

  // Derives the entry direction by adjusting state during render (React's
  // pattern for reacting to a state change), not in an effect.
  const [prevActive, setPrevActive] = useState(active);
  const [direction, setDirection] = useState<MotionDirection | null>(null);
  if (active !== prevActive) {
    setPrevActive(active);
    setDirection(
      getTabDirection(TAB_IDS.indexOf(prevActive), TAB_IDS.indexOf(active)),
    );
  }

  // The skip link moves focus to the panel without changing the hash, which
  // must stay shareable. The href remains as the no-JS fallback.
  const panelRef = useRef<HTMLDivElement>(null);

  const focusPanel = (event: MouseEvent<HTMLAnchorElement>): void => {
    event.preventDefault();
    panelRef.current?.focus();
  };

  const tabs = [
    { id: "about", label: t.nav.about },
    { id: "resume", label: t.nav.resume },
  ] as const;

  // The avatar alt is composed here, from the i18n template and the name in
  // the active language.
  const sidebarLabels: SidebarLabels = {
    region: t.sidebar.region,
    social: t.sidebar.social,
    showContacts: t.sidebar.showContacts,
    hideContacts: t.sidebar.hideContacts,
    downloadCv: t.sidebar.downloadCv,
    avatarAlt: format(t.sidebar.avatarAlt, { name: cv.profile.name }),
    contact: t.contact,
  };

  // Each page is mounted exactly once: the active one in the tab panel, the
  // other in a hidden sibling block.
  const inactive: TabId = active === "about" ? "resume" : "about";

  const containerClassName = [styles.container, className]
    .filter((cls): cls is string => cls !== undefined)
    .join(" ");

  return (
    <>
      {/* Shared SVG defs, mounted once; children reference them by id. */}
      <AccentGradientDefs />
      <HexAvatarDefs />

      <a
        className={styles.skipLink}
        data-print-hide
        href="#main-panel"
        onClick={focusPanel}
      >
        {t.skipToContent}
      </a>

      <div className={containerClassName}>
        <ControlsBar />
        <div className={styles.grid}>
          <Sidebar
            className={styles.aside}
            profile={cv.profile}
            contact={cv.contact}
            social={cv.social}
            labels={sidebarLabels}
          />
          <main className={styles.main}>
            <Box variant="outer" as="section" className={styles.contentCard}>
              <NavTabs
                items={tabs}
                activeId={active}
                onChange={(id) => {
                  if (isTabId(id)) {
                    setActive(id);
                  }
                }}
                panelId="main-panel"
                label={t.nav.label}
              />
              {/* Print contract through data-* attributes: module class names are
                  hashed, so global.css cannot target them. */}
              <div data-print-stack>
                <div
                  ref={panelRef}
                  role="tabpanel"
                  id="main-panel"
                  aria-labelledby={getTabId(active)}
                  tabIndex={0}
                  data-print-page={active}
                  className={styles.panel}
                >
                  {/* key={active} remounts the node on a tab change so the entry animation
                      runs again. The direction attribute only exists after a change. */}
                  <div
                    data-motion-panel
                    key={active}
                    {...(direction
                      ? { "data-motion-direction": direction }
                      : {})}
                    className={styles.motionPanel}
                  >
                    {active === "about" ? <AboutPage /> : <ResumePage />}
                  </div>
                </div>
                {/* The inactive page is hidden on screen (out of the accessibility tree)
                    and shown in print. */}
                <div data-print-only data-print-page={inactive} hidden>
                  {active === "about" ? <ResumePage /> : <AboutPage />}
                </div>
              </div>
            </Box>
          </main>
        </div>
      </div>
    </>
  );
}
