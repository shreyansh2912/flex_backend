const app = require('./app');
require('dotenv').config();
const { connectDB } = require('./config/database');

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  await connectDB();
  // app.listen(PORT, () => {
  //   console.log(`Server running on port ${PORT}`);
  // });
};

startServer();


module.exports = app;