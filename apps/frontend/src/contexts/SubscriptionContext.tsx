import React, { createContext, useContext, useState, ReactNode } from 'react';
import { loadStripe } from '@stripe/stripe-js';

const API_URL = 'http://localhost:4000';
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

type PlanType = 'BASIC' | 'PLUS' | 'PREMIUM';

interface SubscriptionContextType {
  currentPlan: PlanType;
  isLoading: boolean;
  error: string | null;
  subscribe: (planType: PlanType) => Promise<void>;
}

const defaultContextValue: SubscriptionContextType = {
  currentPlan: 'BASIC',
  isLoading: false,
  error: null,
  subscribe: async () => {},
};

const SubscriptionContext = createContext<SubscriptionContextType>(defaultContextValue);

interface SubscriptionProviderProps {
  children: ReactNode;
}

export const SubscriptionProvider: React.FC<SubscriptionProviderProps> = ({ children }) => {
  const [currentPlan, setCurrentPlan] = useState<PlanType>('BASIC');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subscribe = async (planType: PlanType) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/payment/create-subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ planType }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create subscription');
      }

      if (planType === 'BASIC') {
        setCurrentPlan(planType);
        return;
      }

      if (data.clientSecret) {
        const stripe = await stripePromise;
        if (!stripe) {
          throw new Error('Stripe failed to load');
        }

        const { error: stripeError } = await stripe.confirmCardPayment(data.clientSecret);

        if (stripeError) {
          throw new Error(stripeError.message);
        }

        setCurrentPlan(planType);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Subscription error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SubscriptionContext.Provider value={{ currentPlan, isLoading, error, subscribe }}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};