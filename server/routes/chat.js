const express = require('express');
const Message = require('../models/Message');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const router = express.Router();

// Get all users (excluding current user)
router.get('/users', protect, async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user.userId } }).select(
      'username email'
    );
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get conversation between two users
router.get('/messages/:userId', protect, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.userId;

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: userId },
        { sender: userId, receiver: currentUserId },
      ],
    })
      .populate('sender', 'username')
      .populate('receiver', 'username')
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a private message
router.post('/messages', protect, async (req, res) => {
  try {
    const { receiverId, text } = req.body;
    const senderId = req.user.userId;

    const message = await Message.create({
      sender: senderId,
      receiver: receiverId,
      text,
    });

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'username')
      .populate('receiver', 'username');

    res.status(201).json(populatedMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark messages as read
router.put('/messages/:userId/read', protect, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.userId;

    await Message.updateMany(
      {
        sender: userId,
        receiver: currentUserId,
        read: false,
      },
      { read: true }
    );

    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
