import { User } from "../models/user.js";
const express = require('express');
const app = express();

async function isAdmin(req , res , next){
    try{
        const user = await User.findById(req.params.id);
        if(!user && user.Admin){
            next();
        }else{
            res.status(403).send({message : "Unauthorized Admins Only"});
        }
    }catch(error){
        console.log(error);
        res.status(500).send({message : "Internal Server Error"});
    }
}

