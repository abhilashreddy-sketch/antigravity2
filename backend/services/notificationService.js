const nodemailer = require('nodemailer');
const { Notification, User } = require('../models');
require('dotenv').config();

// Create transporter if SMTP configuration is present
let transporter = null;
if (process.env.SMTP_USER && process.env.SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: parseInt(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

/**
 * Send notification to a user (both via system alert and optional email)
 * @param {Object} params
 * @param {number} params.userId - Recipient User ID
 * @param {string} params.title - Alert Title
 * @param {string} params.message - Alert Details
 * @param {string} params.type - 'info', 'warning', 'delay', 'report'
 * @param {boolean} params.sendEmail - If true, tries to send email as well
 */
const sendNotification = async ({ userId, title, message, type = 'info', sendEmail = false }) => {
  try {
    // 1. Create in-app database notification
    const notification = await Notification.create({
      userId,
      title,
      message,
      type,
      read: false,
    });

    // 2. Send email if requested
    if (sendEmail) {
      const user = await User.findByPk(userId);
      if (user && user.email) {
        const mailOptions = {
          from: process.env.EMAIL_FROM || 'noreply@constructionsitetracker.com',
          to: user.email,
          subject: `[Site Tracker] ${title}`,
          text: message,
          html: `<div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #1e3a8a;">Site Progress Notification</h2>
            <p><strong>Status:</strong> ${type.toUpperCase()}</p>
            <p><strong>Title:</strong> ${title}</p>
            <p style="background: #f3f4f6; padding: 15px; border-left: 4px solid #1e3a8a; font-style: italic;">
              ${message}
            </p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
            <p style="font-size: 0.875rem; color: #6b7280;">
              This is an automated message from your Site Progress Tracking Dashboard.
            </p>
          </div>`,
        };

        if (transporter) {
          await transporter.sendMail(mailOptions);
          console.log(`[Email Sent] To: ${user.email} - Subject: ${title}`);
        } else {
          console.log(`[SMTP Offline] Would send email to ${user.email}:\nSubject: ${title}\nBody: ${message}\n`);
        }
      }
    }

    return notification;
  } catch (error) {
    console.error('Error sending notification:', error);
  }
};

/**
 * Notify all Admins and Managers about an event
 */
const notifyManagement = async ({ title, message, type = 'info' }) => {
  try {
    const managersAndAdmins = await User.findAll({
      where: {
        role: ['admin', 'manager'],
        status: 'active',
      },
    });

    const notifications = [];
    for (const user of managersAndAdmins) {
      const notif = await sendNotification({
        userId: user.id,
        title,
        message,
        type,
        sendEmail: true,
      });
      notifications.push(notif);
    }
    return notifications;
  } catch (error) {
    console.error('Error notifying management:', error);
  }
};

module.exports = {
  sendNotification,
  notifyManagement,
};
