import React, { createContext, useContext, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

interface SubscriptionContextType {
  currentPlan: string;
  isLoading: boolean;
  subscribe: (planType: string) => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType>(null);

export const SubscriptionProvider: React.FC = ({ children }) => {
  const [currentPlan, setCurrentPlan] = useState('BASIC');
  const [isLoading, setIsLoading] = useState(false);

  const subscribe = async (planType: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/payment/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planType }),
      });

      const data = await response.json();

      if (data.clientSecret) {
        const stripe = await stripePromise;
        const result = await stripe.confirmCardPayment(data.clientSecret);

        if (result.error) {
          throw new Error(result.error.message);
        }

        if (result.paymentIntent.status === 'succeeded') {
          setCurrentPlan(planType);
        }
      } else {
        // Для бесплатного плана
        setCurrentPlan(planType);
      }
    } catch (error) {
      console.error('Subscription error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SubscriptionContext.Provider value={{ currentPlan, isLoading, subscribe }}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => useContext(SubscriptionContext);