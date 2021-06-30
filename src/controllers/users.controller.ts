import { Request, Response } from 'express';

import { CreateUserDto } from '@dtos/create-user.dto';
import AuthService from '@services/auth.service';
import UserService from '@services/users.service';

class UsersController {
  readonly authService = new AuthService();
  readonly userService = new UserService();
  readonly authService = new AuthService();

  public getUsers = async (req: Request, res: Response): Promise<void> => {
    const users = await this.userService.findAllUser();
    res.status(200).json(users);
  };

  public getCurrentUser = async (req: Request, res: Response): Promise<void> => {
    const currentUser = await req.user.current();
    res.status(200).json(currentUser);
  };

  public getUserById = async (req: Request, res: Response): Promise<void> => {
    const userId: string = req.params.id;
    const user = await this.userService.findUserById(userId);

    res.status(200).json(user);
  };

  public createUser = async (req: Request, res: Response): Promise<void> => {
    const userData: CreateUserDto = req.body;
    const user = await this.userService.createUser(userData);
    const token = this.authService.createToken(user);

    res.setHeader('Set-Cookie', [this.authService.getAuthCookie(token)]);
    res.status(201).json({ user, token });
  };

  public updateUser = async (req: Request, res: Response): Promise<void> => {
    const userId: string = req.params.id;
    const userData: CreateUserDto = req.body;
    const updatedUser = await this.userService.updateUser(userId, userData);

    res.status(200).json(updatedUser);
  };

  public deleteUser = async (req: Request, res: Response): Promise<void> => {
    const userId: string = req.params.id;
    const deleteUserData = await this.userService.deleteUser(userId);

    res.status(200).json(deleteUserData);
  };
}

export default UsersController;
