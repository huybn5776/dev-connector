import React from 'react';
import { Link } from 'react-router-dom';

import styles from './NavBar.module.scss';
import clsx from 'clsx';

const NavBar: React.FC = () => (
  <nav className={styles.NavBar}>
    <h1 className={styles.headerLogo}>
      <Link to="/" className={styles.headerLogoLink}>
        <i className="code icon" />
      </Link>
    </h1>

    <Link to="profiles" className={styles.headerLink}>Developers</Link>
    <Link to="login" className={styles.headerLink}>Login</Link>
    <Link to="register" className={clsx(styles.headerLink, styles.headerLinkPrimary)}>Register</Link>
  </nav>
);

export default NavBar;
