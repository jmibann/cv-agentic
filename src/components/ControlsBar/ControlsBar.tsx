import { useLocale } from "../../providers/LocaleProvider";

import { LanguageSwitcher } from "../LanguageSwitcher";
import { ThemeToggle } from "../ThemeToggle";

import styles from "./ControlsBar.module.css";

export interface ControlsBarProps {
  className?: string;
}

export function ControlsBar({ className }: ControlsBarProps) {
  const { t } = useLocale();

  const rootClassName = [styles.controlsBar, className]
    .filter((cls): cls is string => cls !== undefined)
    .join(" ");

  // data-print-hide is the hook the global print rules use to hide the bar.
  return (
    <header className={rootClassName} data-print-hide>
      <div role="group" aria-label={t.controls.label} className={styles.group}>
        <ThemeToggle
          darkModeLabel={t.controls.darkMode}
          lightModeLabel={t.controls.lightMode}
        />
        <LanguageSwitcher label={t.controls.language} />
      </div>
    </header>
  );
}
