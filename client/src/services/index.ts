import * as authApi from './api/auth-api';
import * as postApi from './api/post-api';
import * as profileApi from './api/profile-api';
import * as userApi from './api/user-api';

export interface Services {
  api: {
    authApi: typeof authApi;
    postApi: typeof postApi;
    profileApi: typeof profileApi;
    userApi: typeof userApi;
  };
}

const services: Services = {
  api: {
    authApi,
    postApi,
    profileApi,
    userApi,
  },
};

export default services;
