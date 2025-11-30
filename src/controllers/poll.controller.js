const PollSession = require('../models/pollSession.model');
const { successJson, errorJson } = require('../utils/responseHelpers');

exports.getPolls = async (req, res) => {
    try {
        const userId = req.user?._id;
        const guestId = req.query.hostId;

        console.log('Fetching polls. UserId:', userId, 'GuestId:', guestId);

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

        // Debug: Log all polls to see what's in DB
        // const allPolls = await PollSession.find({});
        // console.log('All polls in DB:', allPolls.map(p => ({ id: p._id, hostId: p.hostId })));
        console.log('Query:', JSON.stringify(query));

        const polls = await PollSession.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        return successJson(res, polls, 'Fetched polls');
    } catch (error) {
        return errorJson(res, error.message, 500);
    }
};
