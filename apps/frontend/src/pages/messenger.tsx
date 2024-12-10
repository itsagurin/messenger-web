import React from 'react';
import HeaderBlock from '../components/HeaderBlock/HeaderBlock.tsx';
import "./messenger.css"

const Messenger: React.FC = () => {
  return (
    <div>
      <div id="root">
        <HeaderBlock className="header-block" />
        <main className="main-content"></main>
      </div>
    </div>
  );
};

export default Messenger;