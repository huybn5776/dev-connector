import { NextFunction, Request, Response } from 'express';

import config from 'config';
import jwt, { TokenExpiredError } from 'jsonwebtoken';
import { Action } from 'routing-controllers';
import { AuthorizationChecker } from 'routing-controllers/types/AuthorizationChecker';

import { RequestUser } from '@/interfaces/request-user';
import { AuthException, AuthErrorType } from '@exceptions/auth-exception';
import { DataStoredInToken } from '@interfaces/auth.interface';
import { UserDocument, UserModel } from '@models/user.model';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user: RequestUser;
      token: string;
    }
  }
}
export const authorizationChecker: AuthorizationChecker = async (action: Action) => {
  const userId = await authMiddleware(action.request, action.response);
  if (!userId) {
    throw new AuthException(AuthErrorType.InvalidToken, 'No token');
  }
  return true;
};

const authMiddleware = async (req: Request, res: Response, next?: NextFunction): Promise<string | null> => {
  try {
    const Authorization = req.cookies.Authorization || req.header('Authorization')?.split('Bearer ')[1] || null;

    if (Authorization) {
      const secretKey: string = config.get('jwtSecretKey');
      const verificationResponse = (await jwt.verify(Authorization, secretKey)) as DataStoredInToken;
      const userId = verificationResponse._id;
      let user: UserDocument | null = null;

      req.user = {
        claims: () => ({
          id: userId,
        }),
        current: async () => {
          user = user ?? (await UserModel.findById(userId).select(['-password', '-__v']));
          if (!user) {
            throw new AuthException(AuthErrorType.InvalidToken, 'The user is not exist');
          }
          return user;
        },
      };
      next?.();
      return userId;
    }
    next?.(new AuthException(AuthErrorType.InvalidToken, 'No token'));
    return null;
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      next?.(new AuthException(AuthErrorType.InvalidToken, 'The access token expired'));
      return null;
    }
    next?.(new AuthException(AuthErrorType.InvalidToken, 'Invalid token'));
  }
  return null;
};

export default authMiddleware;
