import { Request, Response } from 'express';

import { CreateUserDto } from '@dtos/users.dto';
import AuthService from '@services/auth.service';

class AuthController {
  readonly authService = new AuthService();

  public signUp = async (req: Request, res: Response): Promise<void> => {
    const userData: CreateUserDto = req.body;
    const signUpUserData = await this.authService.signup(userData);

    res.status(201).json({ data: signUpUserData, message: 'signup' });
  };

  public logIn = async (req: Request, res: Response): Promise<void> => {
    const userData: CreateUserDto = req.body;
    const { cookie, findUser } = await this.authService.login(userData);

    res.setHeader('Set-Cookie', [cookie]);
    res.status(200).json({ data: findUser, message: 'login' });
  };

  public logOut = async (req: Request, res: Response): Promise<void> => {
    const userData = req.user.current();
    const logOutUserData = await this.authService.logout(userData);

    res.setHeader('Set-Cookie', ['Authorization=; Max-age=0']);
    res.status(200).json({ data: logOutUserData, message: 'logout' });
  };
}

export default AuthController;
