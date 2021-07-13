import React from 'react';

import { isEmpty } from '@core/utils/util';
import { yupResolver } from '@hookform/resolvers/yup';
import { AxiosResponse } from 'axios';
import clsx from 'clsx';
import { useForm } from 'react-hook-form';
import { connect, useDispatch } from 'react-redux';
import * as yup from 'yup';

import { useHandleFormError } from '@/hooks/use-handle-form-error';
import { userActions } from '@actions';
import FormInput from '@components/form/FormInput/FormInput';
import { CreateUserDto } from '@dtos/create-user.dto';
import HttpException from '@exceptions/http-exception';
import { StateToPropsFunc } from '@store';

import buttonStyles from '@styles/button.module.scss';
import formStyles from '@styles/form.module.scss';

interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const schema = yup.object().shape({
  name: yup.string().label('Name').required().max(100),
  email: yup.string().required().label('Email').max(100, 'Email is too long').email(),
  password: yup.string().required().label('Password').min(6).max(24).required(),
  confirmPassword: yup
    .string()
    .label('Confirm password')
    .required()
    .oneOf([yup.ref('password'), null], 'Passwords did not match'),
});

interface PropsFromState {
  errorResponse?: AxiosResponse<HttpException>;
  loading: boolean;
}

type AllProps = PropsFromState;

const RegisterPage: React.FC<AllProps> = ({ errorResponse, loading }: AllProps) => {
  const {
    register,
    handleSubmit,
    formState,
    setError,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: yupResolver(schema),
  });

  const [formErrorMessage, setFormErrorMessage] = useHandleFormError(setError, errorResponse);
  const dispatch = useDispatch();

  function onSubmit(formData: RegisterForm): void {
    if (!isEmpty(formState.errors)) {
      return;
    }
    setFormErrorMessage('');
    const userData: CreateUserDto = { name: formData.name, email: formData.email, password: formData.password };
    dispatch(userActions.createUser.request(userData));
  }

  return (
    <div className={formStyles.formPage}>
      <div className={formStyles.formContainer}>
        <h1 className={formStyles.formTitle}>Sign up</h1>

        <form className={formStyles.form} onSubmit={handleSubmit(onSubmit)}>
          <FormInput name="name" register={register} errors={errors} />
          <FormInput name="email" placeholder="Email address" type="email" register={register} errors={errors} />
          <p className={formStyles.formFieldAnnotation}>
            This site uses Gravatar so if you want a profile image, use a Gravatar email
          </p>

          <FormInput name="password" type="password" register={register} errors={errors} />
          <FormInput
            name="confirmPassword"
            type="password"
            placeholder="Confirm password"
            register={register}
            errors={errors}
          />

          <button
            className={clsx(
              'ui',
              'button',
              loading ? 'loading' : '',
              buttonStyles.primaryButton,
              formStyles.formSubmitButton,
            )}
            type="submit"
            disabled={loading}
          >
            Register
          </button>
          {formErrorMessage && <p className={formStyles.formError}>{formErrorMessage}</p>}
        </form>
      </div>
    </div>
  );
};

const mapStateToProps: StateToPropsFunc<PropsFromState> = ({ user }) => ({
  errorResponse: user.errorResponse,
  loading: user.loading,
});

export default connect(mapStateToProps)(RegisterPage);
