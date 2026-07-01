/**
 * QueueEase V2 — Appointment Controller
 */

const Appointment = require('../models/Appointment');
const Queue = require('../models/Queue');
const Clinic = require('../models/Clinic');
const Notification = require('../models/Notification');
const AppError = require('../utils/AppError');
const { sendSuccess, sendError, sendPaginated } = require('../utils/apiResponse');
const { getSocketIO } = require('../sockets');
const { userCanAccessAppointment, userBelongsToClinic } = require('../utils/accessControl');
const { recordAudit } = require('../utils/auditLog');
const { toUTCDateOnly } = require('../utils/dateUtils');

/**
 * @desc    Create appointment
 * @route   POST /api/appointments
 * @access  Private (Patient)
 */
exports.createAppointment = async (req, res, next) => {
  try {
    const { clinicId, doctorId, date, timeSlot, type, reason, symptoms } = req.body;
    
    // Check clinic exists
    const clinic = await Clinic.findById(clinicId);
    if (!clinic) {
      return sendError(res, 'Clinic not found', 404);
    }
    
    // Normalize to UTC midnight of the calendar day. The actual time of
    // day is carried entirely in timeSlot.start/end, so the stored `date`
    // must not depend on the client's local timezone (issue #17).
    const appointmentDate = toUTCDateOnly(date);

    // Check for time slot conflicts
    const existingAppointment = await Appointment.findOne({
      clinicId,
      doctorId,
      date: appointmentDate,
      'timeSlot.start': timeSlot.start,
      status: { $in: ['scheduled', 'confirmed'] },
    });
    
    if (existingAppointment) {
      return sendError(res, 'This time slot is already booked', 409);
    }
    
    const appointment = await Appointment.create({
      patientId: req.user._id,
      clinicId,
      doctorId,
      date: appointmentDate,
      timeSlot,
      type,
      reason,
      symptoms,
    });
    
    await appointment.populate('clinicId', 'name address');
    await appointment.populate('doctorId', 'name specialization');
    
    // Notify doctor
    await Notification.create({
      userId: doctorId,
      type: 'appointment-confirmed',
      title: 'New Appointment',
      body: `New ${type} appointment with ${req.user.name} on ${appointmentDate.toLocaleDateString()}`,
      clinicId,
      appointmentId: appointment._id,
    });

    await recordAudit(req, 'appointment.create', 'Appointment', appointment._id, {
      clinicId, doctorId, date: appointmentDate,
    });
    
    sendSuccess(res, appointment, 'Appointment created successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get my appointments
 * @route   GET /api/appointments/my
 * @access  Private
 */
exports.getMyAppointments = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const filter = {};
    
    if (req.user.role === 'patient') {
      filter.patientId = req.user._id;
    } else if (req.user.role === 'doctor') {
      filter.doctorId = req.user._id;
    } else if (req.user.role === 'receptionist') {
      // Issue #21 fix: previously neither branch matched for
      // receptionists, leaving `filter` as `{}` and returning every
      // appointment across every clinic. Receptionists may only see
      // appointments for the clinic they are employed at.
      if (!req.user.employedClinicId) {
        return sendError(res, 'Your account is not assigned to a clinic yet. Please contact an administrator.', 403);
      }
      filter.clinicId = req.user.employedClinicId;
    } else {
      return sendError(res, 'Unsupported role', 403);
    }
    
    if (status) filter.status = status;
    
    const appointments = await Appointment.find(filter)
      .populate('patientId', 'name phone')
      .populate('clinicId', 'name address')
      .populate('doctorId', 'name specialization')
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    
    const total = await Appointment.countDocuments(filter);
    
    sendPaginated(res, appointments, { total, page: Number(page), limit: Number(limit) }, 'Appointments retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get appointment by ID
 * @route   GET /api/appointments/:id
 * @access  Private (only the patient, their doctor, or clinic receptionist)
 */
exports.getAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patientId', 'name phone email')
      .populate('clinicId', 'name address phone')
      .populate('doctorId', 'name specialization');
    
    if (!appointment) {
      return sendError(res, 'Appointment not found', 404);
    }

    // Issue #6 fix: previously any authenticated user could read any
    // appointment by ID, exposing another patient's symptoms,
    // prescription, and contact details.
    const allowed = await userCanAccessAppointment(req.user, appointment);
    if (!allowed) {
      return sendError(res, 'You are not authorized to view this appointment', 403);
    }

    await recordAudit(req, 'appointment.view', 'Appointment', appointment._id, {
      patientId: appointment.patientId?._id,
    });
    
    sendSuccess(res, appointment, 'Appointment retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Check-in for appointment (adds to queue)
 * @route   POST /api/appointments/:id/check-in
 * @access  Private (Patient or Receptionist)
 */
exports.checkIn = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return sendError(res, 'Appointment not found', 404);
    }

    const allowed = await userCanAccessAppointment(req.user, appointment);
    if (!allowed) {
      return sendError(res, 'You are not authorized to check in this appointment', 403);
    }
    
    if (appointment.status !== 'confirmed' && appointment.status !== 'scheduled') {
      return sendError(res, 'Appointment cannot be checked in', 400);
    }
    
    appointment.status = 'checked-in';
    await appointment.save();
    
    // Auto-join queue
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let queue = await Queue.findOne({
      clinicId: appointment.clinicId,
      date: today,
    });
    
    if (queue) {
      const tokenNumber = queue.generateToken();
      const position = queue.getNextPosition();
      
      const entry = {
        patientId: appointment.patientId,
        patientName: req.user.name,
        tokenNumber,
        position,
        appointmentType: 'appointment',
        // Issue #15: centralized fallback (queue.getAverageConsultationMinutes())
        // so this can never drift out of sync with joinQueue's calculation.
        estimatedWaitMinutes: queue.getWaitingCount() * queue.getAverageConsultationMinutes(),
        joinedAt: new Date(),
      };
      
      queue.entries.push(entry);

      // Issue #16 fix: capture the new subdocument's _id BEFORE calling
      // reorderByPriority(). Mongoose assigns the _id as soon as the
      // subdocument is pushed, but reorderByPriority() re-sorts and
      // rebuilds `queue.entries`, so reading
      // `entries[entries.length - 1]._id` *after* reordering is not
      // guaranteed to reference the entry we just added.
      const newEntryId = queue.entries[queue.entries.length - 1]._id;

      queue.reorderByPriority();
      await queue.save();
      
      appointment.queueId = queue._id;
      appointment.queueEntryId = newEntryId;
      appointment.tokenNumber = tokenNumber;
      await appointment.save();
      
      // Emit real-time update
      const io = getSocketIO();
      if (io) {
        io.to(`queue-${queue._id}`).emit('queue-updated', {
          queueId: queue._id,
          action: 'patient-joined',
          waitingCount: queue.getWaitingCount(),
        });
      }
    }

    await recordAudit(req, 'appointment.check-in', 'Appointment', appointment._id, {
      patientId: appointment.patientId,
    });
    
    sendSuccess(res, appointment, 'Checked in successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cancel appointment
 * @route   POST /api/appointments/:id/cancel
 * @access  Private (only the patient, their doctor, or clinic receptionist)
 */
exports.cancelAppointment = async (req, res, next) => {
  try {
    const { reason } = req.body;
    
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return sendError(res, 'Appointment not found', 404);
    }

    // Issue #7 fix: previously any authenticated user could cancel any
    // appointment by ID (no ownership/role check at all).
    const allowed = await userCanAccessAppointment(req.user, appointment);
    if (!allowed) {
      return sendError(res, 'You are not authorized to cancel this appointment', 403);
    }

    if (['completed', 'cancelled'].includes(appointment.status)) {
      return sendError(res, `Appointment is already ${appointment.status} and cannot be cancelled`, 400);
    }
    
    appointment.status = 'cancelled';
    appointment.cancelledBy = req.user._id;
    appointment.cancellationReason = reason;
    await appointment.save();

    await recordAudit(req, 'appointment.cancel', 'Appointment', appointment._id, {
      reason, cancelledBy: req.user._id,
    });
    
    sendSuccess(res, appointment, 'Appointment cancelled');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add a new prescription version for an appointment
 * @route   POST /api/appointments/:id/prescription
 * @access  Private (Doctor — must be the appointment's doctor)
 *
 * Issue #26 fix: prescriptions are append-only. This never edits an
 * existing entry — it always pushes a new, fully-specified version onto
 * `prescriptionHistory`, stamped with the prescribing doctor and a
 * timestamp. The patient's medication history is therefore a complete,
 * tamper-evident chain rather than a single mutable field.
 */
exports.addPrescription = async (req, res, next) => {
  try {
    const { medications, labTests, advice, followUpDate } = req.body;

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return sendError(res, 'Appointment not found', 404);
    }

    if (appointment.doctorId?.toString() !== req.user._id.toString()) {
      return sendError(res, 'Only the prescribing doctor for this appointment may add a prescription', 403);
    }

    const nextVersion = (appointment.prescriptionHistory?.length || 0) + 1;

    appointment.prescriptionHistory.push({
      version: nextVersion,
      medications: Array.isArray(medications) ? medications : [],
      labTests: Array.isArray(labTests) ? labTests : [],
      advice,
      followUpDate,
      authorId: req.user._id,
      createdAt: new Date(),
    });

    await appointment.save();

    await recordAudit(req, 'appointment.prescription.add', 'Appointment', appointment._id, {
      version: nextVersion,
    });

    sendSuccess(res, appointment.currentPrescription, 'Prescription added', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get clinic appointments (for doctor/receptionist)
 * @route   GET /api/appointments/clinic/:clinicId
 * @access  Private (Doctor, Receptionist — must belong to the clinic)
 */
exports.getClinicAppointments = async (req, res, next) => {
  try {
    const { clinicId } = req.params;
    const { date, status } = req.query;

    // Issue #8 fix: previously any doctor/receptionist could pass any
    // clinicId and read appointments for a clinic they have no
    // relationship to.
    const belongs = await userBelongsToClinic(req.user, clinicId);
    if (!belongs) {
      return sendError(res, 'You are not authorized to view appointments for this clinic', 403);
    }
    
    const filter = { clinicId };
    if (date) filter.date = toUTCDateOnly(date);
    if (status) filter.status = status;
    
    const appointments = await Appointment.find(filter)
      .populate('patientId', 'name phone')
      .populate('doctorId', 'name specialization')
      .sort({ 'timeSlot.start': 1 });

    await recordAudit(req, 'appointment.clinic.list', 'Clinic', clinicId, {
      date, status, count: appointments.length,
    });
    
    sendSuccess(res, appointments, 'Clinic appointments retrieved');
  } catch (error) {
    next(error);
  }
};
