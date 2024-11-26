import React, { useState, useCallback, useMemo } from 'react';
import LoginForm from './components/LoginForm';
import SignupForm from './components/SignupForm';
import './App.css';

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
          <LoginForm onLoginSuccess={handleAuthSuccess} />
          <SignupForm onSignupSuccess={handleAuthSuccess} />
        </div>
      </div>
    </div>
  );
};

export default React.memo(App);