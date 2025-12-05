require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const http = require('http');
const { connectDB } = require('./config/database');
const uploadRoutes = require('./routes/upload.routes');
const apiRoutes = require('./routes');

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

app.get('/health', (req, res) => {
  res.sendStatus(200);
});

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

const { initSocket } = require('./socket');
initSocket(server);

const PORT = process.env.PORT || 3000;

module.exports = server;