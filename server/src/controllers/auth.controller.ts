import { Response } from 'express';

import { JsonController, Authorized, Post, Body, Res } from 'routing-controllers';

import { AuthRequest } from '@dtos/auth-request';
import { AuthToken } from '@interfaces/auth-token';
import AuthService from '@services/auth.service';

@JsonController('/oauth')
class AuthController {
  readonly authService = new AuthService();

  @Post('/token')
  async logIn(@Body() authRequest: AuthRequest, @Res() res: Response): Promise<AuthToken> {
    const token = await this.authService.login(authRequest);
    res.setHeader('Set-Cookie', [this.authService.getAuthCookie(token)]);
    return token;
  }

  @Post('/revoke')
  @Authorized()
  async logOut(@Res() res: Response): Promise<void> {
    res.setHeader('Set-Cookie', [this.authService.getRemoveAuthCookie()]);
    res.status(200).send();
  }
}

export default AuthController;
