import React, { useState, useEffect } from 'react';

import { yupResolver } from '@hookform/resolvers/yup';
import { AxiosResponse } from 'axios';
import clsx from 'clsx';
import * as R from 'ramda';
import { useForm } from 'react-hook-form';
import { connect, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import * as yup from 'yup';

import { useHandleFormError } from '@/hooks/use-handle-form-error';
import { profileActions } from '@actions';
import FormInput from '@components/form/FormInput/FormInput';
import FormSelect from '@components/form/FormSelect/FormSelect';
import { withFormLabel } from '@components/form/with-form-label';
import { CreateProfileDto } from '@dtos/create-profile.dto';
import { PatchProfileDto } from '@dtos/patch-profile.dto';
import { ProfileDto } from '@dtos/profile.dto';
import HttpException from '@exceptions/http-exception';
import { StateToPropsFunc } from '@store';
import { isNotNilOrEmpty, deleteNilProperties } from '@utils/object-utils';

import buttonStyles from '@styles/button.module.scss';
import formStyles from '@styles/form.module.scss';

interface EditProfileForm {
  company?: string;
  website?: string;
  location?: string;
  status: string;
  skills: string;
  bio?: string;
  githubUsername?: string;
  youtube?: string;
  twitter?: string;
  facebook?: string;
  linkedin?: string;
  instagram?: string;
}

const schema = yup.object().shape({
  status: yup.string().label('Status').required(),
  company: yup.string().label('Company'),
  website: yup.string().label('Website').url(),
  location: yup.string().label('Location'),
  skills: yup.string().label('Skills').required(),
  bio: yup.string().label('Bio'),
  githubUsername: yup.string().label('Github username'),
  youtube: yup.string().label('Youtube').url(),
  twitter: yup.string().label('Twitter').url(),
  facebook: yup.string().label('Facebook').url(),
  linkedin: yup.string().label('Linkedin').url(),
  instagram: yup.string().label('Instagram').url(),
});

interface PropsFromState {
  profile?: ProfileDto;
  errorResponse?: AxiosResponse<HttpException>;
  loading: boolean;
}

type AllProps = PropsFromState;

const statusOptions = [
  'Developer',
  'Junior Developer',
  'Senior Developer',
  'Manager',
  'Student or Learning',
  'Instructor',
  'Intern',
  'Other',
];

const FormLabelInput = withFormLabel(FormInput);
const FormLabelSelect = withFormLabel(FormSelect);

const EditProfilePage: React.FC<AllProps> = ({ profile, errorResponse, loading }: AllProps) => {
  const {
    register,
    handleSubmit,
    formState,
    setError,
    setValue,
    reset,
    formState: { errors, dirtyFields },
  } = useForm<EditProfileForm>({
    resolver: yupResolver(schema),
    defaultValues: { status: '' },
  });

  const [formErrorMessage, setFormErrorMessage] = useHandleFormError(setError, errorResponse);
  const [displaySocialInputs, setDisplaySocialInputs] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(!!profile);

  const dispatch = useDispatch();

  useEffect(() => {
    if (!profileLoaded) {
      dispatch(profileActions.getCurrentProfile.request());
      setProfileLoaded(true);
    }
  }, [profileLoaded, profile, dispatch]);

  useEffect(() => {
    if (!loading && profile) {
      const newFormValue = mapDataToForm(profile);
      reset(newFormValue);
      if (profile.social) {
        setDisplaySocialInputs(true);
      }
    }
  }, [reset, loading, profile, setValue]);

  function onSubmit(formData: EditProfileForm): void {
    if (isNotNilOrEmpty(formState.errors)) {
      return;
    }

    if (profile) {
      const changedFormData = R.pick(Object.keys(dirtyFields), formData);
      const profileData: PatchProfileDto = mapFormToPatchProfile(changedFormData);
      dispatch(profileActions.updateProfile.request(profileData));
    } else {
      const profilePatchData = mapFormToPatchProfile(formData);
      const profileData: CreateProfileDto = {
        ...profilePatchData,
        status: profilePatchData.status || '',
        skills: profilePatchData.skills || [],
      };
      dispatch(profileActions.createProfile.request(profileData));
    }
    setFormErrorMessage('');
  }

  function mapDataToForm(userProfile: ProfileDto): EditProfileForm {
    return {
      status: userProfile.status,
      company: userProfile.company,
      website: userProfile.website,
      location: userProfile.location,
      skills: userProfile.skills.join(', '),
      bio: userProfile.bio,
      githubUsername: userProfile.githubUsername,
      youtube: userProfile.social?.youtube,
      twitter: userProfile.social?.twitter,
      facebook: userProfile.social?.facebook,
      linkedin: userProfile.social?.linkedin,
      instagram: userProfile.social?.instagram,
    };
  }

  function mapFormToPatchProfile(formData: Partial<EditProfileForm>): PatchProfileDto {
    const profileData: PatchProfileDto = {
      status: formData.status,
      company: formData.company,
      website: formData.website,
      location: formData.location,
      skills: formData.skills?.split(',').map((skill) => skill.trim()),
      bio: formData.bio,
      githubUsername: formData.githubUsername,
      social: {
        youtube: formData.youtube,
        twitter: formData.twitter,
        facebook: formData.facebook,
        linkedin: formData.linkedin,
        instagram: formData.instagram,
      },
    };
    return deleteNilProperties(profileData);
  }

  return (
    <div className={formStyles.formPage}>
      <div className={formStyles.formContainer}>
        <h1 className={formStyles.formTitle}>Edit profile</h1>

        <form className={formStyles.form} onSubmit={handleSubmit(onSubmit)}>
          <FormLabelSelect name="status" options={statusOptions} register={register} errors={errors} />
          <FormLabelInput name="company" register={register} errors={errors} />
          <FormLabelInput name="website" type="url" register={register} errors={errors} />
          <FormLabelInput name="location" register={register} errors={errors} />
          <FormLabelInput name="skills" register={register} errors={errors} />
          <FormLabelInput name="bio" register={register} errors={errors} />
          <FormLabelInput name="githubUsername" placeholder="Github username" register={register} errors={errors} />

          <details className={formStyles.form} open={displaySocialInputs}>
            <summary
              onClick={(event) => {
                setDisplaySocialInputs((visible) => !visible);
                event.preventDefault();
              }}
            >
              Add social network links
            </summary>
          </details>

          {displaySocialInputs ? (
            <>
              <FormLabelInput name="youtube" type="url" register={register} errors={errors} />
              <FormLabelInput name="twitter" type="url" register={register} errors={errors} />
              <FormLabelInput name="facebook" type="url" register={register} errors={errors} />
              <FormLabelInput name="linkedin" type="url" register={register} errors={errors} />
              <FormLabelInput name="instagram" type="url" register={register} errors={errors} />
            </>
          ) : null}

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
            Go Back
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

export default connect(mapStateToProps)(EditProfilePage);
