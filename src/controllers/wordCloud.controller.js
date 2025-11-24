const WordCloudSession = require('../models/wordCloudSession.model');
const { successJson, errorJson } = require('../utils/responseHelpers');

exports.createSession = async (req, res) => {
    try {
        const { timeLimit } = req.body;
        const session = new WordCloudSession({
            hostId: req.user._id,
            timeLimit: timeLimit || 60, // Default 60 seconds
            status: 'waiting',
        });
        await session.save();
        return successJson(res, session, 'Session created successfully', 201);
    } catch (error) {
        return errorJson(res, error.message, 500);
    }
};

exports.getSession = async (req, res) => {
    try {
        const session = await WordCloudSession.findById(req.params.id);
        if (!session) {
            return errorJson(res, 'Session not found', 404);
        }
        return successJson(res, session, 'Session fetched successfully');
    } catch (error) {
        return errorJson(res, error.message, 500);
    }
};

exports.getMySessions = async (req, res) => {
    try {
        const sessions = await WordCloudSession.find({ hostId: req.user._id }).sort({ createdAt: -1 });
        return successJson(res, sessions, 'Sessions fetched successfully');
    } catch (error) {
        return errorJson(res, error.message, 500);
    }
};
