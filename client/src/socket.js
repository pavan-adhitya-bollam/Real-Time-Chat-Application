import { io } from 'socket.io-client';

const socket = io('https://real-time-chat-application-xty0.onrender.com', {
  autoConnect: false,
});

export default socket;
