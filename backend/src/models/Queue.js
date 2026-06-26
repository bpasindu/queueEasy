/**
 * QueueEase V2 — Queue Model
 * Manages the queue for a clinic with emergency priority support.
 */

const mongoose = require('mongoose');

const QUEUE_ENTRY_SCHEMA = new mongoose.Schema({
  // For self-registered patients this references their User account.
  // For staff-added emergency walk-ins with no app account, this is left
  // unset — the entry is identified by patientName/patientPhone instead,
  // and `addedBy` records which staff member created the entry.
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
    default: null,
  },
  patientName: { type: String, required: true },
  patientPhone: { type: String },

  // Staff member who created this entry on behalf of the patient
  // (used for emergency/walk-in entries added by doctor/receptionist).
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  
  // Queue position
  tokenNumber: {
    type: String,
    required: true,
  },
  position: {
    type: Number,
    required: true,
  },
  
  // Status: waiting | in-consultation | completed | cancelled | no-show | queue-closed
  status: {
    type: String,
    enum: ['waiting', 'in-consultation', 'completed', 'cancelled', 'no-show', 'queue-closed'],
    default: 'waiting',
  },
  
  // Priority: normal | urgent | emergency
  priority: {
    type: String,
    enum: ['normal', 'urgent', 'emergency'],
    default: 'normal',
  },
  
  // Emergency details
  emergencyReason: {
    type: String,
    trim: true,
  },
  
  // Appointment type
  appointmentType: {
    type: String,
    enum: ['walk-in', 'appointment', 'follow-up', 'emergency'],
    default: 'walk-in',
  },
  
  // Time tracking
  joinedAt: {
    type: Date,
    default: Date.now,
  },
  estimatedWaitMinutes: {
    type: Number,
  },
  calledAt: {
    type: Date,
  },
  consultationStartedAt: {
    type: Date,
  },
  completedAt: {
    type: Date,
  },
  
  // Consultation notes
  notes: {
    type: String,
    trim: true,
  },
  
  // AI predicted wait time (issue #25 fix)
  //
  // `predictedWaitMinutes` is now ALWAYS advisory. It is shown to staff
  // as a suggestion, but is never automatically copied into
  // `estimatedWaitMinutes` (the patient-facing figure) — see
  // queueController.updateWaitTime / confirmWaitTime. A staff member
  // must explicitly confirm the suggestion before it becomes the
  // displayed estimate.
  predictedWaitMinutes: {
    type: Number,
  },
  predictionConfidence: {
    type: String,
    enum: ['high', 'medium', null],
    default: null,
  },
  // Issue #24 fix: carries through the ML model's training-data
  // provenance so staff know how much to trust the suggestion.
  predictionDataSource: {
    type: String,
    enum: ['synthetic', 'real', null],
    default: null,
  },
  predictionStatus: {
    type: String,
    enum: ['none', 'pending-review', 'confirmed', 'rejected'],
    default: 'none',
  },
  predictionReviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
}, { _id: true });

const QUEUE_SCHEMA = new mongoose.Schema({
  clinicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Clinic',
    required: true,
    index: true,
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  
  // Date of the queue
  date: {
    type: Date,
    required: true,
  },
  
  // Current serving token
  currentToken: {
    type: String,
    default: null,
  },
  currentPosition: {
    type: Number,
    default: 0,
  },
  
  // Counter for token generation
  tokenCounter: {
    type: Number,
    default: 0,
  },
  
  // Queue entries
  entries: [QUEUE_ENTRY_SCHEMA],
  
  // Statistics
  stats: {
    totalPatients: { type: Number, default: 0 },
    completed: { type: Number, default: 0 },
    cancelled: { type: Number, default: 0 },
    noShows: { type: Number, default: 0 },
    emergencies: { type: Number, default: 0 },
    averageWaitMinutes: { type: Number, default: 0 },
    averageConsultationMinutes: { type: Number, default: 0 },
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true,
  },
  status: {
    type: String,
    enum: ['open', 'paused', 'closed'],
    default: 'open',
  },
  
  // Paused reason
  pausedReason: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

// Compound index: one active queue per clinic per doctor per date
QUEUE_SCHEMA.index({ clinicId: 1, doctorId: 1, date: 1 }, { unique: true });

// Method: Get next position
QUEUE_SCHEMA.methods.getNextPosition = function () {
  const waitingEntries = this.entries.filter(e => e.status === 'waiting');
  return waitingEntries.length + 1;
};

// Method: Generate token number
QUEUE_SCHEMA.methods.generateToken = function () {
  this.tokenCounter += 1;
  const prefix = 'Q';
  const dateStr = new Date().toISOString().slice(8, 10); // DD
  return `${prefix}${dateStr}-${String(this.tokenCounter).padStart(3, '0')}`;
};

// Method: Get waiting count
QUEUE_SCHEMA.methods.getWaitingCount = function () {
  return this.entries.filter(e => e.status === 'waiting').length;
};

// Method: Get emergency count
QUEUE_SCHEMA.methods.getEmergencyCount = function () {
  return this.entries.filter(e => e.status === 'waiting' && e.priority === 'emergency').length;
};

// Method: Get average consultation minutes, with a sensible default
// (15 minutes) for queues that haven't completed any consultations yet.
// Centralized here so joinQueue and checkIn can't drift out of sync.
QUEUE_SCHEMA.methods.getAverageConsultationMinutes = function () {
  return this.stats.averageConsultationMinutes || 15;
};

// Method: Reorder by priority (emergency first, then urgent, then normal)
QUEUE_SCHEMA.methods.reorderByPriority = function () {
  const priorityOrder = { emergency: 0, urgent: 1, normal: 2 };
  const waitingEntries = this.entries.filter(e => e.status === 'waiting');
  const otherEntries = this.entries.filter(e => e.status !== 'waiting');
  
  waitingEntries.sort((a, b) => {
    const pA = priorityOrder[a.priority] ?? 2;
    const pB = priorityOrder[b.priority] ?? 2;
    if (pA !== pB) return pA - pB;
    return new Date(a.joinedAt) - new Date(b.joinedAt);
  });
  
  // Reassign positions
  waitingEntries.forEach((entry, idx) => {
    entry.position = idx + 1;
  });
  
  this.entries = [...waitingEntries, ...otherEntries];
};

module.exports = mongoose.model('Queue', QUEUE_SCHEMA);
