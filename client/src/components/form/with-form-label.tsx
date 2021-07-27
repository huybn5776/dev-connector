import React, { useMemo, ComponentType, ReactElement } from 'react';

import { capitalize } from '@core/utils/string-utils';
import { FieldValues } from 'react-hook-form';

import { FormField } from '@/interfaces/form-field';

import formStyles from '@styles/form.module.scss';

interface Props {
  label?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FieldProps = FormField<any>;
type AllProps<T extends FieldValues, P extends FieldProps> = FormField<T> & Omit<P, keyof FormField<T>> & Props;

export const withFormLabel =
  <P extends FieldProps>(Component: ComponentType<P>) =>
  <T extends FieldValues>({ label, ...rest }: AllProps<T, P>): ReactElement => {
    const elementId = useMemo(() => rest.name + Math.random() * 1000, [rest.name]);
    return (
      <>
        <label className={formStyles.formLabel} htmlFor={elementId}>
          {label || capitalize(rest.name)}
        </label>
        <Component {...(rest as P)} id={elementId} />
      </>
    );
  };
