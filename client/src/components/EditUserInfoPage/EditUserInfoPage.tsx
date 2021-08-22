import React from 'react';

import { yupResolver } from '@hookform/resolvers/yup';
import { AxiosResponse } from 'axios';
import clsx from 'clsx';
import * as R from 'ramda';
import { useForm } from 'react-hook-form';
import { connect, useDispatch } from 'react-redux';
import * as yup from 'yup';

import { userActions } from '@actions';
import FormInput from '@components/form/FormInput/FormInput';
import { withFormLabel } from '@components/form/with-form-label';
import { PatchUserDto } from '@dtos/patch-user.dto';
import { UserDto } from '@dtos/user.dto';
import HttpException from '@exceptions/http-exception';
import { useHandleFormError } from '@hooks/use-handle-form-error';
import { StateToPropsFunc } from '@store';
import { isEmpty } from '@utils/util';

import buttonStyles from '@styles/button.module.scss';
import formStyles from '@styles/form.module.scss';

interface EditUserInfoForm {
  fullName: string;
  email: string;
  originalPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const schema = yup.object().shape({
  fullName: yup.string().label('Full name').max(100),
  email: yup.string().label('Email').max(100, 'Email is too long').email(),
  originalPassword: yup
    .string()
    .label('Original password')
    .test(
      'has-original-passwords',
      'Original password is required when changing password',
      function test(originalPassword) {
        return (
          (!this.parent.newPassword && !this.parent.confirmPassword) || (this.parent.newPassword && originalPassword)
        );
      },
    ),
  newPassword: yup
    .string()
    .label('New password')
    .test('new-password', 'Password must be 6~24 characters', function test(newPassword) {
      return (
        (!this.parent.originalPassword && !this.parent.confirmPassword) ||
        (!!newPassword && newPassword.length >= 6 && newPassword.length <= 24)
      );
    }),
  confirmPassword: yup
    .string()
    .label('Confirm password')
    .nullable()
    .test('passwords-match', 'Passwords did not match', function test(confirmPassword) {
      return !this.parent.newPassword || this.parent.newPassword === confirmPassword;
    }),
});

interface PropsFromState {
  user?: UserDto;
  errorResponse?: AxiosResponse<HttpException>;
  loading: boolean;
}

const FormLabelInput = withFormLabel(FormInput);

const EditUserInfoPage: React.FC<PropsFromState> = ({ user, errorResponse, loading }: PropsFromState) => {
  const {
    register,
    handleSubmit,
    formState,
    setError,
    formState: { errors, dirtyFields },
  } = useForm<EditUserInfoForm>({
    resolver: yupResolver(schema),
    defaultValues: {
      fullName: user?.fullName || '',
      email: user?.email || '',
    },
  });

  const [formErrorMessage, setFormErrorMessage] = useHandleFormError(setError, errorResponse);
  const dispatch = useDispatch();

  function onSubmit(formData: EditUserInfoForm): void {
    if (!isEmpty(formState.errors)) {
      return;
    }
    setFormErrorMessage('');
    const changedFormData = R.pick(Object.keys(dirtyFields), formData);
    const userData: PatchUserDto = {
      fullName: changedFormData.fullName,
      email: changedFormData.email,
      originalPassword: changedFormData.originalPassword,
      password: changedFormData.newPassword,
    };
    dispatch(userActions.updateUser.request(userData));
  }

  return (
    <div className={formStyles.formPage}>
      <div className={formStyles.formContainer}>
        <h1 className={formStyles.formTitle}>Edit user info</h1>

        <form className={formStyles.form} onSubmit={handleSubmit(onSubmit)}>
          <FormLabelInput name="fullName" label="Full name" register={register} errors={errors} />
          <FormLabelInput name="email" label="Email address" type="email" register={register} errors={errors} />

          <h3 className={formStyles.formSubtitle}>Change password</h3>
          <FormInput
            name="originalPassword"
            type="password"
            placeholder="Original password"
            register={register}
            errors={errors}
          />
          <FormInput
            name="newPassword"
            type="password"
            placeholder="New password"
            register={register}
            errors={errors}
          />
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
            Submit
          </button>
          {formErrorMessage && <p className={formStyles.formError}>{formErrorMessage}</p>}
        </form>
      </div>
    </div>
  );
};

const mapStateToProps: StateToPropsFunc<PropsFromState> = ({ auth, user }) => ({
  user: auth.user,
  errorResponse: user.errorResponse,
  loading: user.loading,
});

export default connect(mapStateToProps)(EditUserInfoPage);
