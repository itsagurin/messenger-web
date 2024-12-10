import React from 'react';
import HeaderBlock from '../components/HeaderBlock/HeaderBlock.tsx';
import "./messenger.css"
import Chat from '../components/Chat/Chat.tsx';

const Messenger: React.FC = () => {
  return (
    <div>
      <div id="root">
        <HeaderBlock className="header-block" />
        <Chat />
      </div>
    </div>
  );
};

export default Messenger;