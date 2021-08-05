import { applyMiddleware, compose, createStore } from 'redux';
import { createEpicMiddleware } from 'redux-observable';
import { ActionType, RootAction, RootState, Services, StateType } from 'typesafe-actions';

import services from '../services';
import { rootReducer } from './reducers';
import { AuthState } from './reducers/auth-reducer';
import { PostState } from './reducers/post-reducer';
import { ProfileState } from './reducers/profile-reducer';
import { UserState } from './reducers/user-reducer';
import rootEpic from './root-epic';

export interface ApplicationState {
  auth: AuthState;
  post: PostState,
  profile: ProfileState,
  user: UserState;
}

declare module 'typesafe-actions' {
  export type Store = StateType<typeof import('./index').default>;
  export type RootState = StateType<typeof import('./reducers').default>;
  export type RootAction = ActionType<typeof import('./actions').default>;
  export type Services = typeof import('../services/index').default;

  interface Types {
    RootAction: ActionType<typeof import('./actions').default>;
  }
}

export type StateToPropsFunc<PropsFromState, OtherProps = unknown> = (
  state: ApplicationState,
  props: OtherProps,
) => PropsFromState;

export const epicMiddleware = createEpicMiddleware<RootAction, RootAction, RootState, Services>({
  dependencies: services,
});

const middlewares = [epicMiddleware];

export const composeEnhancers =
  // eslint-disable-next-line
  (process.env.NODE_ENV === 'development' && (window as any)?.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) || compose;
const enhancer = composeEnhancers(applyMiddleware(...middlewares));

const store = createStore(rootReducer, {}, enhancer);
epicMiddleware.run(rootEpic);
export default store;
