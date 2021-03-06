import { combineEpics } from 'redux-observable';

import * as authEpic from './epics/auth-epic';
import * as postEpic from './epics/post-epic';
import * as profileEpic from './epics/profile-epic';
import * as userEpic from './epics/user-epic';

export default combineEpics(
  ...Object.values(authEpic),
  ...Object.values(postEpic),
  ...Object.values(profileEpic),
  ...Object.values(userEpic),
);
