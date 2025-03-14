import React from 'react';
import HeaderBlock from '../components/HeaderBlock/HeaderBlock.tsx';
import "./messenger.css"
import Chat from '../components/Chat/Chat.tsx';
import { UserProvider } from '../services/userContext.tsx';

const Messenger: React.FC = () => {
  return (
    <UserProvider>
      <HeaderBlock className="header-block" />
      <Chat className="chat-block" />
    </UserProvider>
  );
};

export default Messenger;