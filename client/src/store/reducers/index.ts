import { combineReducers } from 'redux';

import authReducer from './auth-reducer';
import userReducer from './user-reducer';

export const rootReducer = combineReducers({
  auth: authReducer,
  user: userReducer,
});

export default rootReducer;
