import React from 'react';
import { Check, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import './PlansPage.css';
import { useSubscription } from '../../contexts/SubscriptionContext.tsx';

interface PlanFeature {
  prefix?: string;
  bold?: string;
  suffix?: string;
}

interface SubscriptionPlan {
  price: number;
  features: PlanFeature[];
  isPopular?: boolean;
  isCurrent?: boolean;
}

const subscriptionPlans: SubscriptionPlan[] = [
  {
    price: 0,
    isCurrent: true,
    features: [
      { prefix: 'Get started with ', bold: 'messaging' },
      { prefix: 'Flexible ', bold: 'team meeting' },
      { bold: '5 TB', suffix: ' cloud storage' },
    ],
  },
  {
    price: 5,
    isCurrent: false,
    isPopular: true,
    features: [
      { prefix: 'All features in ', bold: 'Basic' },
      { prefix: 'Flexible ', bold: 'message scheduling' },
      { bold: '15 TB', suffix: ' cloud storage' },
    ],
  },
  {
    price: 10,
    isCurrent: false,
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
  const { currentPlan, isLoading, subscribe } = useSubscription();

  const handleSubscribe = async (planType: string) => {
    if (isLoading) return;
    await subscribe(planType);
  };

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
        {subscriptionPlans.map((plan, index) => (
          <div
            key={index}
            className={`item ${plan.isPopular ? 'color' : ''} item${index + 1}`}
          >
            {plan.isCurrent && (
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
                {index === 0 ? 'Basic' : index === 1 ? 'Plus' : 'Premium'}
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
              className={`${plan.isPopular ? 'border' : ''} ${plan.isCurrent ? 'current' : ''}`}
              disabled={isLoading || plan.isCurrent}
              onClick={() => handleSubscribe(index === 0 ? 'BASIC' : index === 1 ? 'PLUS' : 'PREMIUM')}
            >
              {isLoading ? 'Processing...' : plan.isCurrent ? 'Your Current Plan' : 'Choose Plan'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlansPage;