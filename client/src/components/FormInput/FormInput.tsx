import React from 'react';

import { capitalize } from '@core/utils/string-utils';
import { FieldValues, FieldErrors, FieldError } from 'react-hook-form';
import { UseFormRegister } from 'react-hook-form/dist/types/form';
import { FieldPath } from 'react-hook-form/dist/types/utils';

import formStyles from '@styles/form.module.scss';

interface Props<T> {
  register: UseFormRegister<T>;
  name: FieldPath<T>;
  errors: FieldErrors<T>;
}

type AllProps<T> = Props<T> & React.InputHTMLAttributes<HTMLInputElement>;

const FormInput = <T extends FieldValues>({
  register,
  name,
  errors,
  placeholder,
  ...rest
}: AllProps<T>): ReturnType<React.FC> => {
  return (
    <>
      <input
        className={formStyles.formInput}
        placeholder={placeholder ?? capitalize(name)}
        {...rest}
        {...register(name)}
      />
      {errors[name] && <p className={formStyles.formError}>{(errors[name] as FieldError).message}</p>}
    </>
  );
};

export default FormInput;
