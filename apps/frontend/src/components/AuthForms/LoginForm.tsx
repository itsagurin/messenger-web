import React, { useState, ChangeEvent } from 'react';
import { authService } from '../../services/authService';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../services/userContext';
import ErrorMessage from '../ErrorMessage/ErrorMessage.tsx';

interface LoginFormProps {
  onLoginSuccess?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setCurrentUser } = useUser();

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value);
  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      if (!email || !password) {
        setError('Email and password are required');
        return;
      }

      const response = await authService.login({ email, password });

      authService.setTokens(response.accessToken, response.refreshToken);

      setCurrentUser({
        userId: response.userId,
        email: response.email
      });

      navigate('/main');
      if (onLoginSuccess) {
        onLoginSuccess();
      }
    } catch (error: any) {
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || 'Login failed';

        switch (status) {
          case 404:
            setError('Account not found. Please check your email.');
            break;
          case 401:
            setError('Invalid password. Please try again.');
            break;
          case 422:
            setError(message);
            break;
          default:
            setError(message);
        }
      } else {
        setError('An unexpected error occurred. Please try again later.');
      }
    }
  };

  return (
    <div className="form-item log-in">
      <div className="table">
        <div className="table-cell">
          {error && <ErrorMessage message={error} />}
          <form onSubmit={handleSubmit}>
            <input
              name="email-login"
              placeholder="Email"
              type="text"
              value={email}
              onChange={handleEmailChange}
            />
            <input
              name="password-login"
              placeholder="Password"
              type="password"
              value={password}
              onChange={handlePasswordChange}
            />
            <button type="submit" className="btn login-button">
              Log in
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default React.memo(LoginForm);