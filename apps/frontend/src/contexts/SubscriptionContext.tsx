import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useUser } from '../services/userContext.tsx';

const API_URL = import.meta.env.VITE_API_URL;

type PlanType = 'BASIC' | 'PLUS' | 'PREMIUM';

interface SubscriptionContextType {
  currentPlan: PlanType;
  isLoading: boolean;
  error: string | null;
  subscribe: (planType: PlanType) => Promise<void>;
  fetchCurrentPlan: () => Promise<void>;
}

const defaultContextValue: SubscriptionContextType = {
  currentPlan: 'BASIC',
  isLoading: false,
  error: null,
  subscribe: async () => {},
  fetchCurrentPlan: async () => {},
};

const SubscriptionContext = createContext<SubscriptionContextType>(defaultContextValue);

interface SubscriptionProviderProps {
  children: ReactNode;
}

export const SubscriptionProvider: React.FC<SubscriptionProviderProps> = ({ children }) => {
  const { currentUser } = useUser();
  const [currentPlan, setCurrentPlan] = useState<PlanType>('BASIC');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCurrentPlan = async () => {
    try {
      if (!currentUser?.userId) {
        throw new Error('User not found');
      }

      const token = import.meta.env.SECRET_KEY;
      const response = await fetch(`${API_URL}/payment/current-plan/${currentUser.userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch current plan');
      }

      const data = await response.json();
      setCurrentPlan(data.plan);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch current plan');
      console.error('Error fetching current plan:', err);
    }
  };

  useEffect(() => {
    if (currentUser?.userId) {
      fetchCurrentPlan();
    }
  }, [currentUser]);

  const subscribe = async (planType: PlanType) => {
    if (!currentUser?.userId) {
      throw new Error('User not found');
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/payment/create-subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ userId: currentUser.userId, planType }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create subscription');
      }

      if (planType === 'BASIC') {
        setCurrentPlan(planType);
        return;
      }

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }

      throw new Error('No checkout URL returned');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Subscription error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SubscriptionContext.Provider value={{
      currentPlan,
      isLoading,
      error,
      subscribe,
      fetchCurrentPlan,
    }}>
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
