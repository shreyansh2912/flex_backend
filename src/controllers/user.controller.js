const User = require('../models/user.model');
const { successJson, errorJson } = require('../utils/responseHelpers');

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        return successJson(res, users, 'Fetched all users');
    } catch (error) {
        return errorJson(res, error.message, 500);
    }
};

exports.createUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const user = new User({
            name,
            email,
            password,
        });
        await user.save();
        return successJson(res, user, 'User created', 201);
    } catch (error) {
        return errorJson(res, error.message, 400);
    }
};

exports.getProfile = async (req, res) => {
    try {
        // req.user is already populated by authMiddleware
        return successJson(res, req.user, 'User profile fetched');
    } catch (error) {
        return errorJson(res, error.message, 500);
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { name, profileImage, qrColor } = req.body;
        const user = req.user;

        if (name) user.name = name;
        if (profileImage) user.profileImage = profileImage;
        if (qrColor) user.qrColor = qrColor;

        await user.save();
        return successJson(res, user, 'Profile updated successfully');
    } catch (error) {
        return errorJson(res, error.message, 500);
    }
};