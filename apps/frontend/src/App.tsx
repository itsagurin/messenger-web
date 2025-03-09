import React, { useState, useCallback, useMemo } from 'react';
import LoginForm from './components/AuthForms/LoginForm.tsx';
import SignupForm from './components/AuthForms/SignupForm.tsx';
import './App.css';
import { UserProvider } from './services/userContext.tsx';

const App: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isActive, setIsActive] = useState(false);

  const handleLoginClick = useCallback(() => {
    setIsLogin(true);
  }, []);

  const handleSignupClick = useCallback(() => {
    setIsLogin(false);
  }, []);

  const handleAuthSuccess = useCallback(() => {
    setIsActive(true);
    setTimeout(() => {
      setIsActive(false);
      setIsLogin(true);
    }, 3000);
  }, []);

  const containerClass = useMemo(() => {
    return `container${isLogin ? '' : ' log-in'}${isActive ? ' active' : ''}`;
  }, [isLogin, isActive]);

  return (
    <div className={containerClass}>
      <div className="box"></div>
      <div className="container-forms">
        <div className="container-info">
          <div className="info-item">
            <div className="table">
              <div className="table-cell">
                <p>Do you have an account?</p>
                <div className="btn" onClick={handleLoginClick}>
                  please log in here
                </div>
              </div>
            </div>
          </div>
          <div className="info-item">
            <div className="table">
              <div className="table-cell">
                <p>Don't have an account?</p>
                <div className="btn" onClick={handleSignupClick}>
                  Please sign up here
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="container-form">
          <UserProvider>
            <LoginForm onLoginSuccess={handleAuthSuccess} />
            <SignupForm onSignupSuccess={handleAuthSuccess} />
          </UserProvider>
        </div>
      </div>
    </div>
  );
};

export default React.memo(App);