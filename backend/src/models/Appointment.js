/**
 * QueueEase — Appointment Model
 */

const mongoose = require('mongoose')

const APPOINTMENT_SCHEMA = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  clinicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Clinic',
    required: true,
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  // Appointment details
  date: {
    type: Date,
    required: true,
  },
  timeSlot: {
    start: { type: String, required: true }, // HH:mm
    end: { type: String, required: true },
  },

  // Type
  type: {
    type: String,
    enum: ['consultation', 'follow-up', 'check-up', 'procedure', 'emergency'],
    default: 'consultation',
  },

  // Status
  status: {
    type: String,
    enum: ['scheduled', 'confirmed', 'checked-in', 'in-progress', 'completed', 'cancelled', 'no-show'],
    default: 'scheduled',
  },

  // Reason for visit
  reason: {
    type: String,
    trim: true,
    maxlength: 500,
  },

  // Symptoms
  symptoms: [{
    type: String,
    trim: true,
  }],

  // Queue reference (once checked in)
  queueId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Queue',
  },
  queueEntryId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  tokenNumber: {
    type: String,
  },

  // Notes
  doctorNotes: {
    type: String,
    trim: true,
  },
  receptionistNotes: {
    type: String,
    trim: true,
  },

  // Prescription history (issue #26 fix)
  //
  // Previously `prescription` was a single mutable sub-document with no
  // versioning, signature, or audit trail — any later edit silently
  // overwrote the original prescription with no record of what changed
  // or who changed it.
  //
  // Now prescriptions are append-only entries. Each entry is a complete
  // snapshot ("version") of the prescription at the time it was issued,
  // stamped with the prescribing doctor and a timestamp. There is no API
  // for editing or deleting an entry — to change a prescription, a new
  // version is appended (see appointmentController.addPrescription).
  // The "current" prescription is simply the most recent entry.
  prescriptionHistory: [{
    version: { type: Number, required: true },
    medications: [{
      name: String,
      dosage: String,
      frequency: String,
      duration: String,
      notes: String,
    }],
    labTests: [String],
    advice: String,
    followUpDate: Date,
    // Doctor who issued this version — append-only audit chain.
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }],

  // Payment
  payment: {
    amount: { type: Number, default: 0 },
    currency: { type: String, default: 'LKR' },
    status: {
      type: String,
      enum: ['pending', 'paid', 'waived'],
      default: 'pending',
    },
    method: {
      type: String,
      enum: ['cash', 'card', 'insurance', 'other'],
    },
    paidAt: Date,
  },

  // Reminder sent
  reminderSent: {
    type: Boolean,
    default: false,
  },

  // Cancelled by
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  cancellationReason: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

APPOINTMENT_SCHEMA.index({ patientId: 1, date: 1 });
APPOINTMENT_SCHEMA.index({ clinicId: 1, doctorId: 1, date: 1 });
APPOINTMENT_SCHEMA.index({ status: 1 });

APPOINTMENT_SCHEMA.set('toJSON', { virtuals: true });
APPOINTMENT_SCHEMA.set('toObject', { virtuals: true });

// The "current" prescription is just the latest entry in the append-only
// history (issue #26).
APPOINTMENT_SCHEMA.virtual('currentPrescription').get(function () {
  if (!this.prescriptionHistory || this.prescriptionHistory.length === 0) return null;
  return this.prescriptionHistory[this.prescriptionHistory.length - 1];
});

module.exports = mongoose.model('Appointment', APPOINTMENT_SCHEMA);
