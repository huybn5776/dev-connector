/* eslint-disable import/first */
process.env.NODE_CONFIG_DIR = `${__dirname}/configs`;

import 'dotenv/config';

import App from '@/app';
import validateEnv from '@/utils/validateEnv';
import AuthRoute from '@routes/auth.route';
import IndexRoute from '@routes/index.route';
import PostsRoute from '@routes/post.router';
import ProfileRoute from '@routes/profile.route';
import UsersRoute from '@routes/users.route';

validateEnv();

const app = new App([new IndexRoute(), new AuthRoute(), new UsersRoute(), new ProfileRoute(), new PostsRoute()]);

app.listen();

export default app;
