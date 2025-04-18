import React from 'react';
import { UserProvider } from '../../services/userContext.tsx';
import ProfilePage from '../../components/ProfilePage/ProfilePage.tsx';

const Profile: React.FC = () => {
  return (
    <UserProvider>
      <ProfilePage />
    </UserProvider>
  );
};

export default Profile;