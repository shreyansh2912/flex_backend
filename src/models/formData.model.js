const mongoose = require("mongoose");

const formDataSchema = new mongoose.Schema({
    formId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Form',
        required: true,
    },
    data: {
        type: Map,
        of: mongoose.Schema.Types.Mixed,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("FormData", formDataSchema);
