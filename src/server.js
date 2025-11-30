const server = require('./app');
require('dotenv').config();
const { connectDB } = require('./config/database');

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  console.log('Starting server...');
  try {
    console.log('Connecting to DB...');
    await connectDB();
    console.log('DB Connected. Listening on port', PORT);
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Error starting server:', err);
  }
};

startServer();