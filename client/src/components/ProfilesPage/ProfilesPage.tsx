import React, { useEffect } from 'react';

import { useDispatch, connect } from 'react-redux';

import { profileActions } from '@actions';
import Loader from '@components/Loader/Loader';
import ProfileCard from '@components/ProfileCard/ProfileCard';
import { ProfileDto } from '@dtos/profile.dto';
import { StateToPropsFunc } from '@store';

import styles from './ProfilesPage.module.scss';

interface PropsFromState {
  profiles?: ProfileDto[];
  profilesLoaded: boolean;
  loading: boolean;
}

const ProfilesPage: React.FC<PropsFromState> = ({ profiles, profilesLoaded, loading }: PropsFromState) => {
  const dispatch = useDispatch();

  useEffect(() => {
    if (!profilesLoaded) {
      dispatch(profileActions.getProfiles.request());
    }
  }, [profilesLoaded, dispatch]);

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
  profilesLoaded: profile.profilesLoaded,
  loading: profile.loading,
});

export default connect(mapStateToProps)(ProfilesPage);
