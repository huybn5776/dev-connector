import React, { useEffect, useState } from 'react';

import { useDispatch, connect } from 'react-redux';

import { profileActions } from '@actions';
import Loader from '@components/Loader/Loader';
import ProfileCard from '@components/ProfileCard/ProfileCard';
import { ProfileDto } from '@dtos/profile.dto';
import { StateToPropsFunc } from '@store';

import styles from './ProfilesPage.module.scss';

interface PropsFromState {
  profiles?: ProfileDto[];
  loading: boolean;
}

const ProfilesPage: React.FC<PropsFromState> = ({ profiles, loading }: PropsFromState) => {
  const [profileLoaded, setProfileLoaded] = useState(!!profiles?.length);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!profileLoaded) {
      dispatch(profileActions.getProfiles.request());
      setProfileLoaded(true);
    }
  }, [profileLoaded, dispatch]);

  function renderProfiles(): JSX.Element | JSX.Element[] | undefined {
    if (profiles?.length) {
      return profiles?.map((profile) => <ProfileCard key={profile.id} profile={profile} />);
    }
    return <p className={styles.noProfileText}>No profiles found...</p>;
  }

  return (
    <div className="page-layout">
      <h1>Developers</h1>
      {loading ? <Loader /> : renderProfiles()}
    </div>
  );
};

const mapStateToProps: StateToPropsFunc<PropsFromState> = ({ profile }) => ({
  profiles: profile.profiles,
  loading: profile.loading,
});

export default connect(mapStateToProps)(ProfilesPage);
