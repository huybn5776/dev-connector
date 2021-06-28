import { Router } from 'express';

import AuthController from '@controllers/auth.controller';
import { CreateUserDto } from '@dtos/users.dto';
import Route from '@interfaces/routes';
import authMiddleware from '@middlewares/auth.middleware';
import { asyncHandler } from '@middlewares/error.middleware';
import validationMiddleware from '@middlewares/validation.middleware';

class AuthRoute implements Route {
  public path = '/';
  public router = Router();
  public authController = new AuthController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post(
      `${this.path}signup`,
      validationMiddleware(CreateUserDto, 'body'),
      asyncHandler(this.authController.signUp),
    );
    this.router.post(
      `${this.path}login`,
      validationMiddleware(CreateUserDto, 'body'),
      asyncHandler(this.authController.logIn),
    );
    this.router.post(`${this.path}logout`, authMiddleware, asyncHandler(this.authController.logOut));
  }
}

export default AuthRoute;
