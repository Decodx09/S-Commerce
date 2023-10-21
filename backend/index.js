import dotenv from 'dotenv';
import mongoose from "mongoose";
import express from "express";
import { mongoDURL, PORT } from "./config.js";
import commerce from "./routes/commerce.js";
import user from "./routes/user.js";
import cors from 'cors';
import session from 'express-session';

const app = express();
app.use(express.json());
app.use(cors());

app.use(session({
    secret : 'shivansh',
    resave : false,
    saveUninitialized : true
}))

dotenv.config();

app.use('/product', commerce);
app.use('/user', user);

mongoose
    .connect(mongoDURL)
    .then(() => {
        console.log('Application is Connected to the Database')
        app.listen(PORT , () => {
            console.log(`Application is listening to ${PORT}`);
        })
    })
    .catch((error) => {
        console.log(error);
        process.exit(1);
    })

app.use((err , req , res , next) => {
  console.error(err);
  res.status(500).json({
      message : 'Internal Server Error',
      error : err.message
  })
})

