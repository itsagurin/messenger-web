import React from 'react';

interface ErrorMessageProps {
  message: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => (
  <div className="error-message" style={{
    color: '#ff3333',
    backgroundColor: '#ffebeb',
    padding: '10px',
    borderRadius: '4px',
    marginBottom: '15px',
    fontSize: '14px',
    textAlign: 'center'
  }}>
    {message}
  </div>
);

export default ErrorMessage;