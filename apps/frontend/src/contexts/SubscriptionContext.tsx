import React, { createContext, useContext, useState, ReactNode } from 'react';
import { loadStripe } from '@stripe/stripe-js';

// Use a direct string for the publishable key or import from environment
const stripePromise = loadStripe(import.meta.env.STRIPE_PUBLISHABLE_KEY || '');

interface SubscriptionContextType {
  currentPlan: string;
  isLoading: boolean;
  subscribe: (planType: string) => Promise<void>;
}

// Provide default values for the context
const defaultContextValue: SubscriptionContextType = {
  currentPlan: 'BASIC',
  isLoading: false,
  subscribe: async () => {},
};

const SubscriptionContext = createContext<SubscriptionContextType>(defaultContextValue);

interface SubscriptionProviderProps {
  children: ReactNode;
}

export const SubscriptionProvider: React.FC<SubscriptionProviderProps> = ({ children }) => {
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
        if (!stripe) {
          throw new Error('Stripe failed to load');
        }

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