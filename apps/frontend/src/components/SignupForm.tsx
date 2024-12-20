import React, { useState, ChangeEvent } from 'react';
import { authService } from '../services/authService';
import { useNavigate } from 'react-router-dom';

interface SignupFormProps {
  onSignupSuccess?: () => void; // Ожидаем, что может быть передана функция
}

const SignupForm: React.FC<SignupFormProps> = ({ onSignupSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value);
  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value);

  const handleSubmit = async () => {
    try {
      setError('');
      if (!email || !password) {
        setError('Email и пароль обязательны');
        return;
      }

      const result = await authService.register({ email, password });

      if (result.success) {
        authService.setTokens(result.accessToken, result.refreshToken);
        navigate('/main');

        if (onSignupSuccess) {
          onSignupSuccess();
        }
      } else {
        setError(result.message || 'Ошибка регистрации');
      }
    } catch (error: any) {
      setError(error.message || 'Ошибка регистрации');
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