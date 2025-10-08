const { required } = require("joi");
const mongoose = require("mongoose");

const formSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },

  steps: {
    type: String,
    required: true,
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId, // Foreign key
    ref: 'User', // refers to User model
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

  deletedAt: {
    type: Date,
  }
});

module.exports = mongoose.model("Form", formSchema);
