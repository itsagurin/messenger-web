import React, { useState, ChangeEvent } from 'react';
import { authService } from '../services/authService';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../services/userContext';

interface SignupFormProps {
  onSignupSuccess?: () => void;
}

const SignupForm: React.FC<SignupFormProps> = ({ onSignupSuccess }) => {
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

      const result = await authService.register({ email, password });

      if (result.success) {
        authService.setTokens(result.accessToken, result.refreshToken);

        const user = {
          userId: result.data.userId,
          email: result.data.email,
        };
        setCurrentUser(user);

        navigate('/main');

        if (onSignupSuccess) {
          onSignupSuccess();
        }
      } else {
        setError(result.message || 'Registration error');
      }
    } catch (error: any) {
      setError(error.message || 'An unexpected error occurred');
    }
  };

  return (
    <div className="form-item sign-up">
      <div className="table">
        <div className="table-cell">
          {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
          <input
            name="email-signup"
            placeholder="Email"
            type="text"
            value={email}
            onChange={handleEmailChange}
          />
          <input
            name="password-signup"
            placeholder="Password"
            type="password"
            value={password}
            onChange={handlePasswordChange}
          />
          <div className="btn signup-button" onClick={handleSubmit}>
            Sign up
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(SignupForm);