import express from 'express';
import session from 'express-session';
import http from 'http';
import path from 'path';
import { Server } from 'socket.io';
import mysql from 'mysql';
import redis from 'redis';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import { PORT, mongoDURL } from './config.js';
import commerce from './routes/commerce.js';
import user from './routes/user.js';
import rental from './routes/rental.js';

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Redis client setup
const redisClient = redis.createClient(); // Initialize the Redis client

const cacheMiddleware = (req, res, next) => {
  const key = req.originalUrl || req.url;

  // Check the cache
  redisClient.get(key, (err, data) => {
    if (err) {
      console.error(`Error checking cache: ${err}`);
      next();
    }

    if (data) {
      // Data found in cache, send it back
      res.json(JSON.parse(data));
    } else {
      // Data not found in cache, proceed to the next middleware
      next();
    }
  });
};

io.on('connection', (socket) => {
  socket.on('user-message', (message) => {
    console.log('A new User message has arrived', message);
    io.emit('message', message);
  });
});

app.use(express.json());
app.use(express.static(path.resolve('./public')));
app.use(cors());

const sqlConnection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'shivansh',
  database: 'my_database',
});

app.use(
  session({
    secret: 'shivansh',
    resave: false,
    saveUninitialized: true,
  })
);

dotenv.config();

app.get('/', (req, res) => {
  res.sendFile(path.resolve('./public/index.html'));
});

app.post('/shivansh', async (req, res) => {
  try {
    const product = req.body;
    await sqlConnection.query(
      'INSERT INTO products (name, description, price) VALUES (?, ?, ?)',
      [product.name, product.description, product.price]
    );
    res.status(201).json({ message: 'Product Added Successfully', product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An Error Occurred' });
  }
});

app.get('/getproduct/:id', cacheMiddleware, async (req, res) => {
  try {
    const id = req.params.id;

    const cachedData = await new Promise((resolve, reject) => {
      redisClient.get(`product:${id}`, (err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });

    if (cachedData) {
      res.json(JSON.parse(cachedData));
      return;
    }

    const product = await new Promise((resolve, reject) => {
      sqlConnection.query('SELECT * FROM products WHERE id = ?', [id], (error, results) => {
        if (error) reject(error);
        else resolve(results[0]);
      });
    });

    if (!product) {
      res.status(404).json({ message: 'Product Not Found' });
      return;
    }

    redisClient.setex(`product:${id}`, 3600, JSON.stringify(product));
    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An Error Occurred' });
  }
});

app.use('/product', commerce);
app.use('/user', user);
app.use('/rental', rental);

mongoose
  .connect(mongoDURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Application is Connected to the Database');
    server.listen(PORT, () => {
      console.log(`Application is listening to ${PORT}`);
    });
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
