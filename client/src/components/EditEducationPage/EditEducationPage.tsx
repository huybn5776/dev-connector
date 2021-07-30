import React, { useEffect, useState } from 'react';

import { yupResolver } from '@hookform/resolvers/yup';
import { AxiosResponse } from 'axios';
import clsx from 'clsx';
import { format } from 'date-fns';
import * as R from 'ramda';
import { useForm } from 'react-hook-form';
import { connect, useDispatch } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import * as yup from 'yup';

import { useHandleFormError } from '@/hooks/use-handle-form-error';
import { profileActions } from '@actions';
import FormInput from '@components/form/FormInput/FormInput';
import { withFormLabel } from '@components/form/with-form-label';
import { CreateProfileEducationDto } from '@dtos/create-profile-education.dto';
import { ProfileEducationDto } from '@dtos/profile-education.dto';
import { ProfileDto } from '@dtos/profile.dto';
import { HttpException } from '@exceptions';
import { StateToPropsFunc } from '@store';
import { isNotNilOrEmpty } from '@utils/object-utils';

import buttonStyles from '@styles/button.module.scss';
import formStyles from '@styles/form.module.scss';

interface EducationForm {
  school: string;
  degree: string;
  fieldOfStudy: string;
  from: string | Date;
  to?: string | Date;
  current?: boolean;
  description?: string;
}

interface PropsFromState {
  profile?: ProfileDto;
  errorResponse?: AxiosResponse<HttpException>;
  loading: boolean;
}

interface Props {
  edit?: boolean;
}

type AllProps = Props & PropsFromState;

const schema = yup.object().shape({
  school: yup.string().label('School').required(),
  degree: yup.string().label('degree').required(),
  fieldOfStudy: yup.string().label('Field of study').required(),
  from: yup.date().label('From').required(),
  to: yup
    .date()
    .label('To')
    .nullable()
    .transform((value, originalValue) => (originalValue === '' ? null : value)),
  current: yup.boolean().label('Current'),
  description: yup.string().label('Description'),
});

const FormLabelInput = withFormLabel(FormInput);

const EditEducationPage: React.FC<AllProps> = ({ edit, profile, errorResponse, loading }: AllProps) => {
  const {
    register,
    handleSubmit,
    formState,
    setError,
    clearErrors,
    setValue,
    reset,
    watch,
    formState: { errors, dirtyFields },
  } = useForm<EducationForm>({
    resolver: yupResolver(schema),
  });

  const [formErrorMessage, setFormErrorMessage] = useHandleFormError(setError, errorResponse);
  const [profileLoaded, setProfileLoaded] = useState(!!profile);
  const { id: educationId } = useParams<{ id: string }>();
  const watchCurrentChecked = watch('current');

  const dispatch = useDispatch();

  useEffect(() => {
    if (!profileLoaded) {
      dispatch(profileActions.getCurrentProfile.request());
      setProfileLoaded(true);
    }
  }, [profileLoaded, profile, dispatch]);

  useEffect(() => {
    if (loading || !profile) {
      return;
    }
    const education = profile.educations.find((e) => e.id === educationId);
    if (education) {
      const newFormValue = mapDataToForm(education);
      reset(newFormValue);
    }
  }, [educationId, reset, loading, profile, setValue]);

  function onSubmit(formData: EducationForm): void {
    if (formData.current && !formData.to) {
      setError('to', { type: 'required', message: `'To' is required when it's not current education` });
    } else {
      clearErrors('to');
    }
    if (isNotNilOrEmpty(formState.errors)) {
      return;
    }
    setFormErrorMessage('');
    if (edit) {
      const changedFormFields = R.pick(Object.keys(dirtyFields), formData);
      const educationData = mapFormToData(changedFormFields);
      dispatch(profileActions.updateEducation.request({ id: educationId, education: educationData }));
    } else {
      const educationData = mapFormToData(formData);
      dispatch(profileActions.addEducation.request(educationData));
    }
  }

  function mapDataToForm(educationData: ProfileEducationDto): EducationForm {
    const dateFormat = 'yyyy-MM-dd';
    return {
      ...educationData,
      from: format(new Date(educationData.from), dateFormat),
      to: educationData.to ? format(new Date(educationData.to), dateFormat) : undefined,
    };
  }

  function mapFormToData(formData: EducationForm): CreateProfileEducationDto {
    return {
      ...formData,
      from: new Date(formData.from),
      to: formData.to ? new Date(formData.to) : undefined,
    };
  }

  return (
    <div className={formStyles.formPage}>
      <div className={formStyles.formContainer}>
        <h1 className={formStyles.formTitle}>{edit ? 'Edit' : 'Add'} education</h1>

        <form className={formStyles.form} onSubmit={handleSubmit(onSubmit)}>
          <FormLabelInput name="school" required register={register} errors={errors} />
          <FormLabelInput name="degree" required register={register} errors={errors} />
          <FormLabelInput
            name="fieldOfStudy"
            label="Field of Study"
            placeholder="Field of Study"
            required
            register={register}
            errors={errors}
          />
          <FormLabelInput name="from" type="date" required register={register} errors={errors} />
          <FormLabelInput
            name="to"
            type="date"
            required
            register={register}
            errors={errors}
            disabled={watchCurrentChecked}
          />
          <FormLabelInput name="current" type="checkbox" register={register} errors={errors} />
          <FormLabelInput name="description" register={register} errors={errors} />

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
          <Link to="/dashboard" className={clsx('ui', 'button', buttonStyles.secondaryButton)}>
            Cancel
          </Link>
        </form>
      </div>
    </div>
  );
};

const mapStateToProps: StateToPropsFunc<PropsFromState> = ({ profile }) => ({
  profile: profile.currentProfile,
  errorResponse: profile.errorResponse,
  loading: profile.loading,
});

export default connect(mapStateToProps)(EditEducationPage);
