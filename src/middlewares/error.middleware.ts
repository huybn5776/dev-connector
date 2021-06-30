import { NextFunction, Request, Response, RequestHandler } from 'express';

import { Error as MongooseErrors } from 'mongoose';

import { AuthException } from '@exceptions/auth-exception';
import HttpException from '@exceptions/http-exception';
import { logger } from '@utils/logger';
import { isEmpty } from '@utils/util';

export const asyncHandler =
  (fn: RequestHandler) =>
  (req: Request, res: Response, next: NextFunction): Promise<void> => {
    return Promise.resolve(fn(req, res, next)).catch((error) => next(error));
  };

const errorMiddleware = (error: Error, req: Request, res: Response, next: NextFunction): void => {
  try {
    switch (error.constructor) {
      case HttpException:
        handleHttpException(error as HttpException, req, res);
        break;
      case AuthException:
        handleAuthException(error as AuthException, req, res);
        break;
      case MongooseErrors.CastError:
        handleCastError(error as MongooseErrors.CastError, req, res);
        break;
      default:
        logger.error(error);
        res.status(500).send();
        break;
    }
  } catch (e) {
    next(e);
  }
};

function handleHttpException(error: HttpException, req: Request, res: Response): void {
  const status = error.status || 500;
  const { message } = error;

  res.status(status);

  const response = { message, errors: error.errors, validationErrors: error.validationErrors };
  logger.error(`[${req.method}] ${req.path} >> StatusCode:: ${status}, Message:: ${message}`);

  const isResponseEmpty = Object.values(response).every((value) => isEmpty(value));
  if (isResponseEmpty) {
    res.send();
  } else {
    res.json(response);
  }
}

function handleAuthException(error: AuthException, req: Request, res: Response): void {
  res.status(error.getStatus()).json(error);
}

function handleCastError(error: MongooseErrors.CastError, req: Request, res: Response): boolean {
  res.status(400).json({ message: `Invalid ${error.kind}: '${error.value}'` });
  return true;
}

export default errorMiddleware;
