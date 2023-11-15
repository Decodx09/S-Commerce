import express, { response } from 'express';

const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
  
    if (res.headersSent) {
      console.error('Headers already sent, cannot respond with error');
      return;
    }
  
    res.status(500).json({ message: "An Internal Error Occurred" });
  };
  
  app.use(errorHandler);
  
app.use(errorHandler);