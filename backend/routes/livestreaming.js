const express = require('express');
const http = require('http');
const redis = require('redis');
const app = express();

const server = http.createServer(app);
const io = require('socket.io')(server);

const redisClient = redis.createClient();

// Serve the HTML page with a form for sending messages
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log('A user connected');

  // Subscribe to the 'live-stream' channel
  const redisSubscriber = redis.createClient();
  redisSubscriber.subscribe('live-stream');

  redisSubscriber.on('message', (channel, message) => {
    // Send the received message to all connected clients
    socket.emit('message', message);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('A user disconnected');
    redisSubscriber.unsubscribe('live-stream');
    redisSubscriber.quit();
  });
});

// Handle messages sent by the form
app.get('/send', (req, res) => {
  const message = req.query.message;

  if (message) {
    // Publish the message to the 'live-stream' channel
    redisClient.publish('live-stream', message);
  }

  res.send('Message sent: ' + message);
});

server.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
