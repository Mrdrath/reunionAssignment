const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { User } = require('../models');

exports.authenticateUser = async (req, res) => {
  const { email, password } = req.body;

  // Dummy authentication
  const user = await User.findOne({ email });
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign({ userId: user._id }, 'secret_key', { expiresIn: '1h' });
  res.json({ token });
};

exports.verifyToken = (req, res, next) => {
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
