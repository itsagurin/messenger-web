import React, { useState, ChangeEvent } from 'react';
import { authService } from '../../services/authService.ts';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../services/userContext.tsx';

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

      const result = await authService.login({ email, password });

      if (result.success) {
        authService.setTokens(result.accessToken, result.refreshToken);
        setCurrentUser({ userId: result.data.userId, email: result.data.email });
        navigate('/main');
        if (onLoginSuccess) {
          onLoginSuccess();
        }
      } else {
        if (result.message?.includes('No user with this email')) {
          setError('Account not found. Please check your email.');
        } else if (result.message?.includes('Incorrect password')) {
          setError('Invalid password. Please try again.');
        } else {
          setError(result.message ?? 'Login failed. Please try again.');
        }
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again later.');
    }
  };

  return (
    <div className="form-item log-in">
      <div className="table">
        <div className="table-cell">
          {error && (
            <div className="error-message" style={{
              color: '#ff3333',
              backgroundColor: '#ffebeb',
              padding: '10px',
              borderRadius: '4px',
              marginBottom: '15px',
              fontSize: '14px',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}
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