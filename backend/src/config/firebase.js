const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL:
      'https://queueease-d7f7b-default-rtdb.asia-southeast1.firebasedatabase.app',
  });

  console.log('🔥 Firebase Admin Initialized');
}

module.exports = admin;