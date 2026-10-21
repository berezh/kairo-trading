import styles from "./page.module.scss";

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
        <section className={styles.hero} id="overview">
          <div className={styles.intro}>
            <p className={styles.eyebrow}>Your trading workspace</p>
            <h1 className={styles.title}>
              Clear thinking.
              <br />
              <span>Better trading.</span>
            </h1>
            <p className={styles.description}>
              Bring your market research and trading tools into one focused
              workspace. Start with the essentials, then make it your own.
            </p>
            <div className={styles.actions}>
              <a className={styles.primaryAction} href="#workspace">
                Set up your workspace
              </a>
              <a className={styles.textAction} href="#markets">
                Explore what&apos;s inside <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>

          <section
            className={styles.workspace}
            id="workspace"
            aria-labelledby="workspace-title"
          >
            <div className={styles.workspaceHeader}>
              <div>
                <p className={styles.panelEyebrow}>Getting started</p>
                <h2 className={styles.panelTitle} id="workspace-title">
                  Your workspace
                </h2>
              </div>
              <span className={styles.status}>Ready to configure</span>
            </div>

            <div className={styles.setupList}>
              <div className={styles.setupItem}>
                <span className={styles.itemIcon} aria-hidden="true">
                  ◷
                </span>
                <span className={styles.itemCopy}>
                  <strong>Build a watchlist</strong>
                  <span>Keep the markets you follow close</span>
                </span>
                <span className={styles.itemStatus}>Not started</span>
              </div>
              <div className={styles.setupItem}>
                <span className={styles.itemIcon} aria-hidden="true">
                  ↗
                </span>
                <span className={styles.itemCopy}>
                  <strong>Connect market data</strong>
                  <span>Choose a data provider to get started</span>
                </span>
                <span className={styles.itemStatus}>Not connected</span>
              </div>
              <div className={styles.setupItem}>
                <span className={styles.itemIcon} aria-hidden="true">
                  ◈
                </span>
                <span className={styles.itemCopy}>
                  <strong>Set your preferences</strong>
                  <span>Shape a workspace that works for you</span>
                </span>
                <span className={styles.itemStatus}>Optional</span>
              </div>
            </div>
          </section>
        </section>

        <section className={styles.tools} id="markets" aria-labelledby="tools-title">
          <h2 className={styles.toolsHeading} id="tools-title">
            A better foundation for your market workflow
          </h2>
          <p className={styles.toolsDescription}>
            Kairo is ready for your watchlists, market data, and research tools.
            Connect your preferred services to begin.
          </p>
        </section>
      </main>

      <footer className={styles.footer}>
        <span>Kairo Trading</span>
        <span>Thoughtful tools for the markets.</span>
      </footer>
    </div>
  );
}
