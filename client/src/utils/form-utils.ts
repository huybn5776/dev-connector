import { AxiosResponse } from 'axios';
import { Path } from 'react-hook-form';
import { UseFormSetError } from 'react-hook-form/dist/types/form';
import { EMPTY, OperatorFunction } from 'rxjs';
import { catchError } from 'rxjs/operators';

import HttpException from '../../../server/src/exceptions/http-exception';

export function catchFormError<T>(
  setFormErrorMessage: (errorMessage: string) => void,
  setError: UseFormSetError<T>,
): OperatorFunction<unknown, unknown> {
  return catchError((error: AxiosResponse<HttpException>) => {
    setFormErrorMessage(error.data.message);
    Object.entries(error.data.validationErrors || {}).forEach(([field, message]) =>
      setError(field as Path<T>, { type: 'api', message }),
    );
    return EMPTY;
  });
}
