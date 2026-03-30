const nodemailer = require('nodemailer');
const { smtpHost, smtpPort, smtpUser, smtpPass, mailFrom } = require('../config/env');

const hasSmtpConfig = () => Boolean(smtpHost && smtpUser && smtpPass);

let transporter = null;

const getTransporter = () => {
  if (!hasSmtpConfig()) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    });
  }
  return transporter;
};

const sendMail = async ({ to, subject, text, html }) => {
  const transport = getTransporter();
  if (!transport) return false;
  await transport.sendMail({
    from: mailFrom || smtpUser,
    to,
    subject,
    text,
    html
  });
  return true;
};

module.exports = { sendMail, hasSmtpConfig };
