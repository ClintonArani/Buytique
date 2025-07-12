// test-email.js
require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

transporter.sendMail({
  from: `"Test" <${process.env.EMAIL_USER}>`,
  to: 'clintonarani@gmail.com',
  subject: 'SMTP Test',
  text: 'If you see this, your App Password works!',
})
.then(() => console.log('✅ Email sent! Check your inbox.'))
.catch((err: any) => console.error('❌ Failed:', err));