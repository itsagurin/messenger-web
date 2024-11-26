import React, { useState, ChangeEvent } from 'react';
import { authService } from '../services/authService';

interface SignupFormProps {
  onSignupSuccess: () => void;
}

const SignupForm: React.FC<SignupFormProps> = ({ onSignupSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setError('');
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setError('');
  };

  const handleSubmit = async () => {
    try {
      setError('');

      if (!email || !password) {
        setError('Email and password required');
        return;
      }

      const result = await authService.register({ email, password });

      if (result.success) {
        onSignupSuccess();
        // Редирект или другие действия после успешной регистрации
        window.location.href = '../../test.html'; // Замените на нужный путь
      }
    } catch (error: any) {
      setError(error.message || 'Registration error');
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
          <div
            className="btn signup-button"
            onClick={handleSubmit}
          >
            Sign up
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(SignupForm);