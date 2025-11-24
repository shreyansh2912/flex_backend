const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema({
    formId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Form',
        required: true,
    },
    data: {
        type: Map,
        of: mongoose.Schema.Types.Mixed, // Flexible structure to store various field types
        required: true,
    },
    submittedAt: {
        type: Date,
        default: Date.now,
    },
    respondentInfo: {
        name: String,
        email: String,
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    }
});

module.exports = mongoose.model("Submission", submissionSchema);
