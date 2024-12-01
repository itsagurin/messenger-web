import React from 'react';
import Chat from '../components/Chat/Chat';
import Footer from '../components/Footer/Footer';

const Messenger: React.FC = () => {
  return (
    <div>
      <div id="root">
        <Footer />
        <Chat />
      </div>
    </div>
  );
};

export default Messenger;