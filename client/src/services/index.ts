import * as authApi from './api/auth-api';
import * as profileApi from './api/profile-api';
import * as userApi from './api/user-api';

export interface Services {
  api: {
    authApi: typeof authApi;
    profileApi: typeof profileApi;
    userApi: typeof userApi;
  };
}

const services: Services = {
  api: {
    authApi,
    profileApi,
    userApi,
  },
};

export default services;
