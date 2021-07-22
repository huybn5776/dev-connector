import { RequestHandler } from 'express';

import { ClassConstructor, plainToClass } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { ValidatorOptions } from 'class-validator/types/validation/ValidatorOptions';

import HttpException from '@exceptions/http-exception';

const validationMiddleware = <T, V extends 'body' | 'query' | 'params' = 'body'>(
  type: ClassConstructor<T>,
  value: V,
  options?: ValidatorOptions,
): RequestHandler => {
  return (req, res, next) => {
    const classInstance = plainToClass<T, V>(type, req[value]);

    validate(classInstance, { ...{ validationError: { target: false } }, ...options }).then(
      (errors: ValidationError[]) => {
        if (errors.length > 0) {
          const validationErrors: Record<string, string> = {};
          errors.forEach((error) => {
            const [firstError] = Object.values(error.constraints || {});
            validationErrors[error.property] = firstError;
          });
          const exception = new HttpException(400, 'Validation fail');
          exception.validationErrors = validationErrors;
          next(exception);
        } else {
          next();
          req.body = classInstance;
        }
      },
    );
  };
};

export default validationMiddleware;
