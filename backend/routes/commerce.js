import express, { response } from 'express';
import { Product } from '../models/product.js';
import { User } from '../models/user.js';
import { Post } from '../models/post.js';
import { OrderItem } from '../models/orderitem.js';
import {Rental} from '../models/rental.js';

const router = express.Router();

router.post('/addtocart/:id' , async (req, res) => {
  const userId = req.params.id;
  const productId = req.body.item;
  const quantity = parseInt(req.query.quantity, 10);
  
  try {
    console.log("Received userId:", userId);
    console.log("Received productId:", productId);

    if (isNaN(quantity) || quantity <= 0) {
      return res.status(400).json({ error: "Invalid Quantity" });
    }

    const user = await User.findById(userId);
    if (!user) {
      console.log("User Doesn't Exist");
      return res.status(404).json({ message: "User Doesn't Exist" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      console.log("Product Doesn't Exist");
      return res.status(404).json({ message: "Product Doesn't Exist" });
    }

    const price = product.price;

    console.log("Price:", price);
    console.log("Quantity:", quantity);

    const totalPrice = (price * quantity);

    // Create a new OrderItem and save it to obtain the _id
    const newOrderItem = new OrderItem({
      quantity: quantity,
      product: productId,
    });

    const orderItemResolved = await newOrderItem.save();

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $inc: { cart: 1 },
        $push: { items: orderItemResolved._id },
        $addToSet: { checkout: totalPrice },
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.sendStatus(404);
    } else {
      return res.status(200).json({ totalPrice });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send("An Internal Server Error has Occurred");
  }
});

// Function to check if a string is a valid MongoDB ObjectId

router.get('/checkout/:id' , async (req, res) => {
  const userId = req.params.id;
  try {
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).send({ message: "User Not Found" });
    } else {
      res.status(200).send(user.checkout);
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "An Internal Server Error has Occurred" });
  }
});

router.post('/:id', async (req, res) => {
    const { id } = req.params;
    const product = new Product(req.body);
    product.userId = id;
    try {
      await product.save();
      res.status(200).send(product);
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: 'An Internal Error Occurred While Saving The Product' });
    }
  });

router.post('/post/:id' , async (req , res) => {
    const { id } = req.params;
    const post = new Post(req.body);
    post.userId = id; 
    try{
      await post.save();
      res.status(200).send(post);
    }catch(error){
      console.log(error);
      res.status(500).send({message : "Error Occurred"});
    }
})

router.delete('/post/:id' , async (req , res) => {
  const post = await Post.findById(req.params.id);
  try{
      if(!post){
        console.log("Either Post doesn't exist or deleted earlier");
        return res.status(404).send({ message: "Post not found" });
      }
      await post.remove();
  }catch(error){
    console.log(error);
    res.status(500).send({message : "An Internal Server has Occcurred"});
  }
})

router.delete('/:id' , async (req , res) => {
  const product = await Product.findById(req.params.id);
  try{
    if(!product){
      console.log("Either Product has been deleted or doesn't exist");
      return res.status(404).send({message : "Product has been deleted or didn't exist"});
    }
    await product.remove();
  }catch(error){
    res.status(500).send({message : "An Internal Server has Occurred"});
  }
})

router.get('/:id' , async (req , res) => {
    const userId = req.params.id;
    try{
        const products = await Product.find({userId}).select('name description price -_id');
        const posts = await Post.find({userId}).select('caption post -_id');
        const property = await Rental.find({userId}).select('title description location -_id');
        if (!posts) {
          return res.status(404).send({ message: 'No posts uploaded' });
        }
        if(!products){
            res.status(404).send({message : "No Product Uploaded"});
        }
        res.status(200).send({posts , products , property});
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
        },{ name: 1, description:1, price:1 , _id:0});
      } else if (hot) {
          products = await Product.find().sort({ createdAt: -1 }).limit(10);
      } else if (category) {
          products = await Product.find({ tags : category },{ name:1, description:1, price:1 , _id:0});
      } else {
          products = await Product.find({},{ name:1, description:1, price:1 , _id:0});
      }

      res.status(200).json(products);
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});


router.post('/post/like/:id', async (req, res) => {
  const postId = req.params.id;
  const userId = req.query.userid;

  try {
    const post = await Post.findById(postId);
    const user = await User.findById(userId);

    if (!post || !user) {
      return res.status(404).send({ message: 'Post or user not found' });
    }

    if (!Array.isArray(post.likes)) {
      post.likes = [];
    }

    const userIndex = post.likes.indexOf(user.FirstName);
    if (userIndex !== -1) {
      post.likes.splice(userIndex, 1);
    } else {
      post.likes.push(user.FirstName);
    }

    await post.save();
    res.status(200).send(post);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: 'An internal server error has occurred' });
  }
});


router.post('/comment/:id' , async (req , res) => {
  const comment = req.body.comment;
  const postId = req.params.id;

  const post = await Post.findById(postId);
  
  try{
    if(!post){
      return res.status(404).send({message : 'Post does not exist'});
    }

    if(!post.comments){
      post.comments = []
    }
    
    post.comments.push(comment);
    await post.save();
    res.status(200).send(post);
  }catch(error){
    console.log(error);
    res.status(500).send({message : "An Error Occurred"});
  }
})

// Bunnylikescarrot1!

export default router;