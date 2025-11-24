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
    enum: ['text', 'email', 'number', 'textarea', 'radio', 'checkbox', 'select', 'date', 'image'],
  },
  placeholder: {
    type: String,
    default: '',
  },
  options: {
    type: [String],
    default: undefined,
  },
  validation: {
    required: { type: Boolean, default: false },
    minLength: { type: Number },
    maxLength: { type: Number },
    pattern: { type: String },
  },
  layout: {
    width: { type: String, default: '100%' }, // '100%' or '50%'
  },
  page: {
    type: Number,
    default: 1,
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
    enum: ['single-step', 'multi-step'],
  },
  visibility: {
    type: String,
    enum: ['public', 'password-protected'],
    default: 'public',
  },
  password: {
    type: String, // Hashed password
  },
  allowedEmails: {
    type: [String], // List of emails invited
    default: [],
  },
  collectUserInfo: {
    type: Boolean, // If true, respondent must login
    default: false,
  },
  theme: {
    primaryColor: { type: String, default: '#3b82f6' },
    backgroundColor: { type: String, default: '#ffffff' },
    textColor: { type: String, default: '#000000' },
    borderRadius: { type: String, default: '4px' },
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
