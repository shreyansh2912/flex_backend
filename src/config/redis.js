const Redis = require('ioredis');

let redis;

if (process.env.REDIS_URL) {
  // For production (Render, Railway, etc.)
  redis = new Redis(process.env.REDIS_URL);
} else {
  // Local development
  redis = new Redis({
    host: '127.0.0.1',
    port: 6379,
    // password: 'yourpassword', // uncomment if needed
  });
}

// Test connection
redis.on('connect', () => {
  console.log('Redis connected successfully');
});

redis.on('error', (err) => {
  console.error('Redis connection error:', err.message);
});

module.exports = redis;