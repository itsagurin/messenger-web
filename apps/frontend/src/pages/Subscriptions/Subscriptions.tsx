import React from 'react';
import { UserProvider } from '../../services/userContext.tsx';
import './Subscriptions.css';
import PlansPage from '../../components/PlansPage/PlansPage.tsx';

const Subscriptions: React.FC = () => {
  return (
    <UserProvider>
      <div id="root">
        <PlansPage className="PlansStyles"/>
      </div>
    </UserProvider>
  );
};

export default Subscriptions;