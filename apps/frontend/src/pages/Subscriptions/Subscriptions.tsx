import React from 'react';
import { UserProvider } from '../../services/userContext.tsx';

const Subscriptions: React.FC = () => {
  return (
    <UserProvider>
      <div id="root">
        <h2>Test</h2>
      </div>
    </UserProvider>
  );
};

export default Subscriptions;