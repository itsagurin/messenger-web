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
  senderId: number;
  receiverId: number;
  text: string;
  createdAt: string;
  status: string;
  sender?: User;
  receiver?: User;
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
      const filteredUsers = data
        .filter(user => user.id !== currentUser.userId)
        .map(user => ({
          ...user,
          id: user.id || -1,
        }));
      setUsers(filteredUsers);
    });

    socket.on('newMessage', (message: Message) => {
      setMessages(prevMessages => Array.isArray(prevMessages) ? [...prevMessages, message] : [message]);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, [currentUser]);

  useEffect(() => {
    if (selectedUser && currentUser) {
      fetch(`http://localhost:4000/messages/${currentUser.userId}/${selectedUser.id}`)
        .then((response) => response.json())
        .then((data) => setMessages(Array.isArray(data) ? data : []));
    }
  }, [selectedUser, currentUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSelectUser = (user: User) => {
    if (selectedUser?.id === user.id) return;
    setSelectedUser(user);
    setMessages([]);
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newMessage.trim() || !selectedUser || !currentUser) return;

    try {
      const response = await fetch('http://localhost:4000/messages/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          senderId: currentUser.userId,
          receiverId: selectedUser.id,
          text: newMessage,
        }),
      });

      const sentMessage = await response.json();
      setMessages(prevMessages => Array.isArray(prevMessages) ? [...prevMessages, sentMessage] : [sentMessage]);
      setNewMessage('');
      socketRef.current?.emit('sendMessage', sentMessage);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
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
                  className={`chat-message ${msg.senderId === currentUser?.userId ? 'outgoing' : 'incoming'}`}
                >
                  <div className="chat-message-bubble">{msg.text}</div>
                  <time className="chat-message-time">
                    {new Date(msg.createdAt).toLocaleTimeString()}
                  </time>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <footer className="chat-footer">
              <form
                className="chat-input-form"
                onSubmit={handleSendMessage}
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