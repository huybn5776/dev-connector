import React from 'react';

import { isEmpty } from '@core/utils/util';
import { yupResolver } from '@hookform/resolvers/yup';
import { AxiosResponse } from 'axios';
import clsx from 'clsx';
import { useForm } from 'react-hook-form';
import { connect, useDispatch, useSelector } from 'react-redux';
import { Redirect } from 'react-router-dom';
import * as yup from 'yup';

import { authActions } from '@actions';
import HttpException from '@exceptions/http-exception';
import { authSelectors } from '@selectors';
import { StateToPropsFunc } from '@store';

import { useHandleFormError } from '../../hooks/use-handle-form-error';
import styles from './LoginPage.module.scss';
import buttonStyles from '@styles/button.module.scss';
import formStyles from '@styles/form.module.scss';

interface LoginForm {
  email: string;
  password: string;
}

const schema = yup.object().shape({
  email: yup.string().required().label('Email').max(100, 'Email is too long').email(),
  password: yup.string().required().label('Password').min(6).max(24).required(),
});

interface PropsFromState {
  errorResponse?: AxiosResponse<HttpException>;
  loading: boolean;
}

type AllProps = PropsFromState;

const LoginPage: React.FC<AllProps> = ({ errorResponse, loading }: AllProps) => {
  const {
    register,
    handleSubmit,
    formState,
    setError,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: yupResolver(schema),
  });

  const [formErrorMessage, setFormErrorMessage] = useHandleFormError(setError, errorResponse);
  const dispatch = useDispatch();

  const isAuthenticated = useSelector(authSelectors.selectIsAuthenticated);

  if (isAuthenticated) {
    const nextUrl = new URLSearchParams(window.location.search).get('redirect') || '/dashboard';
    return <Redirect to={nextUrl} />;
  }

  function onSubmit(formData: LoginForm): void {
    if (!isEmpty(formState.errors)) {
      return;
    }
    setFormErrorMessage('');
    dispatch(authActions.login.request({ email: formData.email, password: formData.password }));
  }

  return (
    <div className={styles.LoginPage}>
      <div className={formStyles.formContainer}>
        <h1 className={formStyles.formTitle}>Login</h1>

        <form className={formStyles.form} onSubmit={handleSubmit(onSubmit)}>
          <input className={formStyles.formInput} type="email" placeholder="Email address" {...register('email')} />
          {errors.email && <p className={formStyles.formError}>{errors.email.message}</p>}
          <p className={formStyles.formFieldAnnotation}>
            This site uses Gravatar so if you want a profile image, use a Gravatar email
          </p>

          <input className={formStyles.formInput} type="password" placeholder="Password" {...register('password')} />
          {errors.password && <p className={formStyles.formError}>{errors.password.message}</p>}

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
            Login
          </button>
          {formErrorMessage && <p className={formStyles.formError}>{formErrorMessage}</p>}
        </form>
      </div>
    </div>
  );
};

const mapStateToProps: StateToPropsFunc<PropsFromState> = ({ auth }) => ({
  errorResponse: auth.errorResponse,
  loading: auth.loading,
});

export default connect(mapStateToProps)(LoginPage);
