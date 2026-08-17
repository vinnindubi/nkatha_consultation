import express from 'express';
// We import the functions exported from the controller
import { getSlots, createAppointment,getAllAppointments, 
  updateAppointmentStatus } from '../controllers/booking.controller.js';
import { verifyAdmin } from '../middleware/auth.middleware.js';
const router = express.Router();

/**
 * PUBLIC ENDPOINTS (No login required)
 * Base path: /api/bookings
 */

// GET /api/bookings/slots?date=YYYY-MM-DD&serviceId=1
// Returns available time slots for the booking calendar
router.get('/slots', getSlots);

// POST /api/bookings
// Submits a new appointment request
router.post('/', createAppointment);

// GET /api/bookings/appointments
// ADMIN: Fetches all appointments
router.get('/appointments', verifyAdmin, getAllAppointments);

// PATCH /api/bookings/appointments/:id/status
// ADMIN: Updates the status of an appointment
router.patch('/appointments/:id/status', verifyAdmin, updateAppointmentStatus);

export default router;