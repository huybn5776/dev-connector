import React from 'react';

import clsx from 'clsx';
import { FieldValues, FieldError } from 'react-hook-form';

import { FormField } from '@/interfaces/form-field';

import formStyles from '@styles/form.module.scss';

interface Props {
  options: string[] | SelectOption[];
}

interface SelectOption {
  value: string;
  label?: string;
}

type AllProps<T> = Props & FormField<T> & React.SelectHTMLAttributes<HTMLSelectElement>;

const FormSelect = <T extends FieldValues>({
  options,
  register,
  name,
  placeholder,
  errors,
  ...rest
}: AllProps<T>): ReturnType<React.FC> => {
  return (
    <>
      <select className={clsx('ui', 'dropdown', formStyles.formField, formStyles.formDropdown)} {...register(name)} {...rest}>
        <option disabled hidden value="">
          {placeholder}
        </option>
        {options.map((option) => {
          const value = typeof option === 'string' ? option : option.value;
          const label = (option as SelectOption).label ?? value;
          return (
            <option value={value} key={value}>
              {label}
            </option>
          );
        })}
      </select>
      {errors[name] && <p className={formStyles.formError}>{(errors[name] as FieldError).message}</p>}
    </>
  );
};

export default FormSelect;
