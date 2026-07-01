/**
 * QueueEase V2 — Audit Logging Helper
 *
 * Fire-and-forget audit trail writer. Failures to write an audit entry
 * must never break the primary request, but are logged server-side so
 * gaps in the audit trail can be detected.
 */

const AuditLog = require('../models/AuditLog');

/**
 * @param {object} req - Express request (used for user + IP)
 * @param {string} action - e.g. 'appointment.view'
 * @param {string} resourceType - e.g. 'Appointment'
 * @param {string|object} resourceId - Mongo ObjectId of the affected record
 * @param {object} [metadata] - small, non-PHI context (e.g. { status: 'cancelled' })
 */
async function recordAudit(req, action, resourceType, resourceId, metadata = {}) {
  try {
    await AuditLog.create({
      userId: req.user?._id,
      userRole: req.user?.role || 'system',
      action,
      resourceType,
      resourceId,
      metadata,
      ipAddress: req.ip,
    });
  } catch (err) {
    // Never let audit logging break the request — but make sure the
    // failure itself is visible in server logs.
    console.error('[audit] Failed to write audit log entry:', err.message);
  }
}

module.exports = { recordAudit };
