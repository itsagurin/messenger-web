import React, { useState, ChangeEvent } from 'react';
import { authService } from '../services/authService';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../services/userContext';

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

  const handleSubmit = async () => {
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
        setError(result.message || 'Login error');
      }
    } catch (error: any) {
      setError(error.message || 'Login error');
    }
  };

  return (
    <div className="form-item log-in">
      <div className="table">
        <div className="table-cell">
          {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
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
          <div className="btn login-button" onClick={handleSubmit}>
            Log in
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(LoginForm);