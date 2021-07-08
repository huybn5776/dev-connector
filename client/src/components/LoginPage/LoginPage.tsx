import React, { useState } from 'react';

import { isEmpty } from '@core/utils/util';
import { yupResolver } from '@hookform/resolvers/yup';
import clsx from 'clsx';
import { useForm } from 'react-hook-form';
import { useHistory } from 'react-router-dom';
import { takeUntil } from 'rxjs/operators';
import * as yup from 'yup';

import { AuthApiService } from '@services/api/auth-api.service';
import { catchFormError } from '@utils/form-utils';

import { useOnDestroy } from '../../hooks/use-on-destroy';
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

const authApiService = new AuthApiService();

const LoginPage: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState,
    setError,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: yupResolver(schema),
    defaultValues: {
      email: 'Fooooo@abc.def',
      password: 'abcdef',
    },
  });

  const destroy$ = useOnDestroy();
  const history = useHistory();
  const [formErrorMessage, setFormErrorMessage] = useState('');

  function onSubmit(formData:LoginForm): void {
    if (!isEmpty(formState.errors)) {
      return;
    }
    setFormErrorMessage('');
    authApiService
      .login(formData.email, formData.password)
      .pipe(takeUntil(destroy$), catchFormError(setFormErrorMessage, setError))
      .subscribe((token) => {
        history.push('/');
      });
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
            className={clsx('ui', 'button', buttonStyles.primaryButton, formStyles.formSubmitButton)}
            type="submit"
          >
            Login
          </button>
          {formErrorMessage && <p className={formStyles.formError}>{formErrorMessage}</p>}
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
