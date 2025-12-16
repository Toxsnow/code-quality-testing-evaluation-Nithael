const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const jwtSecret = process.env.JWT_SECRET || 'your-super-secret-key-that-should-not-be-hardcoded';
    const decoded = jwt.verify(token.split(' ')[1], jwtSecret);

    req.user = decoded;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ error: 'Failed to authenticate token' });
  }
};

module.exports = auth;
