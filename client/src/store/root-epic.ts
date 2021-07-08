import { combineEpics } from 'redux-observable';

import * as authEpic from './epics/auth-epic';
import * as userEpic from './epics/user-epic';

export default combineEpics(...Object.values(authEpic), ...Object.values(userEpic));
