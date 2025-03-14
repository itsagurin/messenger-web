import React from 'react';
import AuthContainer from './components/AuthContainer/AuthContainer.tsx';
import './App.css';

const App: React.FC = () => {
  return (
    <AuthContainer />
  );
};

export default React.memo(App);