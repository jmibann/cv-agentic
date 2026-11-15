import { useTheme } from "../../providers/ThemeProvider";

import { Icon } from "../Icon";

import styles from "./ThemeToggle.module.css";

// Reading the theme context here is a deliberate exception to "props in,
// events out".
export interface ThemeToggleProps {
  /** aria-label in the light theme: names the mode you switch to. */
  darkModeLabel: string;
  /** aria-label in the dark theme: names the mode you switch to. */
  lightModeLabel: string;
  className?: string;
}

export function ThemeToggle({
  darkModeLabel,
  lightModeLabel,
  className,
}: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  // The label names the mode you go to, never an action; the current state is
  // conveyed by aria-pressed.
  const label = theme === "light" ? darkModeLabel : lightModeLabel;

  const rootClassName = [styles.themeToggle, className]
    .filter((cls): cls is string => cls !== undefined)
    .join(" ");

  return (
    <button
      type="button"
      className={rootClassName}
      onClick={toggleTheme}
      aria-label={label}
      aria-pressed={theme === "dark"}
    >
      <Icon name={theme === "light" ? "moon" : "sun"} />
    </button>
  );
}
