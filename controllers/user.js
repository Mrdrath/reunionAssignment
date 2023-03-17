const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { verifyToken } = require('../middlewares');

const router = express.Router();

// Authentication Endpoint
router.post('/authenticate', async (req, res) => {
  const { email, password } = req.body;

  // Dummy authentication
  const user = await User.findOne({ email });
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign({ userId: user._id }, 'secret_key', { expiresIn: '1h' });
  res.json({ token });
});

// Follow a user
router.post('/:userId/follow', verifyToken, async (req, res) => {
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
router.post('/:userId/unfollow', verifyToken, async (req, res) => {
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
router.get('/:userId', verifyToken, async (req, res) => {
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

module.exports = router;
