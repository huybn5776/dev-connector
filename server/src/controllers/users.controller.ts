import { Request, Response } from 'express';

import { CreateUserDto } from '@dtos/create-user.dto';
import { PatchUserDto } from '@dtos/patch-user.dto';
import { UserDto } from '@dtos/user.dto';
import { User } from '@entities/user';
import { mapper } from '@mappers';
import AuthService from '@services/auth.service';
import ProfileService from '@services/profile.service';
import UserService from '@services/users.service';

class UsersController {
  readonly authService = new AuthService();
  readonly userService = new UserService();
  readonly profileService = new ProfileService();

  public getUsers = async (req: Request, res: Response): Promise<void> => {
    const users = await this.userService.findAllUser();
    const userDtoList = mapper.mapArray(users, UserDto, User);
    res.status(200).json(userDtoList);
  };

  public getCurrentUser = async (req: Request, res: Response): Promise<void> => {
    const currentUserDocument = await req.user.current();
    const userDto = mapper.map(currentUserDocument.toObject() as User, UserDto, User);
    res.status(200).json(userDto);
  };

  public getUserById = async (req: Request, res: Response): Promise<void> => {
    const userId: string = req.params.id;
    const user = await this.userService.findUserById(userId);
    const userDto = mapper.map(user, UserDto, User);
    res.status(200).json(userDto);
  };

  public createUser = async (req: Request, res: Response): Promise<void> => {
    const userData: CreateUserDto = req.body;
    const user = await this.userService.createUser(userData);
    const token = this.authService.createToken(user);

    res.setHeader('Set-Cookie', [this.authService.getAuthCookie(token)]);
    res.status(201).json(token);
  };

  public patchCurrentUser = async (req: Request, res: Response): Promise<void> => {
    const userId: string = req.user.claims().id;
    const userData: PatchUserDto = req.body;
    const updatedUser = await this.userService.patchUser(userId, userData);
    const userDto = mapper.map(updatedUser, UserDto, User);

    res.status(200).json(userDto);
  };

  public deleteUser = async (req: Request, res: Response): Promise<void> => {
    const userId: string = req.params.id;
    await this.userService.deleteUser(userId);
    await this.profileService.deleteProfileOfUser(userId);

    res.status(204).send();
  };
}

export default UsersController;
