import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import Message from './models/Message.js';
import chatRoutes from './routes/chatRoutes.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import itemRoutes from './routes/itemRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Middleware
const cors = require('cors');

// Add this to your middleware section
app.use(cors({
    origin: ["http://localhost:5173", "https://your-future-vercel-app.vercel.app"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));
app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  next();
});

// API Routing
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/items', itemRoutes);
app.use('/api', chatRoutes);

// Socket.io Setup — must come BEFORE use of io/server
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "http://localhost:5173", methods: ["GET", "POST"] }
});

io.on('connection', (socket) => {
  socket.on('join_room', (room) => {
    socket.join(room);
  });

  socket.on('send_message', async (data) => {
    try {
      await Message.create({
        room:       data.room,
        senderId:   data.senderId,
        senderName: data.senderName,
        text:       data.text
      });
    } catch (err) {
      console.error("Failed to save message:", err);
    }
    socket.to(data.room).emit('receive_message', data);
  });
});

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    server.listen(PORT, () => console.log(`Server running on ${PORT}`));
  })
  .catch(err => console.error("Database Connection Error:", err));