import { Request, Response } from 'express';

import { AuthRequest } from '@dtos/auth-request';
import AuthService from '@services/auth.service';

class AuthController {
  readonly authService = new AuthService();

  public logIn = async (req: Request, res: Response): Promise<void> => {
    const authRequest: AuthRequest = req.body;
    const token = await this.authService.login(authRequest);

    res.setHeader('Set-Cookie', [this.authService.getAuthCookie(token)]);
    res.status(200).json(token);
  };

  public logOut = async (req: Request, res: Response): Promise<void> => {
    res.setHeader('Set-Cookie', [this.authService.getRemoveAuthCookie()]);
    res.status(200).send();
  };
}

export default AuthController;
