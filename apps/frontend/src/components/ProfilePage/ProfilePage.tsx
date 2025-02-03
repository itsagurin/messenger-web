import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './ProfilePage.module.css';
import { useUser } from '../../services/userContext.tsx';
import { authService } from '../../services/authService.ts';

interface ProfilePageProps {
  className?: string;
}

interface SubscriptionResponse {
  plan: 'BASIC' | 'PLUS' | 'PREMIUM';
  status: 'ACTIVE' | 'INACTIVE';
  periodStart: string;
  periodEnd: string;
  stripeDetails: {
    cancelAtPeriodEnd: boolean;
    created: string;
  };
}

const ProfilePage: React.FC<ProfilePageProps> = ({ className }) => {
  const { currentUser, setCurrentUser } = useUser();
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);
  const [subscription, setSubscription] = useState<SubscriptionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCurrentPlan = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (!currentUser?.userId) {
        throw new Error('User not found');
      }

      const token = authService.getAccessToken();
      if (!token) {
        throw new Error('No access token available');
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/payment/current-plan/${currentUser.userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch current plan: ${errorText}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Received non-JSON response from server');
      }

      const data: SubscriptionResponse = await response.json();
      setSubscription(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch current plan');
      console.error('Error fetching current plan:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.userId) {
      fetchCurrentPlan();
    }
  }, [currentUser]);

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      setIsDeleting(true);
      try {
        const token = authService.getAccessToken();

        if (!token) {
          throw new Error('No access token available');
        }

        const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/delete-account`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();

        if (data.success) {
          authService.clearTokens();
          setCurrentUser(null);
          navigate('/');
        } else {
          alert(data.message || 'Failed to delete account');
        }
      } catch (error) {
        console.error('Error deleting account:', error);
        alert('An error occurred while trying to delete your account');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getPlanDisplayInfo = (plan: string) => {
    const planInfo = {
      BASIC: {
        title: 'BASIC Plan',
        className: styles.basicPlan
      },
      PLUS: {
        title: 'PLUS Plan',
        className: styles.plusPlan
      },
      PREMIUM: {
        title: 'PREMIUM Plan',
        className: styles.premiumPlan
      }
    };

    return planInfo[plan as keyof typeof planInfo] || { title: 'Неизвестный план', className: '' };
  };

  return (
    <div className={`${styles.container} ${className || ''}`}>
      <div className={styles.leftPanel}>
        <div className={styles.profileSection}>
          <h2 className={styles.title}>Profile</h2>

          <div className={styles.emailSection}>
            <h3>Email</h3>
            <div className={styles.emailPlaceholder}>
              {currentUser?.email}
            </div>
          </div>

          <div className={styles.subscriptionControls}>
            <h3>Account management</h3>
            <Link to="../main">
              <button className={styles.subscriptionButton}>
                Go back
              </button>
            </Link>
            <button
              className={styles.cancelButton}
              onClick={handleDeleteAccount}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete account'}
            </button>
          </div>

          <div className={styles.logoutSection}>
            <Link to="/" className={styles.logoutButton}>
              Log out
            </Link>
          </div>
        </div>
      </div>

      <div className={styles.rightPanel}>
        <div className={styles.subscriptionsSection}>
          <h2 className={styles.title}>Active subscriptions</h2>
          <div className={styles.subscriptionsPlaceholder}>
            {isLoading ? (
              <p>Uploading subscription information...</p>
            ) : error ? (
              <p className={styles.errorText}>{error}</p>
            ) : subscription && subscription.status === 'ACTIVE' ? (
              <div className={`${styles.planCard} ${getPlanDisplayInfo(subscription.plan).className}`}>
                <h3>{getPlanDisplayInfo(subscription.plan).title}</h3>
                <p>Status: Active</p>
                <p>Period: {formatDate(subscription.periodStart)} - {formatDate(subscription.periodEnd)}</p>
              </div>
            ) : (
              <p>You have no active subscriptions</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;