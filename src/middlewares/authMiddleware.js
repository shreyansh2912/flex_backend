const jwt = require('jsonwebtoken');
const { errorJson } = require('../utils/responseHelpers');
const User = require('../models/user.model'); // Assuming you have a User model

module.exports = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ is_error: true, message: 'Access denied. No token.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ is_error: true, message: 'User not found' });
    }

    console.log(user);
    req.user = user;

    next();
  } catch (err) {
    return res.status(401).json({ is_error: true, message: 'Invalid token' });
  }
};
