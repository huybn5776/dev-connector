import { useEffect, useState } from 'react';

import { AxiosResponse } from 'axios';
import { Path } from 'react-hook-form';
import { UseFormSetError } from 'react-hook-form/dist/types/form';

import { AuthException, HttpException } from '@exceptions';

export function useHandleFormError<T>(
  setError: UseFormSetError<T>,
  errorResponse: AxiosResponse<HttpException | AuthException> | undefined,
): [string, (value: string) => void] {
  const [formErrorMessage, setFormErrorMessage] = useState('');

  useEffect(() => {
    const error = errorResponse?.data;
    setFormErrorMessage(error?.message || (error as AuthException)?.error_description || '');

    const validationErrors = (error as HttpException)?.validationErrors;
    Object.entries(validationErrors || {}).forEach(([field, message]) =>
      setError(field as Path<T>, { type: 'api', message }),
    );
  }, [setError, errorResponse]);

  return [formErrorMessage, setFormErrorMessage];
}
