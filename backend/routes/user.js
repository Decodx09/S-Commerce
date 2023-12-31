import express from 'express';
import { Product } from '../models/product.js';
import { User } from '../models/user.js';
import { Post } from '../models/post.js';
import { Rental } from '../models/rental.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
const router = express.Router();
import dotenv from 'dotenv';
// import errorHandler from '../middlewares/errorHandler';

dotenv.config();

const JWT_SECRET = 'shivansh';

router.get('/Admins', async (req, res) => {
  try {
    const users = await User.find({ Admin: true });
    const adminNames = users.map(user => ({FirstName : user.FirstName , LastName : user.LastName}));
    res.status(200).send(adminNames);
  } catch (error) {
    res.status(500).send({ message: "An Internal Error has Occurred" });
  }
});

router.get('/profile/:userId', async (req, res) => {
  const userID = req.params.userId;

  try {
    const products = await Product.find({ userID }).select('name description price -_id');
    const posts = await Post.find({ userId: userID }).select('caption post -_id');
    const property = await Rental.find({ userId: userID }).select('title description location -_id');
    const followersCount = await User.countDocuments({ userID }).select('followings');
    const followingsCount = await User.countDocuments({ userID }).select('followers');

    const responseData = {
      products: products.length > 0 ? products : 'No Product Found',
      posts: posts.length > 0 ? posts : 'No Post Found',
      property: property.length > 0 ? property : 'No Property Found',
      followersCount,
      followingsCount
    };
    res.render('user-profile.ejs' , responseData);
    return res.status(200).json(responseData);

  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});


router.get('/total' , async (req , res) => {
  try{
    const user = await User.aggregate([
      {$match : {Admin: true}},
      {$group : {_id : null , Admins : {$sum : "2"}}}
    ]);
    if(user.length > 0){
      res.status(200).send(user[0]);
    }else{
      res.status(404).send({message : 'No Matching Records Found'});
    }
  }catch(error){
    console.log(error);
    res.status(500).send({message : "An Internal Error Occured"})
  }
})

router.get('/' , async (req , res) => {
  let user;
  const search = req.query.search || '';
  try{
    if(search){
      user = await User.find({
        $or :[
         { FirstName: { $regex: new RegExp(search, 'i') }},
        { LastName: {$regex: new RegExp(search, 'i')}}
       ]}
        , { FirstName: 1, LastName: 1, _id: 0 });
    } else {
      user = await User.find();
      if(user.length === 0){
        res.status(404).send({message : 'No Users Found'});
      }
    }
    res.status(200).json(user);
  } catch(error){
    console.log(error);
    res.status(500).json({error : error.message});
  }
})

router.get('/getfollowers/:id', async (req, res) => {
  const userId = req.params.id;
  try {
    const user = await User.findById(userId).populate('followers' , 'FirstName');
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const followers = user.followers;
    res.status(200).json(followers);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "An error occurred" });
  }
});

router.get('/followings/:id', async (req, res) => {
  const userId = req.params.id;
  try {
    const user = await User.findById(userId).populate('followings', 'FirstName');
    if (!user) {
      return res.status(404).json({ message: "No Followings" });
    }
    const followers = user.followings;
    res.status(200).json(followers);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "An Internal Error Occurred" });
  }
});

router.post('/register', async (req, res) => {
try {
    const user = await User.findOne({email: req.body.email});
    if (user) {
    res.status(400).send({message:'Email already exists'});
    return;
    }

    const newUser = await User.create({
    ...req.body,
    password: await bcrypt.hash(req.body.password, 10),
    });

    res.status(201).send({message: 'User created successfully'});
} catch (error) {
    console.log(error);  
    res.status(500).send({ message:'An Error Occured'});
}
});

router.delete('/:id' , async (req , res) => {
  const user = User.findById(req.params.id);
  try{
    if(!user){
      console.log("user doeesn't exist");
      res.status(404).send({message : "User Doesn't Exist"});
    }
    await user.remove();
  }catch(error){
    res.status(500).send({message : "An Internal Error has Occured"});
    console.log(error);
  }
})

router.post('/login', async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).send({ message: 'User Not Found' });
    }
  
    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) {
      return res.status(500).send({ message : 'Wrong Password Entered' });
    }
  
    const accessToken = jwt.sign(
      {
        id: user._id,
        isAdmin: user.isAdmin,
      },
      JWT_SECRET,
      { expiresIn: '1d' }
    );
  
    const { password, ...others } = user._doc;
    res.set('Authorization', `Bearer ${accessToken}`).status(201).send(others);
  });

router.post('/logout' , async (req , res) => {
    try{
        req.session.destroy();
        res.clearCookie('Authorization');
        res.status(200).send({message : "You have been successfully logged out"});
    }catch(error){
        console.log(error);
        res.status(500).send(error,{message : "An Internal Error Occured"});
    }
})

router.put("/follow/:id", async (req, res) => {
  if (req.body._id !== req.params.id) {
    try {
      const userToFollow = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.id);

      if (!userToFollow.followers.includes(req.body._id)) {
        await User.findOneAndUpdate(
          { _id: req.params.id },
          { $push: { followers: req.body._id } }
        );

        await User.findOneAndUpdate(
          { _id: req.body._id },
          { $push: { followings: req.params.id } }
        );

        res.status(200).json({ message: "User has been followed." });
      } else {
        await User.findOneAndUpdate(
          {_id : req.params.id},
          { $pull : {followers : req.body._id}}
        );
        await User.findOneAndUpdate(
          {_id : req.body._id},
          { $pull : {followings : req.params.id}}
        );
        // res.status(403).json({ message: "You already follow this user." });
      }
    } catch (err) {
      res.status(500).json({ error: "Internal Server error", message: err.message });
    }
  } else {
    res.status(403).json({ message: "You can't follow yourself." });
  }
});

router.post('/forgetpassword' , async (req , res) => {
  try{

  }catch(error){
    console.log(error);
    res.status(500).send({message : "An Internal Error Occured"});
  }
})

export default router;