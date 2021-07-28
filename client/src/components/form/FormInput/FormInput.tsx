import React from 'react';

import { capitalize } from '@core/utils/string-utils';
import { FieldValues, FieldError } from 'react-hook-form';

import { FormField } from '@/interfaces/form-field';

import formStyles from '@styles/form.module.scss';

type AllProps<T> = FormField<T> & React.InputHTMLAttributes<HTMLInputElement>;

const FormInput = <T extends FieldValues>({
  register,
  name,
  errors,
  placeholder,
  required,
  ...rest
}: AllProps<T>): ReturnType<React.FC> => {
  return (
    <>
      <input
        className={formStyles.formInput}
        placeholder={(placeholder ?? capitalize(name)) + (required && '*' || '')}
        {...rest}
        {...register(name)}
      />
      {errors[name] && <p className={formStyles.formError}>{(errors[name] as FieldError).message}</p>}
    </>
  );
};

export default FormInput;
