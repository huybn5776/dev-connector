import bcrypt from 'bcrypt';
import config from 'config';
import jwt from 'jsonwebtoken';

import { AuthRequest } from '@dtos/auth-request';
import { AuthException, AuthErrorType } from '@exceptions/auth-exception';
import { AuthToken } from '@interfaces/auth-token';
import { DataStoredInToken } from '@interfaces/auth.interface';
import { UserDocument, UserModel } from '@models/user.model';

class AuthService {
  users = UserModel;

  public async login(authRequest: AuthRequest): Promise<AuthToken> {
    if (authRequest.grant_type !== 'password') {
      throw new AuthException(AuthErrorType.UnsupportedGrantType);
    }
    if (!authRequest.username || !authRequest.password) {
      throw new AuthException(AuthErrorType.InvalidRequest, 'Password grant require either username and password');
    }

    const user = await this.users.findOne({ $or: [{ name: authRequest.username }, { email: authRequest.username }] });
    const isPasswordMatching = user?.password && (await bcrypt.compare(authRequest.password, user.password)) || false;
    if (!user || !isPasswordMatching) {
      throw new AuthException(AuthErrorType.InvalidGrant, 'The username or password is incorrect');
    }

    return this.createToken(user);
  }

  public createToken(user: UserDocument): AuthToken {
    const dataStoredInToken: DataStoredInToken = { _id: user._id };
    const secret: string = config.get('jwtSecretKey');
    const expiresIn = 24 * 60 * 60;
    const token = jwt.sign(dataStoredInToken, secret, { expiresIn });

    return {
      access_token: token,
      token_type: 'Bearer',
      expires_in: expiresIn,
      expires: new Date().getTime() + expiresIn * 1000,
      user,
    };
  }

  public getAuthCookie(token: AuthToken): string {
    return `Authorization=${token.access_token}; HttpOnly; Max-Age=${token.expires_in}; Path=/`;
  }

  public getRemoveAuthCookie(): string {
    return 'Authorization=; HttpOnly; Max-age=0; Path=/';
  }
}

export default AuthService;
