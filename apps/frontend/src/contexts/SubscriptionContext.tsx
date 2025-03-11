import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
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

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

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

      const response = await axiosInstance.get(`/payment/current-plan/${currentUser.userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      setCurrentPlan(response.data.plan);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const errorMessage = err.response?.data?.message || err.message;
        setError(`Failed to fetch current plan: ${errorMessage}`);
      } else {
        setError(err instanceof Error ? err.message : 'Failed to fetch current plan');
      }
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
      const response = await axiosInstance.post('/payment/create-subscription',
        { userId: currentUser.userId, planType },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          }
        }
      );

      const data = response.data;

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
      if (axios.isAxiosError(err)) {
        const errorMessage = err.response?.data?.message || err.message;
        setError(errorMessage);
      } else {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      }
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