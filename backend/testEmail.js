import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

console.log('📧 Testing Email Configuration...\n');

console.log('Settings:');
console.log('  Host:', process.env.EMAIL_HOST);
console.log('  Port:', process.env.EMAIL_PORT);
console.log('  User:', process.env.EMAIL_USER);
console.log('  Pass:', process.env.EMAIL_PASS ? '****' + process.env.EMAIL_PASS.slice(-4) : 'NOT SET');
console.log('  From:', process.env.EMAIL_FROM);
console.log('');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

console.log('🔄 Attempting to send test email...\n');

transporter.sendMail({
  from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
  to: process.env.EMAIL_USER, // Send to yourself
  subject: '✅ PlanMorph Tech - Email Test Successful',
  html: `
    <h2>Email Configuration Test</h2>
    <p>If you're reading this, your email configuration is working correctly!</p>
    <p><strong>Tested at:</strong> ${new Date().toLocaleString()}</p>
    <hr>
    <p>You can now send quotations to clients.</p>
  `,
  text: `
Email Configuration Test

If you're reading this, your email configuration is working correctly!

Tested at: ${new Date().toLocaleString()}

You can now send quotations to clients.
  `.trim(),
})
.then(info => {
  console.log('✅ SUCCESS! Email sent successfully!');
  console.log('  Message ID:', info.messageId);
  console.log('  Preview URL:', nodemailer.getTestMessageUrl(info));
  console.log('');
  console.log('Check your email inbox:', process.env.EMAIL_USER);
  process.exit(0);
})
.catch(error => {
  console.error('❌ FAILED! Error sending email:');
  console.error('  Error:', error.message);
  console.error('');
  console.log('Common issues:');
  console.log('  1. Gmail: Make sure 2-Step Verification is enabled and you\'re using an App Password');
  console.log('  2. Check EMAIL_USER and EMAIL_PASS in .env file');
  console.log('  3. Try using a different email provider (SendGrid, Mailtrap, etc.)');
  process.exit(1);
});
