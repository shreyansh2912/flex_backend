require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const redis = require('./config/redis');
const { connectDB } = require('./config/database');
const WordCloudSession = require('./models/wordCloudSession.model');
const apiRoutes = require('./routes');
const uploadRoutes = require('./routes/upload.routes');

const app = express();

app.use(express.json());

// CORS Configuration
app.use(cors({
  origin: (origin, callback) => {
    callback(null, true);
  },
  credentials: true,
}));

app.use(helmet());
app.use(morgan('dev'));

app.use('/uploads', express.static('uploads'));
app.use('/api/upload', uploadRoutes);
app.use('/api', apiRoutes);

app.get('/', (req, res) => {
  res.status(200).send('Welcome to FLEX');
});

// Error Handling
app.use((req, res, next) => {
  res.status(404).send("Sorry can't find that!");
});

const errorHandler = require('./middlewares/errorHandler');
app.use(errorHandler);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      callback(null, true);
    },
    methods: ["GET", "POST"],
    credentials: true
  },
  path: "/socket.io/",
  transports: ['websocket', 'polling']
});

const JWT_SECRET = process.env.JWT_SECRET;

// Socket Middleware
io.use((socket, next) => {
  console.log('Socket middleware hit. Handshake auth:', socket.handshake.auth);
  const token = socket.handshake.auth?.token;

  if (!token) {
    console.log('No token provided, allowing anonymous connection');
    // Allow anonymous connection for participants
    socket.user = { _id: 'anonymous', name: 'Anonymous' };
    return next();
  }

  console.log('Token provided, verifying...');
  const cleanToken = token.toString().replace(/^Bearer\s+/i, '').trim();

  jwt.verify(cleanToken, JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error('Token verification failed:', err.message);
      return next(new Error('Invalid token'));
    }
    console.log('Token verified for user:', decoded._id);
    socket.user = decoded;
    next();
  });
});

io.on('connection', (socket) => {
  console.log('User connected successfully:', socket.id, 'User:', socket.user?.id || 'unknown');

  socket.on('disconnect', (reason) => {
    console.log('User disconnected:', socket.id, 'Reason:', reason);
  });

  // Join a specific session room
  socket.on('joinSession', async (sessionId) => {
    socket.join(sessionId);
    const msg = `User ${socket.user?.id} joined session ${sessionId}`;
    console.log(msg);
    socket.emit('debug', msg);

    // Send current session state
    try {
      const session = await WordCloudSession.findById(sessionId);
      if (session) {
        socket.emit('sessionState', session);
      } else {
        socket.emit('error', 'Session not found');
      }
    } catch (err) {
      console.error('Error fetching session:', err);
      socket.emit('error', 'Error fetching session');
    }
  });

  // Host starts the session
  socket.on('startSession', async (sessionId) => {
    const log = (msg) => {
      console.log(msg);
      socket.emit('debug', msg);
    };

    log(`Received startSession event for: ${sessionId}`);

    try {
      const session = await WordCloudSession.findById(sessionId);

      if (!session) {
        log(`Session not found for ID: ${sessionId}`);
        socket.emit('error', 'Session not found');
        return;
      }

      // BYPASS HOST CHECK FOR DEBUGGING
      const isHost = true; // session.hostId.toString() === socket.user?._id;
      log(`Host check: SessionHost=${session.hostId}, SocketUser=${socket.user?._id}, Match=${isHost} (BYPASSED)`);

      if (isHost) {
        session.status = 'active';
        session.startTime = new Date();
        session.endTime = new Date(Date.now() + session.timeLimit * 1000);
        await session.save();

        log(`Session started, broadcasting to room: ${sessionId}`);

        io.to(sessionId).emit('sessionStarted', {
          startTime: session.startTime,
          endTime: session.endTime
        });

        // Auto-end session
        setTimeout(async () => {
          session.status = 'completed';
          await session.save();
          io.to(sessionId).emit('sessionEnded', session);
        }, session.timeLimit * 1000);
      } else {
        log('Unauthorized start attempt');
        socket.emit('error', 'You are not the host of this session');
      }
    } catch (err) {
      console.error('Error starting session:', err);
      socket.emit('error', 'Internal server error');
    }
  });

  // Submit a word
  socket.on('submitWord', async ({ sessionId, word }) => {
    const cleanWord = word.trim().toLowerCase();
    if (!cleanWord || cleanWord.length > 50) return;

    try {
      const session = await WordCloudSession.findById(sessionId);
      if (session && session.status === 'active') {
        const existingWord = session.words.find(w => w.text === cleanWord);
        if (existingWord) {
          existingWord.count += 1;
          existingWord.timestamp = new Date();
        } else {
          session.words.push({ text: cleanWord, count: 1, userId: socket.user?._id });
        }
        await session.save();

        // Broadcast update to room
        io.to(sessionId).emit('wordUpdate', session.words);
        io.to(sessionId).emit('newWord', { text: cleanWord, timestamp: new Date(), user: socket.user?.name || 'Anonymous' });
      }
    } catch (err) {
      console.error('Error submitting word:', err);
    }
  });
});

// Start Everything
const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connectDB();
    console.log('MongoDB connected');

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Socket.IO ready`);
    });
  } catch (err) {
    console.error('Failed to start:', err);
    process.exit(1);
  }
};

startServer();

module.exports = app;