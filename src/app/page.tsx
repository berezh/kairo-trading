import styles from "./page.module.scss";
import Dashboard from "../components/dashboard";

export default function Home() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <a className={styles.brand} href="#overview" aria-label="Kairo Trading home">
          <span className={styles.brandMark} aria-hidden="true">
            k
          </span>
          <span>KAIRO TRADING</span>
        </a>
      </header>

      <main className={styles.content}>
        <Dashboard />
      </main>

      <footer className={styles.footer}>
        <span>Kairo Trading</span>
      </footer>
    </div>
  );
}
