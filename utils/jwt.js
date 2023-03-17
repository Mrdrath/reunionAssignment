const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret';

function generateToken(payload) {
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
  return token;
}

function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (err) {
    console.error('Failed to verify JWT:', err);
    return null;
  }
}

module.exports = {
  generateToken,
  verifyToken,
};
