import { NextFunction, Request, Response } from 'express';

import config from 'config';
import jwt from 'jsonwebtoken';

import HttpException from '@exceptions/http-exception';
import { DataStoredInToken } from '@interfaces/auth.interface';
import userModel, { UserDocument } from '@models/users.model';

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
      const secretKey: string = config.get('secretKey');
      const verificationResponse = (await jwt.verify(Authorization, secretKey)) as DataStoredInToken;
      const userId = verificationResponse._id;
      const findUser = await userModel.findById(userId);

      if (findUser) {
        req.user = { current: () => findUser };
        next();
      } else {
        next(new HttpException(401, 'Wrong authentication token'));
      }
    } else {
      next(new HttpException(404, 'Authentication token missing'));
    }
  } catch (error) {
    next(new HttpException(401, 'Wrong authentication token'));
  }
};

export const globalAuthMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  req.user = {
    current() {
      throw new Error('Unauthorized');
    },
  };
  next();
};

export default authMiddleware;
