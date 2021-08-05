import { combineReducers } from 'redux';

import authReducer from './auth-reducer';
import postReducer from './post-reducer';
import profileReducer from './profile-reducer';
import userReducer from './user-reducer';

export const rootReducer = combineReducers({
  auth: authReducer,
  post: postReducer,
  profile: profileReducer,
  user: userReducer,
});

export default rootReducer;
