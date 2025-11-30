const mongoose = require('mongoose');

const pollSessionSchema = new mongoose.Schema({
    hostId: {
        type: String,
        required: true
    },
    question: {
        type: String,
        required: true
    },
    options: [{
        text: { type: String, required: true },
        count: { type: Number, default: 0 }
    }],
    status: {
        type: String,
        enum: ['waiting', 'active', 'completed'],
        default: 'waiting'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('PollSession', pollSessionSchema);
