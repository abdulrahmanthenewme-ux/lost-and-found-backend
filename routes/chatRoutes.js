import express from 'express';
import Message from '../models/Message.js';

const router = express.Router();

// Get all messages for a room
router.get('/messages/:roomId', async (req, res) => {
  try {
    const messages = await Message.find({ room: req.params.roomId }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all chat rooms for a user
router.get('/chat-rooms/:userId', async (req, res) => {
  try {
    const rooms = await Message.aggregate([
      { $match: { $or: [{ senderId: req.params.userId }, { room: new RegExp(req.params.userId) }] } },
      { $group: { _id: '$room', lastMessage: { $last: '$text' }, senderName: { $last: '$senderName' }, updatedAt: { $last: '$createdAt' } } },
      { $sort: { updatedAt: -1 } }
    ]);

    // Remap _id to roomId so the frontend can use chat.roomId
    const formatted = rooms.map(r => ({
      roomId: r._id,
      lastMessage: r.lastMessage,
      senderName: r.senderName,
      updatedAt: r.updatedAt
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;