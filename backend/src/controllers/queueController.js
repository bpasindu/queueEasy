/**
 * QueueEase V2 — Queue Controller
 * Handles all queue operations including emergency priority.
 */

const Queue = require('../models/Queue');
const Clinic = require('../models/Clinic');
const Appointment = require('../models/Appointment');
const Notification = require('../models/Notification');
const AppError = require('../utils/AppError');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { getSocketIO } = require('../sockets');
const { recordAudit } = require('../utils/auditLog');

/**
 * @desc    Get or create today's queue for a clinic
 * @route   GET /api/queues/clinic/:clinicId/today
 * @access  Private
 */
exports.getTodayQueue = async (req, res, next) => {
  try {
    const { clinicId } = req.params;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let queue = await Queue.findOne({
      clinicId,
      date: today,
    }).populate('doctorId', 'name specialization');
    
    if (!queue) {
      // Auto-create queue for today
      const clinic = await Clinic.findById(clinicId);
      if (!clinic) {
        return sendError(res, 'Clinic not found', 404);
      }
      
      queue = await Queue.create({
        clinicId,
        doctorId: clinic.doctorId,
        date: today,
        isActive: true,
        status: 'open',
      });
    }
    
    sendSuccess(res, queue, 'Today\'s queue retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Join a queue
 * @route   POST /api/queues/:queueId/join
 * @access  Private (Patient)
 */
exports.joinQueue = async (req, res, next) => {
  try {
    const { queueId } = req.params;
    const { priority = 'normal', appointmentType = 'walk-in', emergencyReason, appointmentId } = req.body;
    const patientId = req.user._id;
    
    const queue = await Queue.findById(queueId);
    if (!queue) {
      return sendError(res, 'Queue not found', 404);
    }
    
    if (queue.status === 'closed') {
      return sendError(res, 'Queue is closed for today', 400);
    }
    
    // Check if patient already in queue
    const alreadyInQueue = queue.entries.find(
      e => e.patientId && e.patientId.toString() === patientId.toString() && e.status === 'waiting'
    );
    if (alreadyInQueue) {
      return sendError(res, 'You are already in the queue', 409);
    }
    
    // Generate token and position
    const tokenNumber = queue.generateToken();
    const position = queue.getNextPosition();
    
    // Estimate wait time (simple calculation; AI prediction can override)
    const patientsAhead = queue.getWaitingCount();
    const estimatedWait = patientsAhead * queue.getAverageConsultationMinutes();
    
    const entry = {
      patientId,
      patientName: req.user.name,
      patientPhone: req.user.phone,
      tokenNumber,
      position,
      priority,
      appointmentType,
      emergencyReason: priority === 'emergency' ? emergencyReason : undefined,
      estimatedWaitMinutes: estimatedWait,
      joinedAt: new Date(),
    };
    
    queue.entries.push(entry);
    queue.stats.totalPatients += 1;
    
    // Reorder by priority if emergency
    if (priority === 'emergency' || priority === 'urgent') {
      queue.reorderByPriority();
    }
    
    await queue.save();
    
    // Emit real-time update
    const io = getSocketIO();
    if (io) {
      io.to(`queue-${queueId}`).emit('queue-updated', {
        queueId,
        action: 'patient-joined',
        entry: queue.entries.find(e => e.tokenNumber === tokenNumber),
        waitingCount: queue.getWaitingCount(),
      });
    }
    
    // Create notification
    await Notification.create({
      userId: patientId,
      type: 'queue-update',
      title: 'Joined Queue',
      body: `Your token is ${tokenNumber}. Estimated wait: ${estimatedWait} minutes.`,
      clinicId: queue.clinicId,
      queueId,
      data: { tokenNumber, position, estimatedWait },
    });
    
    const addedEntry = queue.entries.find(e => e.tokenNumber === tokenNumber);
    sendSuccess(res, addedEntry, 'Successfully joined the queue', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Call next patient
 * @route   POST /api/queues/:queueId/call-next
 * @access  Private (Doctor, Receptionist)
 */
exports.callNext = async (req, res, next) => {
  try {
    const { queueId } = req.params;
    
    const queue = await Queue.findById(queueId);
    if (!queue) {
      return sendError(res, 'Queue not found', 404);
    }
    
    // Find next waiting patient (prioritized)
    const waiting = queue.entries
      .filter(e => e.status === 'waiting')
      .sort((a, b) => {
        const pOrder = { emergency: 0, urgent: 1, normal: 2 };
        const pA = pOrder[a.priority] ?? 2;
        const pB = pOrder[b.priority] ?? 2;
        if (pA !== pB) return pA - pB;
        return a.position - b.position;
      });
    
    if (waiting.length === 0) {
      return sendError(res, 'No patients waiting in queue', 400);
    }
    
    const nextPatient = waiting[0];
    nextPatient.status = 'in-consultation';
    nextPatient.calledAt = new Date();
    nextPatient.consultationStartedAt = new Date();
    
    queue.currentToken = nextPatient.tokenNumber;
    queue.currentPosition = nextPatient.position;
    
    // Recalculate positions for remaining
    queue.reorderByPriority();
    
    await queue.save();
    
    // Emit real-time update
    const io = getSocketIO();
    if (io) {
      io.to(`queue-${queueId}`).emit('queue-updated', {
        queueId,
        action: 'patient-called',
        calledToken: nextPatient.tokenNumber,
        waitingCount: queue.getWaitingCount(),
      });
      
      // Send direct notification to the called patient (if they have an
      // app account — walk-in emergency entries have no patientId)
      if (nextPatient.patientId) {
        io.to(`user-${nextPatient.patientId}`).emit('your-turn', {
          tokenNumber: nextPatient.tokenNumber,
          message: 'It\'s your turn! Please proceed to the consultation room.',
        });
      }
    }
    
    // Create notification for called patient (skip walk-ins with no account)
    if (nextPatient.patientId) {
      await Notification.create({
        userId: nextPatient.patientId,
        type: 'your-turn',
        title: 'It\'s Your Turn!',
        body: `Token ${nextPatient.tokenNumber} — Please proceed to the consultation room.`,
        clinicId: queue.clinicId,
        queueId,
      });
    }
    
    // Notify next 2 patients that their turn is approaching
    const approaching = queue.entries.filter(e => e.status === 'waiting').slice(0, 2);
    for (const patient of approaching) {
      if (!patient.patientId) continue; // walk-in emergency entry, no account to notify

      await Notification.create({
        userId: patient.patientId,
        type: 'turn-approaching',
        title: 'Your Turn is Approaching',
        body: `Token ${patient.tokenNumber} — You are next in line. Please be ready.`,
        clinicId: queue.clinicId,
        queueId,
      });
      
      if (io) {
        io.to(`user-${patient.patientId}`).emit('turn-approaching', {
          tokenNumber: patient.tokenNumber,
          position: patient.position,
        });
      }
    }
    
    sendSuccess(res, nextPatient, 'Next patient called');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Complete current consultation
 * @route   POST /api/queues/:queueId/complete
 * @access  Private (Doctor)
 */
exports.completeConsultation = async (req, res, next) => {
  try {
    const { queueId } = req.params;
    const { notes } = req.body;
    
    const queue = await Queue.findById(queueId);
    if (!queue) {
      return sendError(res, 'Queue not found', 404);
    }
    
    const currentPatient = queue.entries.find(e => e.status === 'in-consultation');
    if (!currentPatient) {
      return sendError(res, 'No patient currently in consultation', 400);
    }
    
    currentPatient.status = 'completed';
    currentPatient.completedAt = new Date();
    if (notes) currentPatient.notes = notes;
    
    // Update stats
    queue.stats.completed += 1;
    
    // Calculate consultation duration
    if (currentPatient.consultationStartedAt) {
      const duration = (Date.now() - new Date(currentPatient.consultationStartedAt).getTime()) / 60000;
      queue.stats.averageConsultationMinutes = Math.round(
        (queue.stats.averageConsultationMinutes * (queue.stats.completed - 1) + duration) / queue.stats.completed
      );
    }
    
    await queue.save();
    
    // Emit real-time update
    const io = getSocketIO();
    if (io) {
      io.to(`queue-${queueId}`).emit('queue-updated', {
        queueId,
        action: 'consultation-completed',
        completedToken: currentPatient.tokenNumber,
        waitingCount: queue.getWaitingCount(),
      });
    }
    
    sendSuccess(res, currentPatient, 'Consultation completed');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cancel queue entry
 * @route   POST /api/queues/:queueId/cancel/:entryId
 * @access  Private
 */
exports.cancelEntry = async (req, res, next) => {
  try {
    const { queueId, entryId } = req.params;
    
    const queue = await Queue.findById(queueId);
    if (!queue) {
      return sendError(res, 'Queue not found', 404);
    }
    
    const entry = queue.entries.id(entryId);
    if (!entry) {
      return sendError(res, 'Queue entry not found', 404);
    }
    
    // Only the patient, doctor, or receptionist can cancel
    const isPatient = !!entry.patientId && entry.patientId.toString() === req.user._id.toString();
    const isStaff = ['doctor', 'receptionist'].includes(req.user.role);
    
    if (!isPatient && !isStaff) {
      return sendError(res, 'Not authorized to cancel this entry', 403);
    }
    
    entry.status = 'cancelled';
    queue.stats.cancelled += 1;
    queue.reorderByPriority();
    
    await queue.save();

    await recordAudit(req, 'queue.entry.cancel', 'QueueEntry', entry._id, {
      queueId, tokenNumber: entry.tokenNumber, cancelledByStaff: isStaff,
    });
    
    // Emit real-time update
    const io = getSocketIO();
    if (io) {
      io.to(`queue-${queueId}`).emit('queue-updated', {
        queueId,
        action: 'entry-cancelled',
        cancelledToken: entry.tokenNumber,
        waitingCount: queue.getWaitingCount(),
      });
    }
    
    sendSuccess(res, entry, 'Queue entry cancelled');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get queue details with full entries
 * @route   GET /api/queues/:queueId
 * @access  Private
 */
exports.getQueueDetails = async (req, res, next) => {
  try {
    const queue = await Queue.findById(req.params.queueId)
      .populate('clinicId', 'name address')
      .populate('doctorId', 'name specialization');
    
    if (!queue) {
      return sendError(res, 'Queue not found', 404);
    }
    
    sendSuccess(res, queue, 'Queue details retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Pause/Resume queue
 * @route   POST /api/queues/:queueId/pause
 * @access  Private (Doctor, Receptionist)
 */
exports.togglePause = async (req, res, next) => {
  try {
    const { queueId } = req.params;
    const { reason } = req.body;
    
    const queue = await Queue.findById(queueId);
    if (!queue) {
      return sendError(res, 'Queue not found', 404);
    }
    
    if (queue.status === 'open') {
      queue.status = 'paused';
      queue.pausedReason = reason || 'Doctor is on a break';
    } else if (queue.status === 'paused') {
      queue.status = 'open';
      queue.pausedReason = undefined;
    }
    
    await queue.save();
    
    // Emit real-time update
    const io = getSocketIO();
    if (io) {
      io.to(`queue-${queueId}`).emit('queue-status-changed', {
        queueId,
        status: queue.status,
        reason: queue.pausedReason,
      });
    }
    
    sendSuccess(res, queue, `Queue ${queue.status}`);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Close queue for the day
 * @route   POST /api/queues/:queueId/close
 * @access  Private (Doctor)
 */
exports.closeQueue = async (req, res, next) => {
  try {
    const { queueId } = req.params;
    
    const queue = await Queue.findById(queueId);
    if (!queue) {
      return sendError(res, 'Queue not found', 404);
    }
    
    queue.status = 'closed';
    queue.isActive = false;
    
    // Patients still waiting when the doctor ends the session early were
    // legitimately in line — they did not fail to show up. Mark them with
    // a distinct 'queue-closed' status instead of penalizing them as
    // 'no-show' (which is reserved for patients who were called but never
    // arrived).
    queue.entries.forEach(entry => {
      if (entry.status === 'waiting') {
        entry.status = 'queue-closed';
      }
    });
    
    await queue.save();
    
    // Emit real-time update
    const io = getSocketIO();
    if (io) {
      io.to(`queue-${queueId}`).emit('queue-status-changed', {
        queueId,
        status: 'closed',
      });
    }
    
    sendSuccess(res, queue, 'Queue closed for the day');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add emergency patient to queue
 * @route   POST /api/queues/:queueId/emergency
 * @access  Private (Doctor, Receptionist)
 */
exports.addEmergency = async (req, res, next) => {
  try {
    const { queueId } = req.params;
    const { patientName, patientPhone, emergencyReason } = req.body;

    if (!patientName || !patientName.trim()) {
      return sendError(res, 'Patient name is required for an emergency entry', 400);
    }

    const queue = await Queue.findById(queueId);
    if (!queue) {
      return sendError(res, 'Queue not found', 404);
    }
    
    const tokenNumber = queue.generateToken();
    
    const entry = {
      // No app account for walk-in emergency patients — leave patientId
      // unset. `addedBy` records the staff member who created the entry
      // for audit purposes only; it must never be treated as the patient.
      patientId: null,
      addedBy: req.user._id,
      patientName: patientName.trim(),
      patientPhone,
      tokenNumber,
      position: 1, // Emergency gets top priority
      status: 'waiting',
      priority: 'emergency',
      appointmentType: 'emergency',
      emergencyReason,
      estimatedWaitMinutes: 0, // Next in line
      joinedAt: new Date(),
    };
    
    queue.entries.push(entry);
    queue.stats.totalPatients += 1;
    queue.stats.emergencies += 1;
    
    // Reorder — emergency goes to front
    queue.reorderByPriority();
    
    await queue.save();
    
    // Emit real-time update
    const io = getSocketIO();
    if (io) {
      io.to(`queue-${queueId}`).emit('queue-updated', {
        queueId,
        action: 'emergency-added',
        entry: queue.entries.find(e => e.tokenNumber === tokenNumber),
        waitingCount: queue.getWaitingCount(),
        emergencyCount: queue.getEmergencyCount(),
      });
    }
    
    const addedEntry = queue.entries.find(e => e.tokenNumber === tokenNumber);

    await recordAudit(req, 'queue.entry.emergency-add', 'QueueEntry', addedEntry?._id, {
      queueId, tokenNumber, patientName: undefined, // never store patient name in audit metadata
    });

    sendSuccess(res, addedEntry, 'Emergency patient added to front of queue', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Record an AI-predicted wait time as a suggestion (called by the ML service)
 * @route   PUT /api/queues/:queueId/entry/:entryId/wait-time
 * @access  Private (Doctor, Receptionist)
 *
 * Issue #25 fix: previously this endpoint immediately overwrote
 * `estimatedWaitMinutes` — the figure shown to the patient — with
 * whatever the ML service returned, with no human review and no
 * confidence/quality check. A badly calibrated prediction (issue #24:
 * the model is trained on synthetic data) could cause a patient to miss
 * their turn.
 *
 * Now the prediction is stored as `predictedWaitMinutes` (a suggestion)
 * with its confidence and data-source provenance, and
 * `predictionStatus` is set to 'pending-review'. The patient-facing
 * `estimatedWaitMinutes` is left untouched until a staff member calls
 * `confirmWaitTime` (or `rejectWaitTime`).
 */
exports.updateWaitTime = async (req, res, next) => {
  try {
    const { queueId, entryId } = req.params;
    const { predictedWaitMinutes, confidence, dataSource } = req.body;

    if (typeof predictedWaitMinutes !== 'number' || predictedWaitMinutes < 0 || predictedWaitMinutes > 24 * 60) {
      return sendError(res, 'predictedWaitMinutes must be a number between 0 and 1440', 400);
    }
    
    const queue = await Queue.findById(queueId);
    if (!queue) {
      return sendError(res, 'Queue not found', 404);
    }
    
    const entry = queue.entries.id(entryId);
    if (!entry) {
      return sendError(res, 'Queue entry not found', 404);
    }
    
    entry.predictedWaitMinutes = predictedWaitMinutes;
    entry.predictionConfidence = ['high', 'medium'].includes(confidence) ? confidence : null;
    entry.predictionDataSource = ['synthetic', 'real'].includes(dataSource) ? dataSource : null;
    entry.predictionStatus = 'pending-review';
    entry.predictionReviewedBy = null;
    // NOTE: entry.estimatedWaitMinutes (patient-facing) is intentionally
    // left unchanged — see confirmWaitTime.
    
    await queue.save();
    
    sendSuccess(res, entry, 'Prediction recorded for staff review');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Apply (or reject) a pending AI wait-time prediction
 * @route   PUT /api/queues/:queueId/entry/:entryId/wait-time/review
 * @access  Private (Doctor, Receptionist)
 *
 * Issue #25 fix: this is the human-in-the-loop step. A staff member
 * reviews the AI suggestion (and its confidence / data-source
 * disclaimer, surfaced in the mobile UI) and explicitly decides whether
 * to apply it to the patient-facing `estimatedWaitMinutes`.
 */
exports.reviewWaitTime = async (req, res, next) => {
  try {
    const { queueId, entryId } = req.params;
    const { action } = req.body; // 'confirm' | 'reject'

    if (!['confirm', 'reject'].includes(action)) {
      return sendError(res, "action must be 'confirm' or 'reject'", 400);
    }

    const queue = await Queue.findById(queueId);
    if (!queue) {
      return sendError(res, 'Queue not found', 404);
    }

    const entry = queue.entries.id(entryId);
    if (!entry) {
      return sendError(res, 'Queue entry not found', 404);
    }

    if (entry.predictionStatus !== 'pending-review') {
      return sendError(res, 'No pending AI prediction to review for this entry', 400);
    }

    if (action === 'confirm') {
      entry.estimatedWaitMinutes = entry.predictedWaitMinutes;
      entry.predictionStatus = 'confirmed';
    } else {
      entry.predictionStatus = 'rejected';
    }
    entry.predictionReviewedBy = req.user._id;

    await queue.save();

    await recordAudit(req, `queue.wait-time.${action}`, 'QueueEntry', entry._id, {
      queueId, predictedWaitMinutes: entry.predictedWaitMinutes,
    });

    sendSuccess(res, entry, `Prediction ${action}ed`);
  } catch (error) {
    next(error);
  }
};
