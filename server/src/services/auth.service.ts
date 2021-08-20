import bcrypt from 'bcrypt';
import config from 'config';
import jwt from 'jsonwebtoken';

import { AuthRequest } from '@dtos/auth-request';
import { UserDto } from '@dtos/user.dto';
import { User } from '@entities/user';
import { AuthException, AuthErrorType } from '@exceptions/auth-exception';
import { AuthToken } from '@interfaces/auth-token';
import { DataStoredInToken } from '@interfaces/auth.interface';
import { mapper } from '@mappers';
import { UserModel, UserDocument } from '@models/user.model';

class AuthService {
  users = UserModel;

  public async login(authRequest: AuthRequest): Promise<AuthToken> {
    if (authRequest.grant_type !== 'password') {
      throw new AuthException(AuthErrorType.UnsupportedGrantType);
    }
    if (!authRequest.username || !authRequest.password) {
      throw new AuthException(AuthErrorType.InvalidRequest, 'Password grant require either username and password');
    }

    const userDocument: UserDocument | null = await this.users.findOne({ email: authRequest.username });
    const isPasswordMatching =
      (userDocument?.password && (await bcrypt.compare(authRequest.password, userDocument.password))) || false;
    if (!userDocument || !isPasswordMatching) {
      throw new AuthException(AuthErrorType.InvalidGrant, 'The username or password is incorrect');
    }

    return this.createToken(userDocument.toObject());
  }

  public createToken(user: User): AuthToken {
    const dataStoredInToken: DataStoredInToken = { _id: user._id };
    const secret: string = config.get('jwtSecretKey');
    const expiresIn = 24 * 60 * 60;
    const token = jwt.sign(dataStoredInToken, secret, { expiresIn });

    return {
      access_token: token,
      token_type: 'Bearer',
      expires_in: expiresIn,
      expires: new Date().getTime() + expiresIn * 1000,
      user: mapper.map(user, UserDto, User),
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
