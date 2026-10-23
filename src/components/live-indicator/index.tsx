"use client";

import { useAppSelector } from "@/redux/hooks";
import { CommonSelectors } from "@/redux/units/common/selector";
import styles from "./index.module.scss";

export default function LiveIndicator() {
  const connected = useAppSelector(CommonSelectors.connected);

  return (
    <span
      className={connected ? styles.connected : styles.disconnected}
      role="status"
      aria-live="polite"
    >
      <span className={styles.dot} aria-hidden="true" />
      <span className={styles.status}>        
        {connected ? "Live" : "Disconnected"}
      </span>
    </span>
  );
}
