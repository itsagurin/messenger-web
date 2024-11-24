import { useState } from 'react';
import './App.css';

function App() {
  const [isLogin, setIsLogin] = useState(true);
  const [isActive, setIsActive] = useState(false);

  const handleLoginClick = () => {
    if (!isLogin) {
      setIsLogin(true);
    }
  };

  const handleSignupClick = () => {
    if (isLogin) {
      setIsLogin(false);
    }
  };

  const handleSubmit = () => {
    setIsActive(true);
    // Reset form after 3 seconds
    setTimeout(() => {
      setIsActive(false);
      setIsLogin(true);
    }, 3000);
  };

  return (
    <div className={`container${isLogin ? '' : ' log-in'}${isActive ? ' active' : ''}`}>
      <div className="box"></div>
      <div className="container-forms">
        <div className="container-info">
          <div className="info-item">
            <div className="table">
              <div className="table-cell">
                <p>
                  Do you have an account?
                </p>
                <div className="btn" onClick={handleLoginClick}>
                  please log in here
                </div>
              </div>
            </div>
          </div>
          <div className="info-item">
            <div className="table">
              <div className="table-cell">
                <p>
                  Don't have an account?
                </p>
                <div className="btn" onClick={handleSignupClick}>
                  Please sign up here
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="container-form">
          <div className="form-item log-in">
            <div className="table">
              <div className="table-cell">
                <input name="email-login" placeholder="Email" type="text" />
                <input name="password-login" placeholder="Password" type="password" />
                <div className="btn login-button" onClick={handleSubmit}>
                  Log in
                </div>
              </div>
            </div>
          </div>
          <div className="form-item sign-up">
            <div className="table">
              <div className="table-cell">
                <input name="email-signup" placeholder="Email" type="text" />
                <input name="password-signup" placeholder="Password" type="password" />
                <div className="btn signup-button" onClick={handleSubmit}>
                  Sign up
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;