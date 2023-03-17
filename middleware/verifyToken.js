const jwt = require('jsonwebtoken');

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

module.exports = verifyToken;
