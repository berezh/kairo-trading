"use client";

import { useId, type ReactNode } from "react";
import styles from "./index.module.scss";
import classNames from "classnames";

type WidgetFrameProps = {
  children: ReactNode;
  title: string;
  rightTitle?: ReactNode;
  id?: string;
  contentClassName?: string;
};

export default function WidgetFrame({
  children,
  title,
  rightTitle,
  id,
  contentClassName,
}: WidgetFrameProps) {
  const titleId = useId();

  return (
    <div
      id={id}
      className={styles.root}
      aria-labelledby={titleId}
    >
      <div className={styles.header}>
        <h2 className={styles.title} id={titleId}>
          {title}
        </h2>
        {rightTitle}
      </div>
      <div className={classNames(styles.content, contentClassName)}>        
        {children}
      </div>
    </div>
  );
}
