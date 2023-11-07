import express, { response } from 'express';
import { Product } from '../models/product.js';
import { User } from '../models/user.js';
import { Post } from '../models/post.js';

const router = express.Router();

router.post('/addtocart/:id', async (req, res) => {
  const userId = req.params.id;
  const productId = req.body.item;
  const price = productId.price;

  try {
    console.log("Received userId:", userId);
    console.log("Received productId:", productId);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $inc: { cart: 1 },
        $push: { items: productId },
        $addToSet: { checkout: price },
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

router.get('/checkout/:id', async (req, res) => {
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
    post.userId = id; // Set the userId property on the 'post' instance
    try{
      await post.save();
      res.status(200).send(post);
    }catch(error){
      console.log(error);
      res.status(500).send({message : "Error Occurred"});
    }
})
  
router.get('/:id' , async (req , res) => {
    const userId = req.params.id;
    try{
        const products = await Product.find({userId});
        const posts = await Post.find({userId});
        if (!posts) {
          return res.status(404).send({ message: 'No posts uploaded' });
        }
        if(!products){
            res.status(404).send({message : "No Product Uploaded"});
        }
        res.status(200).send({posts , products});
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
    if (post.likes.includes(user.id)) {
      post.likes = post.likes.filter(likedUserId => likedUserId !== user.id);
    } else {
      post.likes.push(user.id);
    }
    await post.save();
    res.status(200).send(post);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: 'An internal server error has occurred' });
  }
});


// Bunnylikescarrot1!

export default router;