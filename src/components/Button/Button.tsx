import type { ReactNode } from "react";

import { Icon } from "../Icon";
import type { IconName } from "../Icon";

import styles from "./Button.module.css";

interface CommonProps {
  children: ReactNode;
  size?: "default" | "small";
  icon?: IconName;
  iconPosition?: "start" | "end";
  fullWidth?: boolean;
  className?: string;
}

// Discriminated by `href`: a single interface would allow `disabled` on a link.
export type ButtonProps =
  | (CommonProps & {
      href?: undefined;
      type?: "button" | "submit";
      onClick?: () => void;
      disabled?: boolean;
    })
  | (CommonProps & {
      href: string;
      download?: boolean | string;
      target?: "_blank";
      rel?: string;
    });

export function Button(props: ButtonProps) {
  // The icon position is the real DOM order, not CSS `order`.
  const { icon, iconPosition = "start" } = props;
  const content =
    icon === undefined ? (
      props.children
    ) : (
      <>
        {iconPosition === "start" && <Icon name={icon} />}
        {props.children}
        {iconPosition === "end" && <Icon name={icon} />}
      </>
    );

  const classParts = [
    styles.button,
    props.size === "small" ? styles.small : undefined,
    props.fullWidth ? styles.fullWidth : undefined,
    props.className,
  ].filter((cls): cls is string => cls !== undefined);
  const rootClassName = classParts.join(" ");

  if (props.href !== undefined) {
    // Without an explicit rel, the safe default applies only when target is set.
    // A received rel is used as is, never merged.
    const rel = props.rel ?? (props.target ? "noopener noreferrer" : undefined);

    return (
      <a
        href={props.href}
        target={props.target}
        rel={rel}
        download={props.download}
        className={rootClassName}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      type={props.type ?? "button"}
      onClick={props.onClick}
      disabled={props.disabled}
      className={rootClassName}
    >
      {content}
    </button>
  );
}
