import styles from "./page.module.scss";
import MarketQuotes from "./market-quotes";

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
        <nav className={styles.nav} aria-label="Main navigation">
          <a href="#overview">Overview</a>
          <a href="#markets">Market tools</a>
        </nav>
        <a className={styles.headerAction} href="#workspace">
          Open workspace
        </a>
      </header>

      <main className={styles.content}>
        <MarketQuotes />
      </main>

      <footer className={styles.footer}>
        <span>Kairo Trading</span>
        <span>Thoughtful tools for the markets.</span>
      </footer>
    </div>
  );
}
