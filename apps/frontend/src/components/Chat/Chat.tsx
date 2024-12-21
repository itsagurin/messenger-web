import { useState, useEffect } from 'react';
import io from 'socket.io-client';

interface User {
  id: number;
  email: string;
}

interface Message {
  id: number;
  sender: number | 'current';
  text: string;
  timestamp: Date;
}

interface ChatComponentProps {
  className?: string;
}

const ChatComponent = ({ className }: ChatComponentProps) => {
  const [users, setUsers] = useState<User[]>([]); // users list
  const [selectedUser, setSelectedUser] = useState<User | null>(null); // selected user
  const [messages, setMessages] = useState<Message[]>([]); // message list
  const [newMessage, setNewMessage] = useState<string>(''); // new message

  useEffect(() => {
    const socket = io('http://localhost:4000');

    // listen for users event
    socket.on('users', (data: User[]) => {
      setUsers(data);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    const mockMessages: Message[] = [
      { id: 1, sender: user.id, text: 'Hello!', timestamp: new Date() },
      { id: 2, sender: 'current', text: 'Hi there!', timestamp: new Date() },
    ];
    setMessages(mockMessages);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedUser) return;

    const newMsg: Message = {
      id: messages.length + 1,
      sender: 'current',
      text: newMessage,
      timestamp: new Date(),
    };
    setMessages((prevMessages) => [...prevMessages, newMsg]);
    setNewMessage('');
  };

  return (
    <div className={className} style={{ display: 'flex', height: '100vh' }}>
      <div style={{ width: '30%', borderRight: '1px solid #ccc', padding: '10px' }}>
        <h2>Users</h2>
        {users.length === 0 ? (
          <div>No users available</div>
        ) : (
          users.map((user) => (
            <div
              key={user.id}
              onClick={() => handleSelectUser(user)}
              style={{
                cursor: 'pointer',
                padding: '10px',
                backgroundColor: selectedUser?.id === user.id ? '#f0f0f0' : 'white',
              }}
            >
              {user.email}
            </div>
          ))
        )}
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {selectedUser ? (
          <>
            <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
              <h2>Chat with {selectedUser.email}</h2>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    textAlign: msg.sender === 'current' ? 'right' : 'left',
                    margin: '10px 0',
                  }}
                >
                  {msg.text}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', padding: '10px' }}>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                style={{ flex: 1, padding: '10px', marginRight: '10px' }}
              />
              <button onClick={handleSendMessage} style={{ padding: '10px' }}>
                Send
              </button>
            </div>
          </>
        ) : (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
            }}
          >
            Select a user to start chatting
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatComponent;
