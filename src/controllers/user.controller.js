const User = require('../models/user.model');
const { successJson, errorJson } = require('../utils/responseHelpers');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    return successJson(res, users, 'Fetched all users');
  } catch (err) {
    return errorJson(res, err.message, 500);
  }
};

exports.createUser = async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = new User({ name, email });
    await user.save();
    return successJson(res, user, 'User created', 201);
  } catch (err) {
    return errorJson(res, err.message, 400);
  }
};
