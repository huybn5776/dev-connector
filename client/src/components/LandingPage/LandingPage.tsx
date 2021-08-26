import React, { useRef } from 'react';

import { useHistory } from 'react-router-dom';

import styles from './LandingPage.module.scss';
import buttonStyles from '@styles/button.module.scss';

const LandingPage: React.FC = () => {
  const emailInputRef = useRef<HTMLInputElement>(null);
  const history = useHistory();

  function goToRegisterPage(): void {
    history.push('/register', { email: emailInputRef.current?.value });
  }

  return (
    <div className={styles.LandingPage}>
      <div className={styles.blurCircles} />

      <div className={styles.heroContainer}>
        <h1 className={styles.heroTitle}>Developer Connector</h1>
        <p className={styles.heroParagraph}>
          Create a developer profile/portfolio, share posts and get help from other developers
        </p>

        <div className={styles.getStartContainer}>
          <input
            className={styles.getStartInput}
            type="email"
            placeholder="Enter your email address"
            ref={emailInputRef}
          />
          <button className={buttonStyles.primaryButton} type="button" onClick={goToRegisterPage}>
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
