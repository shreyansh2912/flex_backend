const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  profileImage: {
    type: String,
    default: '',
  },
  qrColor: {
    type: String,
    default: '#000000',
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  otp: {
    type: String,
  },
  otpExpiresAt: {
    type: Date,
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
