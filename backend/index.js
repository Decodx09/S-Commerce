import dotenv from 'dotenv';
import mongoose from 'mongoose';
import express from 'express';
import { PORT, mongoDURL } from './config.js';
import commerce from './routes/commerce.js';
import user from './routes/user.js';
import cors from 'cors';
import session from 'express-session';
import mysql from 'mysql';
import http from 'http';
import path from 'path';
import {Server} from 'socket.io';

const app = express();
const server = http.createServer(app);
const io = new Server(server);

io.on('connection', (socket) => {
    socket.on('user-message' , (message) => {
        console.log("A new User message has arrived" , message);
        io.emit("message",message);
    })
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

app.use(session({
  secret: 'shivansh',
  resave: false,
  saveUninitialized: true,
}));

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

app.get('/getproduct/:id', async (req, res) => {
  try {
    const id = req.params.id;
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

    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An Error Occurred' });
  }
});

app.use('/product', commerce);
app.use('/user', user);

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

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    message: 'Internal Server Error',
    error: err.message,
  });
});
