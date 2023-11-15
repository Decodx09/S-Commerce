import redis from 'redis';

// Create a Redis client
const redisClient = redis.createClient();

// Set a key-value pair
redisClient.set('testKey', 'Hello, Redis!', (err, reply) => {
  if (err) {
    console.error(`Error setting key: ${err}`);
  } else {
    console.log(`Key set successfully. Reply: ${reply}`);

    // Get the value for the key
    redisClient.get('testKey', (err, data) => {
      if (err) {
        console.error(`Error getting key: ${err}`);
      } else {
        console.log(`Value for 'testKey': ${data}`);
      }

      // Quit the Redis client
      redisClient.quit();
    });
  }
});