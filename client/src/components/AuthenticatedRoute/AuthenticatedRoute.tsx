import React from 'react';

import { useSelector } from 'react-redux';
import { Route, Redirect, RouteProps, useLocation } from 'react-router-dom';

import { authSelectors } from '@selectors';

type AllProps = RouteProps;

const AuthenticatedRoute: React.FC<AllProps> = ({ component, ...rest }: AllProps) => {
  const isAuthenticated = useSelector(authSelectors.selectIsAuthenticated);
  const { pathname, search } = useLocation();
  const C = component as React.ComponentType;

  return (
    <Route
      {...rest}
      render={() => (isAuthenticated ? <C /> : <Redirect to={`/login?redirect=${pathname}${search}`} />)}
    />
  );
};

export default AuthenticatedRoute;
