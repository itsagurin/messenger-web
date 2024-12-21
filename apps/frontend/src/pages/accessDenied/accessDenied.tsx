import React from 'react';
import styles from './accessDenied.module.css';

const AccessDenied: React.FC = () => {
  return (
    <div>
      <div id="root">
        <main className={styles.mainElement}>
          <h1>Access Denied</h1>
          <p>You do not have permission to access this page.</p>
          <a href="/">Home</a>
        </main>
      </div>
    </div>
  );
};

export default AccessDenied;