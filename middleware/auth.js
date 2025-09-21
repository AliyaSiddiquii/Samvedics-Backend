// middleware/auth.js
const jwt = require('jsonwebtoken');

// This is the secret key you have in your .env file
const JWT_SECRET = process.env.JWT_SECRET;

module.exports = (req, res, next) => {
  // Get token from the header
  const token = req.header('x-auth-token');

  // Check if no token is found
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Correctly add the user from the token payload to the request object
    req.user = decoded;
    next(); // Move to the next function in the route handler
  } catch (e) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};