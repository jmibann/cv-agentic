import { useRef } from "react";

import { CornerTab } from "../CornerTab";

import styles from "./NavTabs.module.css";

export interface NavTabItem {
  id: string;
  label: string;
}

export interface NavTabsProps {
  items: readonly NavTabItem[];
  /** Controlled: syncing with the URL belongs to the parent. */
  activeId: string;
  onChange: (id: string) => void;
  panelId: string;
  label: string;
  className?: string;
}

// The "tab-" prefix keeps these ids apart from #about and #resume, which the
// URL hash uses.
export const getTabId = (id: string): string => `tab-${id}`;

export function NavTabs({
  items,
  activeId,
  onChange,
  panelId,
  label,
  className,
}: NavTabsProps) {
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // No items: render nothing. An empty tablist is invalid for assistive tech.
  if (items.length === 0) {
    return null;
  }

  // Automatic activation: focus moves, and onChange fires only when the target
  // is not already active.
  const focusAndActivate = (destIndex: number) => {
    const destItem = items[destIndex];
    const destTab = tabRefs.current[destIndex];
    if (!destItem || !destTab) {
      return;
    }
    destTab.focus();
    const activeIndex = items.findIndex((item) => item.id === activeId);
    if (activeIndex !== -1 && destIndex !== activeIndex) {
      onChange(destItem.id);
    }
  };

  return (
    <CornerTab size="md" placement="float" className={className}>
      <div
        role="tablist"
        aria-label={label}
        aria-orientation="horizontal"
        className={styles.tablist}
      >
        {items.map((item, index) => {
          // Roving tabindex: only the active tab is in the tab order.
          const isActive = item.id === activeId;

          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              className={styles.tab}
              ref={(element) => {
                tabRefs.current[index] = element;
              }}
              id={getTabId(item.id)}
              aria-selected={isActive}
              // Every tab controls the same single panel; hidden panels are never mounted.
              aria-controls={panelId}
              tabIndex={isActive ? 0 : -1}
              onClick={() => {
                if (item.id !== activeId) {
                  onChange(item.id);
                }
              }}
              onKeyDown={(event) => {
                // preventDefault on keydown cancels the native click a button fires on keyup,
                // so Space activates exactly once.
                if (event.code === "Space") {
                  event.preventDefault();
                  focusAndActivate(index);
                  return;
                }
                const count = items.length;
                if (event.key === "ArrowRight") {
                  focusAndActivate((index + 1) % count);
                } else if (event.key === "ArrowLeft") {
                  focusAndActivate((index - 1 + count) % count);
                } else if (event.key === "Home") {
                  focusAndActivate(0);
                } else if (event.key === "End") {
                  focusAndActivate(count - 1);
                }
                // Enter needs no handler: the button's native click covers it. Other keys
                // are ignored.
              }}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </CornerTab>
  );
}
