const QnASession = require('../models/qnaSession.model');
const { successJson, errorJson } = require('../utils/responseHelpers');

exports.getQnASessions = async (req, res) => {
    try {
        const userId = req.user?._id;
        const guestId = req.query.hostId;

        let query = {};
        if (userId && guestId) {
            query = { $or: [{ hostId: userId.toString() }, { hostId: guestId }] };
        } else if (userId) {
            query = { hostId: userId.toString() };
        } else if (guestId) {
            query = { hostId: guestId };
        } else {
            return errorJson(res, 'Host ID required', 400);
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const sessions = await QnASession.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        return successJson(res, sessions, 'Fetched Q&A sessions');
    } catch (error) {
        return errorJson(res, error.message, 500);
    }
};
