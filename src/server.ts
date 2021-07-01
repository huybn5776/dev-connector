/* eslint-disable import/first */
process.env.NODE_CONFIG_DIR = `${__dirname}/configs`;

import 'dotenv/config';
import App from '@/app';
import AuthRoute from '@routes/auth.route';
import IndexRoute from '@routes/index.route';
import ProfileRoute from '@routes/profile.route';
import UsersRoute from '@routes/users.route';
import validateEnv from '@utils/validateEnv';

validateEnv();

const app = new App([new IndexRoute(), new AuthRoute(), new UsersRoute(), new ProfileRoute()]);

app.listen();
