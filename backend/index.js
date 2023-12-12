import express from 'express';
import session from 'express-session';
import createError from 'http-errors'
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
import expressSession from 'express-session';
import passport from 'passport';
import ejs from 'ejs';
import axios from 'axios';

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.set('view engine', 'ejs');
app.set('views' , path.resolve("../views"))

app.use(express.json());
app.use(express.urlencoded({ extended: true })); 
app.use(express.static(path.resolve('./public')));
app.use(cors());

const sqlConnection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'shivansh',
  database: 'my_database',
});

dotenv.config();

app.get('/register', (req, res) => {
  try{
    res.render('home.ejs');
  }catch{
    res.render('error.ejs' , {error : 'Server is down babe'})
  }
});

app.get('/login', (req, res) => {
  try{
    res.render('login.ejs')
  }catch{
    res.render('error.ejs' , {error : 'Server is down babe'})
  }
});

app.get('/search' , (req , res) => {
  try{
    res.render('search.ejs');
  }catch{
    res.render('error.ejs' , {error : 'Server is down babe'})
  }
})

app.get('/profile/:userId', async (req, res) => {
  const userId = req.params.userId;
  try {
    const response = await axios.get(`http://localhost:5554/product/${userId}`);
    if (response.data.products && response.data.products.length > 0) {
      const profile = response.data.products[0];
      res.render('profile.ejs', { user: response.data, profile: profile });
    } else {
      res.render('error.ejs', { error: 'No profile data found' });
    }
  } catch (error) {
    console.error('Axios Error:', error.message);
    if (error.code === 'ECONNRESET') {
      res.render('error.ejs', { error: 'Connection to the server was reset' });
    } else {
      res.render('error.ejs', { error: 'An error occurred while fetching data' });
    }
  }
});

app.use('/product', commerce);
app.use('/user', user);
app.use('/rental', rental);

app.use(expressSession({
  resave: false,
  saveUninitialized: false,
  secret: "hey"
}));

app.use(passport.initialize());
app.use(passport.session());
// passport.serializeUser(user.serializeUser());
// passport.deserializeUser(user.deserializeUser());

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
