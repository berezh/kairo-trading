import styles from "./page.module.scss";
import Dashboard from "../components/dashboard";

export default function Home() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.header__content}>
          <a className={styles.brand} href="#overview" aria-label="Kairo Trading home">
            <span className={styles.brandMark} aria-hidden="true">
              k
            </span>
            <span>KAIRO TRADING</span>
          </a>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.main__content}>
          <div className={styles.main__flex}>
            <Dashboard />
          </div>
        </div>
      </main>
    </div>
  );
}
