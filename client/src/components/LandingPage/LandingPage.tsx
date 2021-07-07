import React from 'react';

import styles from './LandingPage.module.scss';
import buttonStyles from '@styles/button.module.scss';

const LandingPage: React.FC = () => {
  return (
    <div className={styles.LandingPage}>
      <div className={styles.blurCircles} />

      <div className={styles.heroContainer}>
        <h1 className={styles.heroTitle}>Developer Connector</h1>
        <p className={styles.heroParagraph}>
          Create a developer profile/portfolio, share posts and get help from other developers
        </p>

        <div className={styles.getStartContainer}>
          <input className={styles.getStartInput} type="email" placeholder="Enter your email address" />
          <button className={buttonStyles.primaryButton} type="button">Get Started</button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
