const { Post, User } = require('../models');

// Create a new post
const createPost = async (req, res) => {
  const { title, description } = req.body;

  try {
    const post = new Post({
      title,
      description,
      user: req.userId,
    });

    await post.save();

    res.json({
      postId: post._id,
      title: post.title,
      description: post.description,
      createdAt: post.createdAt.toISOString(),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all posts
const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find().populate('user', 'username');
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single post
const getPostById = async (req, res) => {
  const { postId } = req.params;

  try {
    const post = await Post.findById(postId)
      .populate('user', 'username')
      .populate('likes', 'username')
      .populate({
        path: 'comments',
        populate: {
          path: 'user',
          select: 'username',
        },
      });
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a post
const updatePostById = async (req, res) => {
  const { postId } = req.params;
  const { title, description } = req.body;

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.user.toString() !== req.userId) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    post.title = title;
    post.description = description;
    await post.save();

    res.json({
      postId: post._id,
      title: post.title,
      description: post.description,
      updatedAt: post.updatedAt.toISOString(),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a post
const deletePostById = async (req, res) => {
  const { postId } = req.params;

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.user.toString() !== req.userId) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await post.delete();

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Like a post
const Post = require('../models/Post');

exports.likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }

    // Check if the post has already been liked
    if (post.likes.some((like) => like.user.toString() === req.user.id)) {
      return res.status(400).json({ msg: 'Post already liked' });
    }

    post.likes.unshift({ user: req.user.id });
    await post.save();

    res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Unlike a post
exports.unlikePost = async (req, res) => {
    try {
    const post = await Post.findById(req.params.postId);

    // Check if the post has already been liked
if (
    post.likes.filter((like) => like.user.toString() === req.user.id).length ===
    0
  ) {
    return res.status(400).json({ msg: 'Post has not yet been liked' });
  }
  
  // Get remove index
  const removeIndex = post.likes
    .map((like) => like.user.toString())
    .indexOf(req.user.id);
  
  post.likes.splice(removeIndex, 1);
  
  await post.save();
  
  res.json(post.likes);
} catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
  
