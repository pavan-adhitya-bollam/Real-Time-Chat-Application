import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import socket from '../socket';
import axios from 'axios';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typing, setTyping] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Connect to socket
    socket.connect();
    socket.emit('userConnect', { userId: user.id, username: user.username });

    // Fetch all users
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/chat/users', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching users:', error);
        setLoading(false);
      }
    };

    fetchUsers();

    // Listen for online users updates
    socket.on('onlineUsers', (onlineUserIds) => {
      setOnlineUsers(onlineUserIds);
    });

    // Listen for private messages
    socket.on('privateMessage', (message) => {
      if (selectedUser && 
          (message.senderId === selectedUser._id || message.receiverId === selectedUser._id)) {
        setMessages((prev) => [...prev, message]);
      }
    });

    // Listen for typing indicator
    socket.on('typing', ({ senderId, isTyping }) => {
      if (selectedUser && senderId === selectedUser._id) {
        setTyping(isTyping);
      }
    });

    return () => {
      socket.disconnect();
      socket.off('onlineUsers');
      socket.off('privateMessage');
      socket.off('typing');
    };
  }, [user, navigate, selectedUser]);

  useEffect(() => {
    if (selectedUser) {
      fetchMessages(selectedUser._id);
    }
  }, [selectedUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/chat/messages/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setLoading(false);
    }
  };

  const handleUserSelect = (selectedUser) => {
    setSelectedUser(selectedUser);
    setMessages([]);
    setLoading(true);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || !selectedUser) return;

    const messageData = {
      senderId: user.id,
      receiverId: selectedUser._id,
      text: input,
      senderUsername: user.username,
      receiverUsername: selectedUser.username,
      createdAt: new Date().toISOString(),
    };

    // Emit message via socket
    socket.emit('privateMessage', messageData);

    // Also save to database
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5000/api/chat/messages',
        { receiverId: selectedUser._id, text: input },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error('Error saving message:', error);
    }

    setInput('');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isUserOnline = (userId) => {
    return onlineUsers.includes(userId);
  };

  if (loading && !selectedUser) {
    return <div className="container">Loading...</div>;
  }

  return (
    <div className="whatsapp-container">
      <div className="whatsapp-app">
        {/* Sidebar */}
        <div className="sidebar">
          <div className="sidebar-header">
            <div className="user-avatar">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            <div className="user-info">
              <h3>{user?.username}</h3>
              <span className="status-text">Online</span>
            </div>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
          <div className="sidebar-content">
            <div className="users-section">
              <h4>Chats</h4>
              <div className="users-list">
                {users.map((chatUser) => (
                  <div
                    key={chatUser._id}
                    className={`user-item ${selectedUser?._id === chatUser._id ? 'active' : ''}`}
                    onClick={() => handleUserSelect(chatUser)}
                  >
                    <div className="user-avatar-small">
                      {chatUser.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="online-indicator-container">
                      {isUserOnline(chatUser._id) && <div className="online-indicator"></div>}
                    </div>
                    <div className="user-details">
                      <span className="user-name">{chatUser.username}</span>
                      <span className="user-status">
                        {isUserOnline(chatUser._id) ? 'Online' : 'Offline'}
                      </span>
                    </div>
                  </div>
                ))}
                {users.length === 0 && (
                  <div className="no-users">No other users registered</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="chat-area">
          {selectedUser ? (
            <>
              <div className="chat-header">
                <div className="chat-header-info">
                  <div className="chat-avatar">
                    {selectedUser.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="chat-header-text">
                    <h2>{selectedUser.username}</h2>
                    <span className="chat-status">
                      {isUserOnline(selectedUser._id) ? 'Online' : 'Offline'}
                      {typing && ' - Typing...'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="chat-messages">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`message-wrapper ${
                      msg.senderId === user?.id ? 'own' : 'other'
                    }`}
                  >
                    <div
                      className={`message-bubble ${
                        msg.senderId === user?.id ? 'own-bubble' : 'other-bubble'
                      }`}
                    >
                      <div className="message-content">{msg.text}</div>
                      <div className="message-time">
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <form className="chat-input-area" onSubmit={handleSendMessage}>
                <button type="button" className="emoji-btn">😊</button>
                <button type="button" className="attach-btn">📎</button>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type a message..."
                  className="message-input"
                />
                <button type="submit" className="send-btn">
                  {input.trim() ? '➤' : '🎤'}
                </button>
              </form>
            </>
          ) : (
            <div className="no-chat-selected">
              <div className="no-chat-icon">💬</div>
              <h3>Select a user to start chatting</h3>
              <p>Choose a user from the sidebar to begin a private conversation</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
