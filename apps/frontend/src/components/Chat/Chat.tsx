import { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { useUser } from '../../services/userContext';

interface User {
  userId: number;
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
  const { currentUser } = useUser();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');

  useEffect(() => {
    if (!currentUser) return;

    const socket = io('http://localhost:4000');

    socket.on('users', (data: User[]) => {
      // Фильтруем список пользователей, исключая текущего пользователя
      const filteredUsers = data.filter(user => user.userId !== currentUser.userId);
      setUsers(filteredUsers);
    });

    return () => {
      socket.disconnect();
    };
  }, [currentUser]);

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    const mockMessages: Message[] = [
      { id: 1, sender: user.userId, text: 'Hello!', timestamp: new Date() },
      { id: 2, sender: 'current', text: 'Hi there!', timestamp: new Date() },
    ];
    setMessages(mockMessages);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedUser || !currentUser) return;

    const newMsg: Message = {
      id: messages.length + 1,
      sender: 'current',
      text: newMessage,
      timestamp: new Date(),
    };
    setMessages((prevMessages) => [...prevMessages, newMsg]);
    setNewMessage('');
  };

  if (!currentUser) {
    return <div>Please log in to access the chat</div>;
  }

  return (
    <div className={className} style={{ display: 'flex', height: '100vh' }}>
      <div style={{ width: '30%', borderRight: '1px solid #ccc', padding: '10px' }}>
        <h2>Users</h2>
        {users.length === 0 ? (
          <div>No users available</div>
        ) : (
          users.map((user) => (
            <div
              key={user.userId}
              onClick={() => handleSelectUser(user)}
              style={{
                cursor: 'pointer',
                padding: '10px',
                backgroundColor: selectedUser?.userId === user.userId ? '#f0f0f0' : 'white',
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