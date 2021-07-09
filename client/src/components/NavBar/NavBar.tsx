import React from 'react';

import clsx from 'clsx';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

import { authActions } from '@actions';
import { authSelectors } from '@selectors';

import styles from './NavBar.module.scss';

const NavBar: React.FC = () => {
  const isAuthenticated = useSelector(authSelectors.selectIsAuthenticated);
  const dispatch = useDispatch();

  return (
    <nav className={styles.NavBar}>
      <h1 className={styles.headerLogo}>
        <Link to="/" className={styles.headerLogoLink}>
          <i className="code icon" />
        </Link>
      </h1>

      <Link to="profiles" className={styles.headerLink}>
        Developers
      </Link>
      {isAuthenticated ? (
        <button className={styles.headerLink} type="button" onClick={() => dispatch(authActions.logout())}>
          Logout
        </button>
      ) : (
        <>
          <Link to="login" className={styles.headerLink}>
            Login
          </Link>
          <Link to="register" className={clsx(styles.headerLink, styles.headerLinkPrimary)}>
            Register
          </Link>
        </>
      )}
    </nav>
  );
};

export default NavBar;
