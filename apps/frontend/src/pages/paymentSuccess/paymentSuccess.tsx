import React from 'react';
import { UserProvider } from '../../services/userContext.tsx';
import SubscriptionSuccess from '../../components/SubscriptionSuccess/SubscriptionSuccess.tsx';

const PaymentSuccess: React.FC = () => {
  return (
    <UserProvider>
      <SubscriptionSuccess />
    </UserProvider>
  );
};

export default PaymentSuccess;