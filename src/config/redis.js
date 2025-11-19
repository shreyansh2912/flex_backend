const Redis = require('ioredis');

let redis;

if (process.env.REDIS_URL && process.env.REDIS_TOKEN) {
  
  redis = new Redis({
    url: process.env.REDIS_URL,
    token: process.env.REDIS_TOKEN,
  })
}else{
  redis = new Redis(process.env.REDIS_URL);
}
  // Test connection
  redis.on('connect', () => {
    console.log('Redis connected successfully');
  });

  redis.on('error', (err) => {
    console.error('Redis connection error:', err.message);
  });

  module.exports = redis;