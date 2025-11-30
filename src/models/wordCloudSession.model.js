const mongoose = require('mongoose');

const wordCloudSessionSchema = new mongoose.Schema({
    hostId: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['waiting', 'active', 'completed'],
        default: 'waiting',
    },
    timeLimit: {
        type: Number, // in seconds
        required: true,
    },
    startTime: {
        type: Date,
    },
    endTime: {
        type: Date,
    },
    words: [{
        text: { type: String, required: true },
        count: { type: Number, default: 1 },
        timestamp: { type: Date, default: Date.now },
        userId: { type: String }, // Optional: if we want to track who sent what (could be socket ID or user ID)
    }],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('WordCloudSession', wordCloudSessionSchema);
