const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587, // use 465 for SSL
  secure: false, // true for port 465
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendOtpEmail = async (to, otp) => {
  const mailOptions = {
    from: "shreyanshshah2912@gmail.com",
    to,
    subject: `${otp} is the otp for your ${process.env.APP_NAME} account`,
    html: `
      <h2>🔐 Your OTP Code</h2>
      <p>Your One-Time Password (OTP) is:</p>
      <h1 style="letter-spacing: 5px;">${otp}</h1>
      <p>This code will expire in 5 minutes. Please do not share it with anyone.</p>
      <br/>
      <p>Thanks,<br/>The Your App Name Team</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`OTP email sent to ${to}`);
  } catch (error) {
    console.error('Failed to send OTP email:', error);
    throw new Error('Could not send OTP email');
  }
};

module.exports = sendOtpEmail;
