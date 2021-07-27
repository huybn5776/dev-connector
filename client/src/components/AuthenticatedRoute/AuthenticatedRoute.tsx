import React, { ReactNode } from 'react';

import { useSelector } from 'react-redux';
import { Route, Redirect, RouteProps, useLocation, RouteComponentProps } from 'react-router-dom';

import { authSelectors } from '@selectors';

type AllProps = RouteProps;

const AuthenticatedRoute: React.FC<AllProps> = ({ component, render, ...rest }: AllProps) => {
  const isAuthenticated = useSelector(authSelectors.selectIsAuthenticated);
  const { pathname, search } = useLocation();
  const C = component as React.ComponentType;

  function renderFunc(props: RouteComponentProps): ReactNode {
    if (!isAuthenticated) {
      return <Redirect to={`/login?redirect=${pathname}${search}`} />;
    }
    if (render) {
      return render(props);
    }
    return <C />;
  }

  return <Route {...rest} render={renderFunc} />;
};

export default AuthenticatedRoute;
