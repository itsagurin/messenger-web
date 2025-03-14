import React, { useState, useCallback, useMemo } from 'react';
import LoginForm from '../AuthForms/LoginForm.tsx';
import SignupForm from '../AuthForms/SignupForm.tsx';
import { UserProvider } from '../../services/userContext';

const AuthContainer: React.FC = () => {
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
          <AuthOption
            isLogin={false}
            question="Do you have an account?"
            buttonText="please log in here"
            onClick={handleLoginClick}
          />
          <AuthOption
            isLogin={true}
            question="Don't have an account?"
            buttonText="Please sign up here"
            onClick={handleSignupClick}
          />
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

interface AuthOptionProps {
  isLogin: boolean;
  question: string;
  buttonText: string;
  onClick: () => void;
}

const AuthOption: React.FC<AuthOptionProps> = ({ question, buttonText, onClick }) => {
  return (
    <div className="info-item">
      <div className="table">
        <div className="table-cell">
          <p>{question}</p>
          <div className="btn" onClick={onClick}>
            {buttonText}
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(AuthContainer);