import styles from "./page.module.scss";
import Dashboard from "../components/dashboard";
import Header from "../components/header";

export default function Home() {
  return (
    <div className={styles.page}>
      <Header />

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
