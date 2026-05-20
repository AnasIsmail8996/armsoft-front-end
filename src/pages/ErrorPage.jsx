import React from "react";
import styles from "./ErrorPage.module.css";

const ErrorPage = () => {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.code}>404</h1>
        <h2 className={styles.title}>Page Not Found</h2>
        <p className={styles.text}>
          Oops! The page you are looking for does not exist or has been moved.
        </p>

        <button
          className={styles.button}
          onClick={() => window.location.href = "/"}
        >
          Go Back Home
        </button>
      </div>
    </div>
  );
};

export default ErrorPage;