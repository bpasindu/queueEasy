/**
 * QueueEase V2 — Email Service
 *
 * Minimal email-sending abstraction used by the password reset flow
 * (issue #12). In development (or if no SMTP provider is configured)
 * this logs the message instead of sending it, so the reset flow can be
 * tested end-to-end without a real mail provider.
 *
 * To go live, configure SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS and wire
 * up nodemailer (or your preferred provider, e.g. SES/SendGrid) below.
 */

const config = require('../config');

const sendPasswordResetEmail = async (toEmail, resetUrl) => {
  if (!config.smtp?.host) {
    console.log(
      `[email] (dev) Password reset link for ${toEmail}: ${resetUrl}\n` +
      '[email] Configure SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS to send real emails.'
    );
    return;
  }

  // Example real implementation (uncomment and add `nodemailer` to
  // package.json once SMTP credentials are configured):
  //
  // const nodemailer = require('nodemailer');
  // const transporter = nodemailer.createTransport({
  //   host: config.smtp.host,
  //   port: config.smtp.port,
  //   secure: config.smtp.port === 465,
  //   auth: { user: config.smtp.user, pass: config.smtp.pass },
  // });
  // await transporter.sendMail({
  //   from: config.smtp.from,
  //   to: toEmail,
  //   subject: 'Reset your QueueEase password',
  //   html: `<p>Click the link below to reset your password. This link expires in 1 hour.</p>
  //          <p><a href="${resetUrl}">${resetUrl}</a></p>
  //          <p>If you did not request this, you can safely ignore this email.</p>`,
  // });
};

module.exports = { sendPasswordResetEmail };
