/**
 * QueueEase V2 — Appointment Routes
 */

const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { protect, authorize, requireVerified } = require('../middleware/auth');
const { createAppointmentValidation } = require('../middleware/validators');

router.post('/', protect, authorize('patient'), createAppointmentValidation, appointmentController.createAppointment);
router.get('/my', protect, appointmentController.getMyAppointments);
router.get(
  '/clinic/:clinicId',
  protect,
  authorize('doctor', 'receptionist'),
  requireVerified,
  appointmentController.getClinicAppointments
);
router.get('/:id', protect, appointmentController.getAppointment);
router.post('/:id/check-in', protect, appointmentController.checkIn);
router.post('/:id/cancel', protect, appointmentController.cancelAppointment);
router.post('/:id/prescription', protect, authorize('doctor'), requireVerified, appointmentController.addPrescription);

module.exports = router;
