import { Response } from 'express';

import {
  JsonController,
  Get,
  Param,
  CurrentUser,
  Authorized,
  Post,
  Body,
  Patch,
  HttpCode,
  Delete,
  Res,
  OnUndefined,
} from 'routing-controllers';

import { RequestUser } from '@/interfaces/request-user';
import { CreateUserDto } from '@dtos/create-user.dto';
import { PatchUserDto } from '@dtos/patch-user.dto';
import { UserDto } from '@dtos/user.dto';
import { User } from '@entities/user';
import { AuthToken } from '@interfaces/auth-token';
import { mapper } from '@mappers';
import AuthService from '@services/auth.service';
import ProfileService from '@services/profile.service';
import UserService from '@services/users.service';

@JsonController('/users')
class UsersController {
  readonly authService = new AuthService();
  readonly userService = new UserService();
  readonly profileService = new ProfileService();

  @Get()
  async getUsers(): Promise<UserDto[]> {
    const users = await this.userService.findAllUser();
    return mapper.mapArray(users, UserDto, User);
  }

  @Get('/me')
  @Authorized()
  async getCurrentUser(@CurrentUser() currentUser: RequestUser): Promise<UserDto> {
    const user = await currentUser.current();
    return mapper.map(user.toObject() as User, UserDto, User);
  }

  @Get('/:id')
  async getUserById(@Param('id') id: string): Promise<UserDto> {
    const user = await this.userService.findUserById(id);
    return mapper.map(user, UserDto, User);
  }

  @Post()
  @HttpCode(201)
  async createUser(@Body() userData: CreateUserDto, @Res() res: Response): Promise<AuthToken> {
    const user = await this.userService.createUser(userData);
    const token = this.authService.createToken(user);
    res.setHeader('Set-Cookie', [this.authService.getAuthCookie(token)]);
    return token;
  }

  @Patch('/me')
  @Authorized()
  async patchCurrentUser(@CurrentUser() currentUser: RequestUser, @Body() userData: PatchUserDto): Promise<UserDto> {
    const userId: string = currentUser.claims().id;
    const updatedUser = await this.userService.patchUser(userId, userData);
    return mapper.map(updatedUser, UserDto, User);
  }

  @Delete('/me')
  @Authorized()
  @OnUndefined(204)
  async deleteUser(@CurrentUser() currentUser: RequestUser, @Res() res: Response): Promise<void> {
    const userId: string = currentUser.claims().id;
    await this.userService.deleteUser(userId);
    await this.profileService.deleteProfileOfUser(userId);
    res.setHeader('Set-Cookie', [this.authService.getRemoveAuthCookie()]);
  }
}

export default UsersController;
