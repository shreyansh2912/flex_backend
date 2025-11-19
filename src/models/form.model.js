const mongoose = require("mongoose");

const fieldSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['text', 'email', 'number', 'textarea', 'radio', 'checkbox', 'select'],
  },
  options: {
    type: [String],
    default: undefined,
  },
  required: {
    type: Boolean,
    default: false,
  },
  sequence: {
    type: Number,
    required: true,
  },
});

const formSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  formType: {
    type: String,
    required: true,
    enum: ['single-page', 'multi-page'],
  },
  isPublic: {
    type: Boolean,
    default: false,
  },
  fields: [fieldSchema],
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
  },
});

module.exports = mongoose.model("Form", formSchema);
