import React from 'react';
import { UserProvider } from '../../services/userContext.tsx';
import './Subscriptions.css';
import PlansPage from '../../components/PlansPage/PlansPage.tsx';
import { SubscriptionProvider } from '../../contexts/SubscriptionContext.tsx';

const Subscriptions: React.FC = () => {
  return (
    <UserProvider>
      <SubscriptionProvider>
        <PlansPage className="PlansStyles"/>
      </SubscriptionProvider>
    </UserProvider>
  );
};

export default Subscriptions;