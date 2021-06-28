import { Request, Response } from 'express';

import { CreateUserDto } from '@dtos/users.dto';
import { User } from '@interfaces/users';
import UserService from '@services/users.service';

class UsersController {
  readonly userService = new UserService();

  public getUsers = async (req: Request, res: Response): Promise<void> => {
    const findAllUsersData = await this.userService.findAllUser();
    res.status(200).json({ data: findAllUsersData, message: 'findAll' });
  };

  public getUserById = async (req: Request, res: Response): Promise<void> => {
    const userId: string = req.params.id;
    const findOneUserData: User = await this.userService.findUserById(userId);

    res.status(200).json({ data: findOneUserData, message: 'findOne' });
  };

  public createUser = async (req: Request, res: Response): Promise<void> => {
    const userData: CreateUserDto = req.body;
    const createUserData = await this.userService.createUser(userData);
    res.status(201).json({ data: createUserData, message: 'created' });
  };

  public updateUser = async (req: Request, res: Response): Promise<void> => {
    const userId: string = req.params.id;
    const userData: CreateUserDto = req.body;
    const updateUserData = await this.userService.updateUser(userId, userData);

    res.status(200).json({ data: updateUserData, message: 'updated' });
  };

  public deleteUser = async (req: Request, res: Response): Promise<void> => {
    const userId: string = req.params.id;
    const deleteUserData: User = await this.userService.deleteUser(userId);

    res.status(200).json({ data: deleteUserData, message: 'deleted' });
  };
}

export default UsersController;
