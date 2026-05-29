# Real-Time Chat Application

A full-stack real-time chat application built with React.js, Node.js, Express.js, MongoDB, Socket.IO, and JWT authentication.

## Project Structure

```
chatapp/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Chat.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── main.jsx
│   │   └── socket.js
│   ├── package.json
│   └── vite.config.js
├── server/                 # Node.js backend
│   ├── config/
│   │   └── db.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── Message.js
│   │   └── User.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── chat.js
│   ├── .env
│   ├── package.json
│   └── server.js
└── README.md
```

## Features

- User Registration
- User Login
- JWT Authentication
- Protected Routes
- MongoDB Database
- Socket.IO Real-time Messaging

## Installation

### Server Setup

```bash
cd server
npm install
```

Create a `.env` file in the server directory:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/chatapp
JWT_SECRET=your_jwt_secret_key_here
CLIENT_URL=http://localhost:5173
```

### Client Setup

```bash
cd client
npm install
```

## Running the Application

### Start MongoDB

Make sure MongoDB is running on your system.

### Start Server

```bash
cd server
npm start
```

Server will run on `http://localhost:5000`

### Start Client

```bash
cd client
npm run dev
```

Client will run on `http://localhost:5173`

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### Chat

- `GET /api/chat/messages` - Get all messages (protected)
- `POST /api/chat/messages` - Send a message (protected)

## Socket.IO Events

- `connection` - User connects
- `join` - User joins chat
- `chatMessage` - Send message
- `message` - Receive message
- `disconnect` - User disconnects
