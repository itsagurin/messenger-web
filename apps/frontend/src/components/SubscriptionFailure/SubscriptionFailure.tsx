import React from 'react';
import { Link } from 'react-router-dom';

const SubscriptionFailure: React.FC = () => {
  return (
    <div style={{ textAlign: 'center', padding: '2rem', width: '100%', backgroundColor: 'white', height: '100vh' }}>
      <h1>Unsubscribed or error</h1>
      <p>Please log in to the service again</p>
      <Link to="/">
        <button style={{ padding: '0.5rem 1rem', fontSize: '1rem' }}>
          Log in
        </button>
      </Link>
    </div>
  );
};

export default SubscriptionFailure;
