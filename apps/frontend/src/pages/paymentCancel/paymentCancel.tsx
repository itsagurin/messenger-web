import React from 'react';
import { UserProvider } from '../../services/userContext.tsx';
import SubscriptionFailure from '../../components/SubscriptionFailure/SubscriptionFailure.tsx';

const PaymentCancel: React.FC = () => {
  return (
    <UserProvider>
      <SubscriptionFailure />
    </UserProvider>
  );
};

export default PaymentCancel;