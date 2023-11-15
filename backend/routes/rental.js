import express , {response} from 'express';
import { Product } from '../models/product.js';
import { User } from '../models/user.js';
import { Post } from '../models/post.js';
import { OrderItem } from '../models/orderitem.js';
import { Rental } from '../models/rental.js';

const router = express.Router();

router.post('/:id' , async (req , res) => {
    const user = await User.findById(req.params.id);

    try{
        if(!user){
            console.log("User doesn't exist");
            return res.status(404).send({ message: "User doesn't exist" });
        }
        const newVenue = await Rental.create({
            ...req.body,
            landlord : user
        });
        console.log(newVenue);
        res.status(201).send({message : "Property Added Successfully"});
    }catch(error){
        console.log(error);
        res.status(500).send({message : 'An Error Occurred'});
    }
})

router.get('/' , async (req , res) => {

    try{

    }catch(error){
        res.status(500).send({message : "Internal Server Error"});
        console.log(error);
    }
})

export default router;