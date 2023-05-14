const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const multer = require('multer');
const User = require('../models/user.js');
const Post = require('../models/post.js');
const Comment= require('../models/comment.js');

const app = express();
app.use(express.json());

// Database Connection
mongoose.connect('mongodb://localhost:27017/social-media-platform', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true
})
.then(() => console.log('Connected to database'))
.catch((error) => console.log(error.message));

// Authentication Endpoint
app.post('/api/authenticate', async (req, res) => {
  const { email, password } = req.body;

  // Dummy authentication
  const user = await User.findOne({ email });
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign({ userId: user._id }, 'secret_key', { expiresIn: '1h' });
  res.json({ token });
});

// Middleware to validate JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ message: 'Authorization header not found' });
  }

  jwt.verify(token, 'secret_key', (err, decodedToken) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    req.userId = decodedToken.userId;
    next();
  });
};

// Follow a user
app.post('/api/users/:userId/follow', verifyToken, async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.followers.includes(req.userId)) {
      return res.status(400).json({ message: 'User is already followed' });
    }

    user.followers.push(req.userId);
    await user.save();

    const currentUser = await User.findById(req.userId);
    currentUser.following.push(userId);
    await currentUser.save();

    res.json({ message: 'User followed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Unfollow a user
app.post('/api/users/:userId/unfollow', verifyToken, async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.followers.includes(req.userId)) {
      return res.status(400).json({ message: 'User is not followed' });
    }

    user.followers = user.followers.filter((follower) => follower.toString() !== req.userId);
    await user.save();

    const currentUser = await User.findById(req.userId);
    currentUser.following = currentUser.following.filter((followedUser) => followedUser.toString() !== userId);
    await currentUser.save();

    res.json({ message: 'User unfollowed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

 // Get user profile
 app.get('/api/users/:userId', verifyToken, async (req, res) => {
    const { userId } = req.params;
  
    try {
      const user = await User.findById(userId).populate('following', 'username').populate('followers', 'username');
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      const posts = await Post.find({ user: userId }).populate('user', 'username').populate('likes', 'username').populate({
        path: 'comments',
        populate: {
          path: 'user',
          select: 'username'
        }
      });
  
      res.json({ user, posts });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });