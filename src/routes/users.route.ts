import { Router } from 'express';

import UsersController from '@controllers/users.controller';
import { CreateUserDto } from '@dtos/users.dto';
import Route from '@interfaces/routes';
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
    this.router.get(`${this.path}/:id`, asyncHandler(this.usersController.getUserById));
    this.router.post(`${this.path}`, validationMiddleware(CreateUserDto, 'body'), asyncHandler(this.usersController.createUser));
    this.router.put(
      `${this.path}/:id`,
      validationMiddleware(CreateUserDto, 'body', { skipMissingProperties: true }),
      this.usersController.updateUser,
    );
    this.router.delete(`${this.path}/:id`, this.usersController.deleteUser);
  }
}

export default UsersRoute;
