import React from 'react';

import { isEmpty } from '@core/utils/util';
import { yupResolver } from '@hookform/resolvers/yup';
import { AxiosResponse } from 'axios';
import clsx from 'clsx';
import { useForm } from 'react-hook-form';
import { useDispatch, connect } from 'react-redux';
import * as yup from 'yup';

import { CreateUserDto } from '@dtos/create-user.dto';
import HttpException from '@exceptions/http-exception';

import { useHandleFormError } from '../../hooks/use-handle-form-error';
import { StateToPropsFunc } from '../../store';
import { userActions } from '../../store/actions';
import styles from './RegisterPage.module.scss';
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
}

type AllProps = PropsFromState;

const RegisterPage: React.FC<AllProps> = ({ errorResponse }: AllProps) => {
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
    <div className={styles.RegisterPage}>
      <div className={formStyles.formContainer}>
        <h1 className={formStyles.formTitle}>Sign up</h1>

        <form className={formStyles.form} onSubmit={handleSubmit(onSubmit)}>
          <input className={formStyles.formInput} type="text" placeholder="Name" {...register('name')} />
          {errors.name && <p className={formStyles.formError}>{errors.name.message}</p>}

          <input className={formStyles.formInput} type="email" placeholder="Email address" {...register('email')} />
          {errors.email && <p className={formStyles.formError}>{errors.email.message}</p>}
          <p className={formStyles.formFieldAnnotation}>
            This site uses Gravatar so if you want a profile image, use a Gravatar email
          </p>

          <input className={formStyles.formInput} type="password" placeholder="Password" {...register('password')} />
          {errors.password && <p className={formStyles.formError}>{errors.password.message}</p>}
          <input
            className={formStyles.formInput}
            type="password"
            placeholder="Confirm password"
            {...register('confirmPassword')}
          />
          {errors.confirmPassword && <p className={formStyles.formError}>{errors.confirmPassword.message}</p>}

          <button
            className={clsx('ui', 'button', buttonStyles.primaryButton, formStyles.formSubmitButton)}
            type="submit"
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
});

export default connect(mapStateToProps)(RegisterPage);
