import express , {response} from 'express';
import { Product } from '../models/product.js';
import { User } from '../models/user.js';
import { Post } from '../models/post.js';
import { OrderItem } from '../models/orderitem.js';
import { Rental } from '../models/rental.js';
import redis from 'redis';
import util from 'util';

const router = express.Router();

router.delete('/:id' , async (req , res) => {
    const rental = await Rental.findById(req.params.id);
    try{
        if(!rental){
            console.log("Property doesn't exist");
            return res.status(404).send({message : "Rental Property doesn't exist or has been deleted earlier"});
        }
        await rental.remove();
        res.status(200).send({message : "Property has been deleted successfully"});
    }catch(error){
        console.log(error);
        res.status(500).send({message : "An Internal Server has Occured"});
    }
});

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
});

const client = redis.createClient({
    host: 'localhost',
    port: 6379,
  });

const getAsync = util.promisify(client.get).bind(client);

router.get('/', async (req, res) => {
    try {
      const cachedData = await getAsync('rental_data');
      if (cachedData) {
        res.status(200).send(JSON.parse(cachedData));
      } else {
        const rooms = await Rental.find();
        client.setex('rental_data', 60, JSON.stringify(rooms));
        res.status(200).send(rooms);
      }
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: 'Internal Server Error' });
    }
  });

export default router;