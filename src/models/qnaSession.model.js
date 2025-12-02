const mongoose = require('mongoose');

const qnaSessionSchema = new mongoose.Schema({
    hostId: {
        type: String,
        required: true
    },
    questions: [{
        text: { type: String, required: true },
        upvotes: { type: Number, default: 0 },
        upvotedBy: [{ type: String }],
        isAnswered: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now }
    }],
    status: {
        type: String,
        enum: ['active', 'completed'],
        default: 'active'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('QnASession', qnaSessionSchema);
