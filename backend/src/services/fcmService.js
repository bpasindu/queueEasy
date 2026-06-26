const admin = require('../config/firebase');
const User = require('../models/User');

async function sendPushNotification(
  userId,
  title,
  body,
  data = {}
) {
  try {
    const user = await User.findById(userId);

    if (!user || !user.fcmToken) {
      return {
        success: false,
        reason: 'No FCM token',
      };
    }

    const message = {
      token: user.fcmToken,

      notification: {
        title,
        body,
      },

      data: Object.keys(data).reduce((acc, key) => {
        acc[key] = String(data[key]);
        return acc;
      }, {}),
    };

    const response =
      await admin.messaging().send(message);

    console.log('FCM sent:', response);

    return {
      success: true,
      response,
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      error: error.message,
    };
  }
}

module.exports = {
  sendPushNotification,
};