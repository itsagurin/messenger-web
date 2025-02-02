import React, { useEffect } from 'react';
import { Check, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import './PlansPage.css';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { useUser } from '../../services/userContext.tsx';

type PlanType = 'BASIC' | 'PLUS' | 'PREMIUM';

interface PlanFeature {
  prefix?: string;
  bold?: string;
  suffix?: string;
}

interface SubscriptionPlan {
  type: PlanType;
  price: number;
  features: PlanFeature[];
  isPopular?: boolean;
}

const subscriptionPlans: SubscriptionPlan[] = [
  {
    type: 'BASIC',
    price: 0,
    features: [
      { prefix: 'Get started with ', bold: 'messaging' },
      { prefix: 'Flexible ', bold: 'team meeting' },
      { bold: '5 TB', suffix: ' cloud storage' },
    ],
  },
  {
    type: 'PLUS',
    price: 5,
    isPopular: true,
    features: [
      { prefix: 'All features in ', bold: 'Basic' },
      { prefix: 'Flexible ', bold: 'message scheduling' },
      { bold: '15 TB', suffix: ' cloud storage' },
    ],
  },
  {
    type: 'PREMIUM',
    price: 10,
    features: [
      { prefix: 'All features in ', bold: 'Plus' },
      { prefix: 'Special ', bold: 'emoji' },
      { bold: 'Unlimited', suffix: ' cloud storage' },
    ],
  },
];

interface PlansPageProps {
  className?: string;
}

const PlansPage: React.FC<PlansPageProps> = ({ className }) => {
  const { currentUser } = useUser();
  const { currentPlan, isLoading, error, subscribe, fetchCurrentPlan } = useSubscription();

  useEffect(() => {
    if (currentUser?.userId) {
      fetchCurrentPlan();
    }
  }, [currentUser]);

  const handleSubscribe = async (planType: PlanType) => {
    if (isLoading || !currentUser?.userId) return;

    try {
      await subscribe(planType);
      if (planType === 'BASIC') {
        await fetchCurrentPlan();
        toast.success(`Successfully subscribed to ${planType} plan!`);
      }
    } catch (err) {
      toast.error(error || 'Failed to subscribe. Please try again.');
    }
  };

  if (!currentUser) {
    return <div>Please log in to view subscription plans</div>;
  }

  return (
    <div className="plans-page-wrapper">
      <div className="plans-header">
        <Link to="../main" className="back-button">
          <ArrowLeft size={20} />
          Go Back
        </Link>
        <h1>Choose the plan that best suits your needs</h1>
      </div>

      <div className={`con-items ${className || ''}`}>
        {subscriptionPlans.map((plan, index) => {
          const isCurrentPlan = currentPlan === plan.type;

          return (
            <div
              key={index}
              className={`item ${plan.isPopular ? 'color' : ''} item${index + 1}`}
            >
              {isCurrentPlan && (
                <span className="current-plan-badge">
                  Current Plan
                </span>
              )}
              {plan.isPopular && (
                <span className="badge">
                  Popular
                </span>
              )}
              <header>
                <h3>
                  {plan.type.charAt(0) + plan.type.slice(1).toLowerCase()}
                </h3>
                <p>
                  <b>
                    {plan.price}$ / user
                  </b>
                </p>
              </header>
              <ul>
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex}>
                    <Check size={24} />
                    {feature.prefix}<b>{feature.bold}</b>{feature.suffix}
                  </li>
                ))}
              </ul>
              <button
                className={`${plan.isPopular ? 'border' : ''} ${isCurrentPlan ? 'current' : ''}`}
                disabled={isLoading || isCurrentPlan}
                onClick={() => handleSubscribe(plan.type)}
              >
                {isLoading ? 'Processing...' : isCurrentPlan ? 'Your Current Plan' : 'Choose Plan'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default React.memo(PlansPage);