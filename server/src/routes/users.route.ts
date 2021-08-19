import { Router } from 'express';

import Route from '@/interfaces/routes';
import UsersController from '@controllers/users.controller';
import { CreateUserDto } from '@dtos/create-user.dto';
import { PatchUserDto } from '@dtos/patch-user.dto';
import authMiddleware from '@middlewares/auth.middleware';
import { asyncHandler } from '@middlewares/error.middleware';
import validationMiddleware from '@middlewares/validation.middleware';

class UsersRoute implements Route {
  public path = '/users';
  public router = Router();
  public usersController = new UsersController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(`${this.path}`, asyncHandler(this.usersController.getUsers));
    this.router.get(`${this.path}/me`, authMiddleware, asyncHandler(this.usersController.getCurrentUser));
    this.router.get(`${this.path}/:id`, asyncHandler(this.usersController.getUserById));
    this.router.post(
      `${this.path}`,
      validationMiddleware(CreateUserDto, 'body'),
      asyncHandler(this.usersController.createUser),
    );
    this.router.patch(
      `${this.path}/:me`,
      validationMiddleware(PatchUserDto, 'body', { skipMissingProperties: true }),
      authMiddleware,
      asyncHandler(this.usersController.patchCurrentUser),
    );
    this.router.delete(`${this.path}/:id`, asyncHandler(this.usersController.deleteUser));
  }
}

export default UsersRoute;
