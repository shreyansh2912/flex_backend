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
const uploadRoutes = require('./routes/upload.routes');
const WordCloudSession = require('./models/wordCloudSession.model');
const PollSession = require('./models/pollSession.model');
const QnASession = require('./models/qnaSession.model');
const User = require('./models/user.model');
const mongoose = require('mongoose');
const apiRoutes = require('./routes');

let filter;
try {
  const Filter = require('bad-words');
  filter = new Filter();
  console.log('Using bad-words npm package');
} catch (err) {
  console.log('bad-words package not found, using local fallback');
  filter = null;
}

const BAD_WORDS_LOCAL = ['badword1', 'badword2', 'damn', 'hell', 'shit', 'fuck', 'bitch'];
const isProfane = (text) => {
  if (filter) return filter.isProfane(text);
  return BAD_WORDS_LOCAL.some(word => text.toLowerCase().includes(word));
};

const app = express();

app.use(express.json({ limit: '10mb' }));
app.use(cors({
  origin: (origin, callback) => callback(null, true),
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

// 404 handler
app.use((req, res, next) => {
  res.status(404).send("Sorry can't find that!");
});

const errorHandler = require('./middlewares/errorHandler');
app.use(errorHandler);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => callback(null, true),
    methods: ["GET", "POST"],
    credentials: true
  },
  path: "/socket.io/",
  transports: ['websocket', 'polling']
});

const JWT_SECRET = process.env.JWT_SECRET;

// Socket.io Authentication Middleware
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  const guestId = socket.handshake.auth?.guestId;

  if (!token) {
    socket.user = { _id: guestId || 'anonymous', name: 'Anonymous' };
    return next();
  }

  const cleanToken = token.toString().replace(/^Bearer\s+/i, '').trim();

  jwt.verify(cleanToken, JWT_SECRET, (err, decoded) => {
    if (err) {
      // If token is invalid, fallback to anonymous instead of erroring
      socket.user = { _id: guestId || 'anonymous', name: 'Anonymous' };
      return next();
    }
    socket.user = decoded;
    // Map userId to _id if present (from auth controller)
    if (socket.user.userId && !socket.user._id) {
      socket.user._id = socket.user.userId;
    }
    // Attach guestId to socket user for dual-auth checks
    if (guestId) {
      socket.user.guestId = guestId;
    }
    next();
  });
});

// Helper to enrich session with host profile
const enrichSessionWithHostProfile = async (session) => {
  if (session.hostId && mongoose.Types.ObjectId.isValid(session.hostId)) {
    try {
      const user = await User.findById(session.hostId).select('name profileImage qrColor');
      if (user) {
        return { ...session.toObject(), hostProfile: user };
      }
    } catch (err) {
      console.error('Error fetching host profile:', err);
    }
  }
  return session; // Return as is if not found or error
};

// Main connection handler
io.on('connection', (socket) => {

  socket.on('disconnect', (reason) => {
    // User disconnected
  });

  // Helper to check if user is host
  const isHost = (session) => {
    const userId = socket.user._id;
    const guestId = socket.user.guestId;
    const hostId = session.hostId.toString();
    return hostId === userId || (guestId && hostId === guestId);
  };

  // ====================== WORD CLOUD ======================
  socket.on('joinSession', async (sessionId) => {
    socket.join(sessionId);
    try {
      const session = await WordCloudSession.findById(sessionId);
      if (session) {
        const enrichedSession = await enrichSessionWithHostProfile(session);
        socket.emit('sessionState', enrichedSession);
      }
      else socket.emit('error', 'Session not found');
    } catch (err) {
      console.error('Error fetching wordcloud session:', err);
      socket.emit('error', 'Error fetching session');
    }
  });

  socket.on('startSession', async (sessionId) => {
    try {
      const session = await WordCloudSession.findById(sessionId);
      if (!session) return socket.emit('error', 'Session not found');

      if (!isHost(session)) return socket.emit('error', 'You are not the host');

      session.status = 'active';
      session.startTime = new Date();
      session.endTime = new Date(Date.now() + session.timeLimit * 1000);
      await session.save();

      io.to(sessionId).emit('sessionStarted', {
        startTime: session.startTime,
        endTime: session.endTime
      });

      setTimeout(async () => {
        session.status = 'completed';
        await session.save();
        io.to(sessionId).emit('sessionEnded', session);
      }, session.timeLimit * 1000);
    } catch (err) {
      console.error('Error starting session:', err);
      socket.emit('error', 'Internal server error');
    }
  });

  socket.on('submitWord', async ({ sessionId, word }) => {
    const cleanWord = word.trim().toLowerCase();
    if (!cleanWord || cleanWord.length > 50) return;

    const userId = socket.user?._id || socket.id;
    const rateLimitKey = `rate_limit:${userId}`;

    try {
      const limited = await redis.get(rateLimitKey);
      if (limited) return socket.emit('error', 'Please wait before submitting again.');
      await redis.set(rateLimitKey, '1', { ex: 2 });
    } catch (err) {
      console.error('Redis rate limit error:', err);
    }

    if (isProfane(cleanWord)) return socket.emit('error', 'Please use appropriate language.');

    try {
      const session = await WordCloudSession.findById(sessionId);
      if (!session || session.status !== 'active') return;

      const existing = session.words.find(w => w.text === cleanWord);
      if (existing) {
        existing.count += 1;
        existing.timestamp = new Date();
      } else {
        session.words.push({ text: cleanWord, count: 1, userId: socket.user?._id });
      }
      await session.save();

      io.to(sessionId).emit('wordUpdate', session.words);
      io.to(sessionId).emit('newWord', {
        text: cleanWord,
        timestamp: new Date(),
        user: socket.user?.name || 'Anonymous'
      });
    } catch (err) {
      console.error('Error submitting word:', err);
    }
  });

  // ====================== POLL ======================
  socket.on('joinPoll', async ({ pollId, name }) => {
    socket.join(pollId);

    // Update user name if provided
    if (name) {
      socket.user.name = name;
    }

    try {
      const session = await PollSession.findById(pollId);
      if (session) {
        const enrichedSession = await enrichSessionWithHostProfile(session);
        socket.emit('pollState', enrichedSession);
      }
      else socket.emit('error', 'Poll not found');
    } catch (err) {
      console.error('Error joining poll:', err);
    }
  });

  socket.on('createPoll', async ({ question, options, hostId }) => {
    try {
      const session = new PollSession({
        hostId: hostId || socket.user._id,
        question,
        options: options.map(text => ({ text, count: 0 })),
        status: 'waiting'
      });
      await session.save();
      socket.emit('pollCreated', session._id);
    } catch (err) {
      console.error('Error creating poll:', err);
      socket.emit('error', 'Failed to create poll');
    }
  });

  socket.on('startPoll', async (pollId) => {
    try {
      const session = await PollSession.findById(pollId);
      if (!session) {
        return;
      }

      if (isHost(session)) {
        session.status = 'active';
        await session.save();
        io.to(pollId).emit('pollStarted', session);
      } else {
        console.log('Authorization failed: Host mismatch');
      }
    } catch (err) {
      console.error('Error starting poll:', err);
    }
  });

  socket.on('votePoll', async ({ pollId, optionIndex }) => {
    try {
      const session = await PollSession.findById(pollId);
      if (session && session.status === 'active' && session.options[optionIndex] !== undefined) {
        session.options[optionIndex].count += 1;
        await session.save();
        io.to(pollId).emit('pollUpdate', session);
      }
    } catch (err) {
      console.error('Error voting:', err);
    }
  });

  socket.on('endPoll', async (pollId) => {
    try {
      const session = await PollSession.findById(pollId);
      if (session && isHost(session)) {
        session.status = 'completed';
        await session.save();
        io.to(pollId).emit('pollEnded', session);
      }
    } catch (err) {
      console.error('Error ending poll:', err);
    }
  });

  // ====================== Q&A ======================
  socket.on('joinQnA', async (qnaId) => {
    socket.join(qnaId);
    try {
      const session = await QnASession.findById(qnaId);
      if (session) {
        const enrichedSession = await enrichSessionWithHostProfile(session);
        socket.emit('qnaState', enrichedSession);
      }
      else socket.emit('error', 'Q&A not found');
    } catch (err) {
      console.error('Error joining Q&A:', err);
    }
  });

  socket.on('createQnA', async ({ hostId } = {}) => {
    try {
      const session = new QnASession({
        hostId: hostId || socket.user?._id || 'anonymous',
        status: 'active'
      });
      await session.save();
      socket.emit('qnaCreated', session._id);
    } catch (err) {
      console.error('Error creating Q&A:', err);
      socket.emit('error', 'Failed to create Q&A');
    }
  });

  socket.on('askQuestion', async ({ qnaId, text }) => {
    if (isProfane(text)) return socket.emit('error', 'Please use appropriate language.');
    try {
      const session = await QnASession.findById(qnaId);
      if (session && session.status === 'active') {
        session.questions.push({
          text,
          upvotes: 0,
          isAnswered: false,
          createdAt: new Date()
        });
        await session.save();
        io.to(qnaId).emit('qnaUpdate', session);
      }
    } catch (err) {
      console.error('Error asking question:', err);
    }
  });

  socket.on('upvoteQuestion', async ({ qnaId, questionId }) => {
    try {
      const session = await QnASession.findById(qnaId);
      if (session && session.status === 'active') {
        const q = session.questions.id(questionId);
        if (q) {
          q.upvotes += 1;
          await session.save();
          io.to(qnaId).emit('qnaUpdate', session);
        }
      }
    } catch (err) {
      console.error('Error upvoting:', err);
    }
  });

  socket.on('markAnswered', async ({ qnaId, questionId }) => {
    try {
      const session = await QnASession.findById(qnaId);
      if (session && isHost(session)) {
        const q = session.questions.id(questionId);
        if (q) {
          q.isAnswered = true;
          await session.save();
          io.to(qnaId).emit('qnaUpdate', session);
        }
      } else {
        console.log('Authorization failed for markAnswered');
      }
    } catch (err) {
      console.error('Error marking answered:', err);
    }
  });
});

// ====================== START SERVER ======================
const PORT = process.env.PORT || 3000;

module.exports = server;