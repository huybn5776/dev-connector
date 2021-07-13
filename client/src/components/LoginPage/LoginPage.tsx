import React from 'react';

import { isEmpty } from '@core/utils/util';
import { yupResolver } from '@hookform/resolvers/yup';
import { AxiosResponse } from 'axios';
import clsx from 'clsx';
import { useForm } from 'react-hook-form';
import { connect, useDispatch, useSelector } from 'react-redux';
import { Redirect } from 'react-router-dom';
import * as yup from 'yup';

import { useHandleFormError } from '@/hooks/use-handle-form-error';
import { authActions } from '@actions';
import FormInput from '@components/form/FormInput/FormInput';
import HttpException from '@exceptions/http-exception';
import { authSelectors } from '@selectors';
import { StateToPropsFunc } from '@store';

import buttonStyles from '@styles/button.module.scss';
import formStyles from '@styles/form.module.scss';

interface LoginForm {
  username: string;
  password: string;
}

const schema = yup.object().shape({
  username: yup.string().required().label('Username').max(100),
  password: yup.string().required().label('Password').min(6).max(24),
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
    dispatch(authActions.login.request({ username: formData.username, password: formData.password }));
  }

  return (
    <div className={formStyles.formPage}>
      <div className={formStyles.formContainer}>
        <h1 className={formStyles.formTitle}>Login</h1>

        <form className={formStyles.form} onSubmit={handleSubmit(onSubmit)}>
          <FormInput name="username" placeholder="Username or Email" register={register} errors={errors} />
          <FormInput name="password" register={register} errors={errors} />

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
