import dotenv from 'dotenv';
import mongoose from "mongoose";
import express from "express";
import { mongoDURL, PORT } from "./config.js";
import commerce from "./routes/commerce.js";
import user from "./routes/user.js";
import cors from 'cors';
import session from 'express-session';
import mysql from 'mysql';

const app = express();
app.use(express.json());
app.use(cors());

const sqlConnection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'shivansh',
    database: 'my_database',
  });

app.use(session({
    secret : 'shivansh',
    resave : false,
    saveUninitialized : true
}))

dotenv.config();

app.post('/shivansh' , async (req , res) => {
    try{
        const product = req.body;
        res.status(201).send({message : "Product Added Successfully" , product});
        await sqlConnection.query('INSERT INTO products (name, description, price) VALUES (?, ?, ?)', [product.name, product.description, product.price]);
    }catch(error){
        console.log(error);
        res.status(500).send({message : "An Error Occurred"});
    }
})

app.get('/getproduct/:id' , async (req , res) => {
    try{
        const id = req.params.id;
        const product = await sqlConnection.query('SELECT * FROM products WHERE id = ?', [id]);
        if(!product){
            res.status(404).send({
                message : 'Product Not Found',
            });
            return;
        }
        res.send(product);
    }catch(error){
        console.log(error);
        res.status(500).send({message : "An Error Occurred"});
    }
})

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

