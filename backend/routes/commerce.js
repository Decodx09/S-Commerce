import express, { response } from 'express';
import { Product } from '../models/product.js';
import { User } from '../models/user.js';

const router = express.Router();

router.post('/addtocart/:id', async (req, res) => {
  const userId = req.params.id;
  const productId = req.body.item;
  try {
    console.log("Received userId:", userId);
    console.log("Received productId:", productId);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $inc: { cart: 1 },
        $push: { items: productId },
      },
      { new: true }
    );

    if (!updatedUser) {
      res.status(404).send({ message: "User Not Found" });
    } else {
      res.status(200).send(updatedUser);
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "An Internal Server Error has Occurred" });
  }
});


router.post('/:id', async (req, res) => {
    const {id} = req.params;
    const product = new Product(req.body);
    product.userId = id;
    try {
      res.status(200).send(product);
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: 'An internal error occurred while saving the product' });
    }
  });

router.get('/:id' , async (req , res) => {
    const userId = req.params.id;
    try{
        const products = await Product.find({userId});
        if(!products){
            res.status(404).send({message : "No Product Uploaded"});
        }
        res.status(200).send(products);
    }catch(error){
        console.log(error);
        res.status(500).send({message : "Internal Server Error"});
    }
})

router.get('/', async (req, res) => {
  const search = req.query.search || '';
  const hot = req.query.hot || '';
  const category = req.query.category || '';

  try {
      let products;
      if (search) {
        products = await Product.find({
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
          ],
        });
      } else if (hot) {
          products = await Product.find().sort({ createdAt: -1 }).limit(10);
      } else if (category) {
          products = await Product.find({ tags : category });
      } else {
          products = await Product.find();
      }

      res.status(200).json(products);
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});


export default router;