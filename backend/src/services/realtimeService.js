const admin = require('../config/firebase');

const db = admin.database();

async function updateQueue(queueId, data) {
  await db.ref(`queues/${queueId}`).set(data);
}

async function updateWaitingTime(
  queueId,
  waitingTime
) {
  await db.ref(`queues/${queueId}/waitingTime`).set(
    waitingTime
  );
}

async function updatePosition(
  queueId,
  userId,
  position
) {
  await db
    .ref(`queues/${queueId}/users/${userId}`)
    .update({
      position,
    });
}

module.exports = {
  updateQueue,
  updateWaitingTime,
  updatePosition,
};