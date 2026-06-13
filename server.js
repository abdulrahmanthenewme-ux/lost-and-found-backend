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

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://lost-and-found-frontend-five-mocha.vercel.app",
  "https://lost-and-found-frontend-i0h3c5puj-abdulrahman-s-projects16.vercel.app",
  process.env.FRONTEND_URL
].filter(Boolean);  // ✅ removes undefined if FRONTEND_URL isn't set

app.use(cors({
  origin: (origin, callback) => {
    // ✅ allow requests with no origin (Render health checks, Postman, etc.)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked: ${origin}`));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/items', itemRoutes);
app.use('/api', chatRoutes);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Socket CORS blocked: ${origin}`));
      }
    },
    methods: ["GET", "POST"],
    credentials: true
  }
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

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    server.listen(PORT, () => console.log(`Server running on ${PORT}`));
  })
  .catch(err => console.error("Database Connection Error:", err));