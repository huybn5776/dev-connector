import * as authApi from './api/auth-api';
import * as userApi from './api/user-api';

export interface Services {
  api: {
    authApi: typeof authApi;
    userApi: typeof userApi;
  };
}

const services: Services = {
  api: {
    authApi,
    userApi,
  },
};

export default services;
