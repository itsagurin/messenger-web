import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { useUser } from '../../services/userContext';
import './Chat.css';

interface User {
  id: number;
  email: string;
}

interface Message {
  id: number;
  sender: number | 'current';
  receiver: number;
  text: string;
  timestamp: Date;
  status: string; // "sent" or "read"
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
  const [hoveredUserId, setHoveredUserId] = useState<number | null>(null);
  const socketRef = useRef<ReturnType<typeof io> | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!currentUser || socketRef.current) return;

    const socket = io('http://localhost:4000', {
      query: { User: currentUser.email },
    });

    socket.on('users', (data: User[]) => {
      const filteredUsers = data.filter(user => user.id !== currentUser.userId);
      setUsers(filteredUsers);
    });

    socket.on('newMessage', (message: Message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      socket.disconnect();
    };
  }, [currentUser]);

  useEffect(() => {
    if (selectedUser) {
      // Получаем сообщения из базы данных при выборе пользователя
      fetch(`http://localhost:4000/messages/${selectedUser.id}`)
        .then(response => response.json())
        .then(data => setMessages(data));
    }
  }, [selectedUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    setMessages([]);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedUser || !currentUser) return;

    const newMsg: Message = {
      id: Date.now(),
      sender: currentUser.userId,
      receiver: selectedUser.id,
      text: newMessage,
      timestamp: new Date(),
      status: 'sent',
    };

    // Отправляем сообщение через сокет
    socketRef.current?.emit('sendMessage', newMsg);

    setMessages((prevMessages) => [...prevMessages, newMsg]);
    setNewMessage('');
  };

  return (
    <div className={`chat-layout ${className || ''}`}>
      <aside className="chat-sidebar">
        <header className="chat-sidebar-header">
          <h2>Users</h2>
        </header>
        <div className="chat-users-list">
          {users.length === 0 ? (
            <div className="chat-no-users">No users available</div>
          ) : (
            users.map((user) => (
              <button
                key={user.id}
                onClick={() => handleSelectUser(user)}
                onMouseEnter={() => setHoveredUserId(user.id)}
                onMouseLeave={() => setHoveredUserId(null)}
                className={`chat-user-button ${
                  selectedUser?.id === user.id ? 'selected' : ''
                } ${hoveredUserId === user.id ? 'hovered' : ''}`}
              >
                {user.email}
              </button>
            ))
          )}
        </div>
      </aside>

      <main className="chat-main">
        {selectedUser ? (
          <>
            <header className="chat-header">
              <h2>Chat with {selectedUser.email}</h2>
            </header>

            <div className="chat-messages">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`chat-message ${msg.sender === 'current' ? 'outgoing' : 'incoming'}`}
                >
                  <div className="chat-message-bubble">
                    {msg.text}
                  </div>
                  <time className="chat-message-time">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </time>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <footer className="chat-footer">
              <form
                className="chat-input-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
              >
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="chat-input"
                />
                <button
                  type="submit"
                  className="chat-send-button"
                  disabled={!newMessage.trim()}
                >
                  Send
                </button>
              </form>
            </footer>
          </>
        ) : (
          <div className="chat-empty-state">
            Select a user to start chatting
          </div>
        )}
      </main>
    </div>
  );
};

export default ChatComponent;