import React from 'react';

import { useSelector } from 'react-redux';
import { RouteProps, Route, Redirect } from 'react-router-dom';

import { authSelectors } from '@selectors';

interface Props {
  fallbackTo: string;
}

type AllProps = Props & RouteProps;

const UnauthenticatedRoute: React.FC<AllProps> = ({ fallbackTo, component, ...rest }: AllProps) => {
  const isAuthenticated = useSelector(authSelectors.selectIsAuthenticated);
  const C = component as React.ComponentType;
  return <Route {...rest} render={() => (isAuthenticated ? <Redirect to={fallbackTo} /> : <C />)} />;
};

export default UnauthenticatedRoute;
