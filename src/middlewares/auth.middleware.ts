import { NextFunction, Request, Response } from 'express';

import config from 'config';
import jwt, { TokenExpiredError } from 'jsonwebtoken';

import { AuthException, AuthErrorType } from '@exceptions/auth-exception';
import HttpException from '@exceptions/http-exception';
import { DataStoredInToken } from '@interfaces/auth.interface';
import { UserDocument, UserModel } from '@models/user.model';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user: { current: () => UserDocument };
      token: string;
    }
  }
}

const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const Authorization = req.cookies.Authorization || req.header('Authorization')?.split('Bearer ')[1] || null;

    if (Authorization) {
      const secretKey: string = config.get('jwtSecretKey');
      const verificationResponse = (await jwt.verify(Authorization, secretKey)) as DataStoredInToken;
      const userId = verificationResponse._id;
      const user = await UserModel.findById(userId).select('-password');

      if (user) {
        req.user = { current: () => user };
        next();
      } else {
        next(new AuthException(AuthErrorType.InvalidToken));
      }
    } else {
      next(new AuthException(AuthErrorType.InvalidToken, 'No token'));
    }
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      next(new AuthException(AuthErrorType.InvalidToken, 'The access token expired'));
      return;
    }
    next(new AuthException(AuthErrorType.InvalidToken, 'Invalid token'));
  }
};

export const globalAuthMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  req.user = {
    current() {
      throw new HttpException(500, 'Unauthorized');
    },
  };
  next();
};

export default authMiddleware;
