import React, { useState, useEffect } from 'react';

import { yupResolver } from '@hookform/resolvers/yup';
import { AxiosResponse } from 'axios';
import clsx from 'clsx';
import { format } from 'date-fns';
import * as R from 'ramda';
import { useForm } from 'react-hook-form';
import { connect, useDispatch } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import * as yup from 'yup';

import { dateFormat } from '@/constants';
import { useHandleFormError } from '@/hooks/use-handle-form-error';
import { profileActions } from '@actions';
import FormInput from '@components/form/FormInput/FormInput';
import { withFormLabel } from '@components/form/with-form-label';
import { CreateProfileExperienceDto } from '@dtos/create-profile-experience.dto';
import { ProfileExperienceDto } from '@dtos/profile-experience.dto';
import { ProfileDto } from '@dtos/profile.dto';
import { HttpException } from '@exceptions';
import { StateToPropsFunc } from '@store';
import { isNotNilOrEmpty } from '@utils/object-utils';

import buttonStyles from '@styles/button.module.scss';
import formStyles from '@styles/form.module.scss';

interface ExperienceForm {
  title: string;
  company: string;
  location?: string;
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
  title: yup.string().label('Title').required(),
  company: yup.string().label('Company').required(),
  location: yup.string().label('Location'),
  from: yup.date().label('From').required(),
  to: yup
    .date()
    .label('To')
    .nullable()
    .transform((value, originalValue) => (originalValue === '' ? null : value)),
  current: yup.boolean().label('Current'),
  description: yup.string().label('Description').nullable(),
});

const FormLabelInput = withFormLabel(FormInput);

const EditExperiencePage: React.FC<AllProps> = ({ edit, profile, errorResponse, loading }: AllProps) => {
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
  } = useForm<ExperienceForm>({
    resolver: yupResolver(schema),
  });

  const [formErrorMessage, setFormErrorMessage] = useHandleFormError(setError, errorResponse);
  const [profileLoaded, setProfileLoaded] = useState(!!profile);
  const { id: experienceId } = useParams<{ id: string }>();
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
    const experience = profile.experiences.find((e) => e.id === experienceId);
    if (experience) {
      const newFormValue = mapDataToForm(experience);
      reset(newFormValue);
    }
  }, [experienceId, reset, loading, profile, setValue]);

  function onSubmit(formData: ExperienceForm): void {
    if (!formData.current && !formData.to) {
      setError('to', { type: 'required', message: `'To' is required when it's not current experience` });
      return;
    }
    clearErrors('to');
    if (isNotNilOrEmpty(formState.errors)) {
      return;
    }
    setFormErrorMessage('');
    if (edit) {
      const changedFormFields = R.pick(Object.keys(dirtyFields), formData);
      const experienceData = mapFormToData(changedFormFields);
      dispatch(profileActions.updateExperience.request({ id: experienceId, experience: experienceData }));
    } else {
      const experienceData = mapFormToData(formData);
      dispatch(profileActions.addExperience.request(experienceData));
    }
  }

  function mapDataToForm(experienceData: ProfileExperienceDto): ExperienceForm {
    return {
      ...experienceData,
      from: format(new Date(experienceData.from), dateFormat),
      to: experienceData.to ? format(new Date(experienceData.to), dateFormat) : undefined,
    };
  }

  function mapFormToData(formData: ExperienceForm): CreateProfileExperienceDto {
    return {
      ...formData,
      from: new Date(formData.from),
      to: formData.to ? new Date(formData.to) : undefined,
    };
  }

  return (
    <div className={formStyles.formPage}>
      <div className={formStyles.formContainer}>
        <h1 className={formStyles.formTitle}>{edit ? 'Edit' : 'Add'} experience</h1>

        <form className={formStyles.form} onSubmit={handleSubmit(onSubmit)}>
          <FormLabelInput name="title" required register={register} errors={errors} />
          <FormLabelInput name="company" required register={register} errors={errors} />
          <FormLabelInput name="location" register={register} errors={errors} />
          <FormLabelInput name="from" type="date" required register={register} errors={errors} />
          <FormLabelInput name="to" type="date" register={register} errors={errors} disabled={watchCurrentChecked} />
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

export default connect(mapStateToProps)(EditExperiencePage);
