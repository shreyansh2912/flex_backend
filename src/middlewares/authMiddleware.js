const jwt = require('jsonwebtoken');
const { errorJson } = require('../utils/responseHelpers');

module.exports =  (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) return res.status(401).json({ is_error: true, message: 'Access denied. No token.' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ is_error: true, message: 'Invalid token' });
  }
};
