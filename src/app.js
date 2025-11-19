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

const app = express();

app.use(express.json());
app.use(cors({
  origin: '*',
  credentials: true,
}));
app.use(helmet());
app.use(morgan('dev'));

const apiRoutes = require('./routes');
app.use('/api', apiRoutes);

app.get('/', (req, res) => {
    res.status(200).send('Welcome to FLEX');
    });

app.use((req, res, next) => {
    res.status(404).send("Sorry can't find that!");
    });

const errorHandler = require('./middlewares/errorHandler');
app.use(errorHandler);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true 
  },
  path: "/socket.io/",
  transports: ['websocket', 'polling']
});

const JWT_SECRET = process.env.JWT_SECRET;

const wordCounts = new Map();

io.use((socket, next) => {
  const token = socket.handshake.auth?.token;

  if (!token) return next(new Error('No token'));

  const cleanToken = token.toString().replace(/^Bearer\s+/i, '').trim();
  
  jwt.verify(cleanToken, JWT_SECRET, (err, decoded) => {
    console.log(err);
    if (err) return next(new Error('Invalid token'));
    socket.user = decoded;
    next();
  });
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.user?.id || 'unknown');

  socket.emit('initialWords', Array.from(wordCounts.entries()).map(([t, v]) => ({ text: t, value: v })));

  socket.on('submitWord', async (word) => {
    const cleanWord = word.trim().toLowerCase();
    if (!cleanWord || cleanWord.includes(' ') || cleanWord.length > 50) return;

    const key = `wordcloud:${cleanWord}`;

    try {
      const count = await redis.incr(key);

      if (count === 1) {
        await redis.expire(key, 60);
      }

      const keys = await redis.keys('wordcloud:*');
      const wordsData = [];

      for (const k of keys) {
        const value = await redis.get(k);
        if (value) {
          wordsData.push({
            text: k.replace('wordcloud:', ''),
            value: parseInt(value),
          });
        }
      }

      // Sort by count (optional, looks better)
      wordsData.sort((a, b) => b.value - a.value);

      // Send to ALL users
      io.emit('wordCloudUpdate', wordsData);

    } catch (err) {
      console.error('Redis error:', err);
    }
  });
});

// Start Everything
const PORT = process.env.PORT || 5001;

const startServer = async () => {
  try {
    await connectDB();
    console.log('MongoDB connected');

    server.listen(PORT, () => {
      console.log(`Server running`);
      console.log(`Socket.IO ready`);
    });
  } catch (err) {
    console.error('Failed to start:', err);
    process.exit(1);
  }
};

startServer();

module.exports = app;