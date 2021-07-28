import { FieldErrors, FieldValues } from 'react-hook-form';
import { UseFormRegister } from 'react-hook-form/dist/types/form';
import { FieldPath } from 'react-hook-form/dist/types/utils';

export interface FormField<T extends FieldValues> {
  register: UseFormRegister<T>;
  name: FieldPath<T>;
  errors: FieldErrors<T>;
  required?: boolean;
}
