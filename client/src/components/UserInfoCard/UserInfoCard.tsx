import React from 'react';

import clsx from 'clsx';

import { UserDto } from '@dtos/user.dto';

import CardLayout, { CardHeader, CardTitle, CardHeaderLink, CardContent } from '../CardLayout/CardLayout';

interface Props {
  user: UserDto;
}

const UserInfoCard: React.FC<Props> = ({ user }: Props) => {
  return (
    <CardLayout>
      <CardHeader>
        <CardTitle>User info</CardTitle>
        <CardHeaderLink to="/edit-user-info" iconClassName={clsx('edit', 'outline')} />
      </CardHeader>

      <CardContent>
        <p>Full name: {user.fullName}</p>
        <p>Email: {user.email}</p>
      </CardContent>
    </CardLayout>
  );
};

export default UserInfoCard;
