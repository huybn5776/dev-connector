/* eslint-disable import/first */
process.env.NODE_CONFIG_DIR = `${__dirname}/configs`;

import 'dotenv/config';

import App from '@/app';
import validateEnv from '@/utils/validateEnv';
import AuthController from '@controllers/auth.controller';
import PostsController from '@controllers/posts.controller';
import ProfileController from '@controllers/profile.controller';
import UsersController from '@controllers/users.controller';

validateEnv();

const app = new App([AuthController, UsersController, ProfileController, PostsController]);

app.listen();

export default app;
