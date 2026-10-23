import Link from "next/link";
import styles from "./index.module.scss";
import LiveIndicator from "../live-indicator";

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.header__content}>
        <Link className={styles.brand} href="/" aria-label="Kairo Trading home">
          <span className={styles.brandMark} aria-hidden="true">
            k
          </span>
          <span>KAIRO TRADING</span>
        </Link>
        <LiveIndicator />
      </div>
    </header>
  );
}
