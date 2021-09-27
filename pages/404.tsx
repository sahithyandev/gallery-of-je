import styles from "../styles/not-found.module.css";

export default function Custom404Page() {
  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>Page not found</h1>
        <span>
          <a href="/">Go Home</a>
        </span>
      </main>
    </div>
  );
}
