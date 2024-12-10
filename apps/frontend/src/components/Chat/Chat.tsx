import { useState, useEffect } from 'react';

const ChatComponent = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    // Simulating fetching users
    const mockUsers = [
      { id: 1, email: 'user1@example.com' },
      { id: 2, email: 'user2@example.com' },
      { id: 3, email: 'user3@example.com' }
    ];
    setUsers(mockUsers);
  }, []);

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    // Simulating fetching chat history
    setMessages([
      { id: 1, sender: user.id, text: 'Hello!', timestamp: new Date() },
      { id: 2, sender: 'current', text: 'Hi there!', timestamp: new Date() }
    ]);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedUser) return;

    const newMsg = {
      id: messages.length + 1,
      sender: 'current',
      text: newMessage,
      timestamp: new Date()
    };
    setMessages(prevMessages => [...prevMessages, newMsg]);
    setNewMessage('');
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div style={{ width: '250px', borderRight: '1px solid #ccc', padding: '10px' }}>
        <h2>Users</h2>
        {users.length === 0 ? (
          <div>No users available</div>
        ) : (
          users.map(user => (
            <div
              key={user.id}
              onClick={() => handleSelectUser(user)}
              style={{
                cursor: 'pointer',
                padding: '10px',
                backgroundColor: selectedUser?.id === user.id ? '#f0f0f0' : 'white'
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
              {messages.map(msg => (
                <div
                  key={msg.id}
                  style={{
                    textAlign: msg.sender === 'current' ? 'right' : 'left',
                    margin: '10px 0'
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
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            Select a user to start chatting
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatComponent;
