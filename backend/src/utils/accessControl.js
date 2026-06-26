/**
 * QueueEase V2 — Access Control Helpers
 *
 * Centralizes the "does this user have a right to see/touch this record"
 * checks that were previously missing from several controllers
 * (appointment access, appointment cancellation, clinic appointment lists).
 */

const Clinic = require('../models/Clinic');

/**
 * Returns true if `user` (doctor or receptionist) belongs to the clinic
 * identified by `clinicId`.
 *
 * - Doctors belong to a clinic if they own it (Clinic.doctorId) or it is
 *   listed in their `clinicIds`.
 * - Receptionists belong to a clinic if it matches their `employedClinicId`
 *   or is listed in the clinic's `receptionistIds`.
 */
async function userBelongsToClinic(user, clinicId) {
  if (!clinicId) return false;
  const clinicIdStr = clinicId.toString();

  if (user.role === 'doctor') {
    if ((user.clinicIds || []).some((id) => id.toString() === clinicIdStr)) {
      return true;
    }
    const clinic = await Clinic.findById(clinicId).select('doctorId');
    return !!clinic && clinic.doctorId?.toString() === user._id.toString();
  }

  if (user.role === 'receptionist') {
    if (user.employedClinicId?.toString() === clinicIdStr) {
      return true;
    }
    const clinic = await Clinic.findById(clinicId).select('receptionistIds');
    return !!clinic && (clinic.receptionistIds || []).some(
      (id) => id.toString() === user._id.toString()
    );
  }

  return false;
}

/**
 * Returns true if `user` is allowed to view/manage `appointment`:
 *  - the patient who booked it
 *  - the doctor it is booked with
 *  - a receptionist belonging to the appointment's clinic
 */
async function userCanAccessAppointment(user, appointment) {
  if (!user || !appointment) return false;

  if (user.role === 'patient') {
    return appointment.patientId?.toString() === user._id.toString();
  }

  if (user.role === 'doctor') {
    if (appointment.doctorId?.toString() === user._id.toString()) return true;
    return userBelongsToClinic(user, appointment.clinicId);
  }

  if (user.role === 'receptionist') {
    return userBelongsToClinic(user, appointment.clinicId);
  }

  return false;
}

module.exports = { userBelongsToClinic, userCanAccessAppointment };
