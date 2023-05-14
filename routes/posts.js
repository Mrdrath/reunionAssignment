const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');

// Sample posts data
const posts = [
  {
    id: 1,
    title: 'Post 1',
    content: 'This is the first post'
  },
  {
    id: 2,
    title: 'Post 2',
    content: 'This is the second post'
  },
  {
    id: 3,
    title: 'Post 3',
    content: 'This is the third post'
  }
];

// Get all posts
router.get('/', verifyToken, (req, res) => {
  res.json(posts);
});

// Get a specific post by id
router.get('/:postId', verifyToken, (req, res) => {
  const { postId } = req.params;
  const post = posts.find(post => post.id === parseInt(postId));
  if (!post) return res.status(404).json({ message: 'Post not found' });
  res.json(post);
});

// Create a new post
router.post('/', verifyToken, (req, res) => {
  const { title, content } = req.body;
  const newPost = {
    id: posts.length + 1,
    title,
    content
  };
  posts.push(newPost);
  res.json(newPost);
});

// Update a post by id
router.put('/:postId', verifyToken, (req, res) => {
  const { postId } = req.params;
  const { title, content } = req.body;
  const post = posts.find(post => post.id === parseInt(postId));
  if (!post) return res.status(404).json({ message: 'Post not found' });
  post.title = title;
  post.content = content;
  res.json(post);
});

// Delete a post by id
router.delete('/:postId', verifyToken, (req, res) => {
  const { postId } = req.params;
  const postIndex = posts.findIndex(post => post.id === parseInt(postId));
  if (postIndex === -1) return res.status(404).json({ message: 'Post not found' });
  posts.splice(postIndex, 1);
  res.json({ message: 'Post deleted' });
});

module.exports = router;
