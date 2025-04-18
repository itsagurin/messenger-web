import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import { useUser } from '../../services/userContext';
import './Chat.css';
import { authService } from '../../services/authService.ts';
import { Message, User } from '@messenger/shared';

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
  const [unreadCounts, setUnreadCounts] = useState<{ [key: number]: number }>({});

  const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authService.getAccessToken()}`
    }
  });

  useEffect(() => {
    if (!currentUser) return;

    const socket = io(`${import.meta.env.VITE_API_URL}`, {
      query: { User: currentUser.email },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
    });

    socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
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
      if (message.receiverId === currentUser.userId &&
        (!selectedUser || message.senderId !== selectedUser.id)) {
        setUnreadCounts(prev => ({
          ...prev,
          [message.senderId]: (prev[message.senderId] || 0) + 1
        }));
      }
    });

    socketRef.current = socket;

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [currentUser]);

  useEffect(() => {
    if (!socketRef.current || !selectedUser || !currentUser) return;

    const handleNewMessage = (message: Message) => {
      setMessages(prevMessages => {
        if (
          (message.senderId === selectedUser?.id && message.receiverId === currentUser.userId) ||
          (message.senderId === currentUser.userId && message.receiverId === selectedUser?.id)
        ) {
          const messageExists = prevMessages.some(msg => msg.id === message.id);
          if (!messageExists) {
            return [...prevMessages, message];
          }
        }
        return prevMessages;
      });
    };

    socketRef.current.on('newMessage', handleNewMessage);

    return () => {
      socketRef.current?.off('newMessage', handleNewMessage);
    };
  }, [selectedUser, currentUser]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (selectedUser && currentUser) {
        try {
          const response = await axiosInstance.get(
            `/messages/conversation/${currentUser.userId}/${selectedUser.id}`
          );

          setMessages(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
          console.error('Error fetching messages:', error);
        }
      }
    };

    fetchMessages();
  }, [selectedUser, currentUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!currentUser) return;

    const updateUnreadCounts = async () => {
      try {
        const response = await axiosInstance.get(
          `/messages/unread/${currentUser.userId}`
        );

        const data = response.data;

        if (selectedUser) {
          const newData = { ...data };
          delete newData[selectedUser.id];
          setUnreadCounts(newData);
        } else {
          setUnreadCounts(data);
        }
      } catch (err) {
        console.error('Failed to fetch unread counts:', err);
      }
    };

    updateUnreadCounts();

    const interval = setInterval(updateUnreadCounts, 10000);

    return () => clearInterval(interval);
  }, [currentUser, selectedUser]);

  const handleSelectUser = async (user: User) => {
    if (!currentUser || selectedUser?.id === user.id) return;

    setSelectedUser(user);
    setMessages([]);

    setUnreadCounts(prev => {
      const newCounts = { ...prev };
      delete newCounts[user.id];
      return newCounts;
    });

    try {
      await axiosInstance.post(
        `/messages/mark-read/${user.id}/${currentUser.userId}`
      );

      const response = await axiosInstance.get(
        `/messages/unread/${currentUser.userId}`
      );

      const data = response.data;
      const newData = { ...data };
      delete newData[user.id];
      setUnreadCounts(newData);
    } catch (err) {
      console.error('Failed to update message status:', err);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newMessage.trim() || !selectedUser || !currentUser) return;

    try {
      const messageData = {
        senderId: currentUser.userId,
        receiverId: selectedUser.id,
        text: newMessage,
      };

      const response = await axiosInstance.post('/messages/send', messageData);

      const sentMessage = response.data;

      setMessages(prevMessages => [...prevMessages, sentMessage]);

      socketRef.current?.emit('sendMessage', sentMessage);

      setNewMessage('');
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
                {unreadCounts[user.id] > 0 && selectedUser?.id !== user.id && (
                  <span className="unread-indicator">{unreadCounts[user.id]}</span>
                )}
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