// const fetch = require('node-fetch');
require('dotenv').config();

const sendOtpEmail = async (to, otp) => {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) throw new Error('Brevo API key not configured');

  const sender = {
    email: 'shreyanshshah2912@gmail.com',
    name: process.env.APP_NAME || 'Your App Name'
  };

  const subject = `${otp} is the OTP for your ${process.env.APP_NAME} account`;

  const htmlContent = `
    <h2>🔐 Your OTP Code</h2>
    <p>Your One-Time Password (OTP) is:</p>
    <h1 style="letter-spacing: 5px;">${otp}</h1>
    <p>This code will expire in 5 minutes. Please do not share it with anyone.</p>
    <br/>
    <p>Thanks,<br/>The ${process.env.APP_NAME} Team</p>
  `;

  const body = {
    sender,
    to: [{ email: to }],
    subject,
    htmlContent,
  };

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'api-key': apiKey,
      'content-type': 'application/json'
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Brevo API error: ${JSON.stringify(errorData)}`);
  }
};

module.exports = sendOtpEmail;
