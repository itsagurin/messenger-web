import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './ProfilePage.module.css';
import { useUser } from '../../services/userContext.tsx';
import { authService } from '../../services/authService.ts';

interface ProfilePageProps {
  className?: string;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ className }) => {
  const { currentUser, setCurrentUser } = useUser();
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      setIsDeleting(true);
      try {
        const token = authService.getAccessToken();

        if (!token) {
          throw new Error('No access token available');
        }

        const response = await fetch('http://localhost:4000/auth/delete-account', {
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
          <h2 className={styles.title}>Активные подписки</h2>
          <div className={styles.subscriptionsPlaceholder}>
            <p>Здесь будет отображаться список ваших активных подписок</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;