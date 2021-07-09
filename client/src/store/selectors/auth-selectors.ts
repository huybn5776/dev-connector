import { createSelector } from 'reselect';

import { ApplicationState } from '@store';

export const selectIsAuthenticated = createSelector(
  (state: ApplicationState) => state.auth.tokenExpires,
  (tokenExpires) => tokenExpires > new Date().getTime(),
);
