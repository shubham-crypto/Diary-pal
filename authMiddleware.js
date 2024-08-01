const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET;
const cookie = require('cookie');
const authMiddleware = (req, res, next) => {

  // Check for token in Authorization header
  const authHeader = req.headers.authorization;
  let token;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1]; // Extract the token without 'Bearer '
  } else {
    // If no token in header, check for token in cookies
    const cookies = cookie.parse(req.headers.cookie || '');
    token = cookies.token; // Extract the token from cookie
    
  }

  if (!token) {
    return res.status(401).send('Unauthorized: No token provided');
  }

  try {
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      console.log('Token has expired');
    } else {
      console.log('Token is invalid');
    }
    return res.status(401).send('Unauthorized: Invalid token');
  }
};

module.exports = authMiddleware;
