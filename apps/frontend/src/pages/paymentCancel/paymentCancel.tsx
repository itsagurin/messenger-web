import React from 'react';
import { UserProvider } from '../../services/userContext.tsx';
import SubscriptionFailure from '../../components/SubscriptionFailure/SubscriptionFailure.tsx';

const PaymentCancel: React.FC = () => {
  return (
    <UserProvider>
      <div id="root">
        <SubscriptionFailure />
      </div>
    </UserProvider>
  );
};

export default PaymentCancel;