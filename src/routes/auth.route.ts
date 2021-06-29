import express, { Router } from 'express';

import AuthController from '@controllers/auth.controller';
import Route from '@interfaces/routes';
import authMiddleware from '@middlewares/auth.middleware';
import { asyncHandler } from '@middlewares/error.middleware';

class AuthRoute implements Route {
  public path = '/oauth';
  public router = Router();
  public authController = new AuthController();

  constructor() {
    this.initializeRoutes();
    this.router.use(express.urlencoded({ extended: true }));
  }

  private initializeRoutes(): void {
    this.router.post(`${this.path}/token`, asyncHandler(this.authController.logIn));
    this.router.post(`${this.path}/revoke`, authMiddleware, asyncHandler(this.authController.logOut));
  }
}

export default AuthRoute;
