import React, { ReactNode } from 'react';

import { useSelector } from 'react-redux';
import { RouteProps, Route, Redirect, RouteComponentProps } from 'react-router-dom';

import { authSelectors } from '@selectors';

interface Props {
  fallbackTo: string;
}

type AllProps = Props & RouteProps;

const UnauthenticatedRoute: React.FC<AllProps> = ({ fallbackTo, component, render, ...rest }: AllProps) => {
  const isAuthenticated = useSelector(authSelectors.selectIsAuthenticated);
  const C = component as React.ComponentType;

  function renderFunc(props: RouteComponentProps): ReactNode {
    if (isAuthenticated) {
      return <Redirect to={fallbackTo} />;
    }
    if (render) {
      return render(props);
    }
    return <C />;
  }

  return <Route {...rest} render={renderFunc} />;
};

export default UnauthenticatedRoute;
