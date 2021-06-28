import { NextFunction, Request, Response, RequestHandler } from 'express';

import HttpException from '@exceptions/http-exception';
import { logger } from '@utils/logger';

export const asyncHandler =
  (fn: RequestHandler) =>
  (req: Request, res: Response, next: NextFunction): Promise<void> => {
    return Promise.resolve(fn(req, res, next)).catch((error) => next(error));
  };

const errorMiddleware = (error: HttpException, req: Request, res: Response, next: NextFunction): void => {
  try {
    const status: number = error.status || 500;
    const message: string = error.message || 'Something went wrong';

    const jsonError = { message, errors: error.errors, validationErrors: error.validationErrors };
    logger.error(`[${req.method}] ${req.path} >> StatusCode:: ${status}, Message:: ${message}`);
    res.status(status).json(jsonError);
  } catch (e) {
    next(e);
  }
};

export default errorMiddleware;
