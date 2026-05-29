const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);

// Store online users mapping userId -> socketId
const onlineUsers = new Map();
// Store socketId -> userId mapping
const socketToUser = new Map();

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // User connects with their userId
  socket.on('userConnect', ({ userId, username }) => {
    // Store mappings
    onlineUsers.set(userId, socket.id);
    socketToUser.set(socket.id, { userId, username });
    
    console.log(`${username} connected with userId: ${userId}`);
    
    // Broadcast updated online users list
    io.emit('onlineUsers', Array.from(onlineUsers.keys()));
  });

  // Handle private message
  socket.on('privateMessage', (message) => {
    const { receiverId, senderId, text, senderUsername, receiverUsername, createdAt } = message;
    
    // Get receiver's socket ID
    const receiverSocketId = onlineUsers.get(receiverId);
    
    // Send to receiver if online
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('privateMessage', message);
    }
    
    // Also send back to sender for confirmation
    socket.emit('privateMessage', message);
  });

  // Handle typing indicator
  socket.on('typing', ({ receiverId, senderId, isTyping }) => {
    const receiverSocketId = onlineUsers.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('typing', { senderId, isTyping });
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    const userInfo = socketToUser.get(socket.id);
    if (userInfo) {
      console.log(`${userInfo.username} disconnected`);
      
      // Remove mappings
      onlineUsers.delete(userInfo.userId);
      socketToUser.delete(socket.id);
      
      // Broadcast updated online users list
      io.emit('onlineUsers', Array.from(onlineUsers.keys()));
    } else {
      console.log('User disconnected:', socket.id);
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
