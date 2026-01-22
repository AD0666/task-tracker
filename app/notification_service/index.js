const nodemailer = require('nodemailer');
const config = require('../config/config');
const { createLogger } = require('../utils/logger');

const logger = createLogger('notification_service');

const transporter = nodemailer.createTransport(config.email.transport);

async function send_notification(user, task) {
  const ownerKey = (task.owner || '').trim().toUpperCase();
  const mappedOwnerEmail = config.email.ownerEmails[ownerKey];

  const recipientEmail =
    (user && user.email) || mappedOwnerEmail || config.email.admin;

  if (!recipientEmail) {
    logger.warn('Cannot send notification, no recipient email resolved', {
      user,
      ownerKey
    });
    return;
  }

  const subject = `[P1 Task] ${task.title || 'Task update'}`;
  const text = `You have a P1 task assigned to you.\n\nTitle: ${
    task.title
  }\nStatus: ${task.status}\nPriority: ${task.priority}\nCategory: ${
    task.category
  }\nOwner: ${task.owner}\n\nComments: ${
    task.comments || '-'
  }\n\nThis is an automated notification.`;

  try {
    await transporter.sendMail({
      from: config.email.from,
      to: recipientEmail,
      subject,
      text
    });
    logger.info('Notification sent', {
      to: recipientEmail,
      taskTitle: task.title
    });
  } catch (err) {
    logger.error('Failed to send notification', { error: err.message });
  }
}

function shouldNotifyOnPriority(task, loggedInUser) {
  return (
    task.priority === 'P1' &&
    loggedInUser &&
    task.owner &&
    task.owner.toLowerCase() === loggedInUser.username.toLowerCase() &&
    task.status !== 'Done'
  );
}

async function on_priority_change(task, loggedInUser) {
  if (shouldNotifyOnPriority(task, loggedInUser)) {
    await send_notification(loggedInUser, task);
  } else {
    logger.info('Priority change does not meet notification criteria', {
      taskTitle: task.title,
      owner: task.owner,
      priority: task.priority
    });
  }
}

module.exports = {
  send_notification,
  on_priority_change
};

