/**
 * QueueEase V2 — Audit Log Model
 *
 * Records who accessed or modified sensitive patient/clinical records,
 * and when. This is a regulatory requirement (Sri Lanka Personal Data
 * Protection Act, 2022) for healthcare systems.
 *
 * Entries are append-only — there is deliberately no update/delete
 * functionality exposed anywhere in the API.
 */

const mongoose = require('mongoose');

const AUDIT_LOG_SCHEMA = new mongoose.Schema({
  // Who performed the action
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  userRole: {
    type: String,
    enum: ['patient', 'doctor', 'receptionist', 'system'],
    required: true,
  },

  // What was done, e.g. 'appointment.view', 'appointment.cancel',
  // 'appointment.prescription.update', 'queue.entry.cancel'
  action: {
    type: String,
    required: true,
    index: true,
  },

  // What record was affected
  resourceType: {
    type: String,
    required: true,
  },
  resourceId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true,
  },

  // Optional extra context (never store full PHI payloads here —
  // just enough to reconstruct "what changed")
  metadata: {
    type: mongoose.Schema.Types.Mixed,
  },

  ipAddress: {
    type: String,
  },
}, {
  timestamps: true,
});

AUDIT_LOG_SCHEMA.index({ resourceType: 1, resourceId: 1, createdAt: -1 });

module.exports = mongoose.model('AuditLog', AUDIT_LOG_SCHEMA);
