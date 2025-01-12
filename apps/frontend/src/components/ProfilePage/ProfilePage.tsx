import React from 'react';
import { Link } from 'react-router-dom';
import styles from './ProfilePage.module.css';
import { useUser } from '../../services/userContext.tsx';

interface ProfilePageProps {
  className?: string;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ className }) => {
  const { currentUser } = useUser();

  return (
    <div className={`${styles.container} ${className || ''}`}>
      <div className={styles.leftPanel}>
        <div className={styles.profileSection}>
          <h2 className={styles.title}>Profile</h2>

          <div className={styles.emailSection}>
            <h3>Email</h3>
            <div className={styles.emailPlaceholder}>
              { currentUser?.email }
            </div>
          </div>

          <div className={styles.subscriptionControls}>
            <h3>Account management</h3>
            <Link to="../main">
              <button className={styles.subscriptionButton}>
                  Go back
              </button>
            </Link>
            <button className={styles.cancelButton}>
              Delete account
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
            {/* Место для списка подписок */}
            <p>Здесь будет отображаться список ваших активных подписок</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;