import prisma from '../utils/prisma.js';
import { emailQueue } from '../queues/emailQueue.js';
import { getAvailableSlots } from '../utils/slotCalculator.js';
import { parse, addMinutes, format } from 'date-fns';
import { logActivity } from '../utils/logger.js';

// 1. PUBLIC: Fetch open time slots for a specific date
export const getSlots = async (req, res) => {
  try {
    const { date, serviceId } = req.query; // e.g. date: '2026-09-01', serviceId: '1'
    const dayOfWeek = new Date(date).getDay();

    // Check if the business works on this day
    const hours = await prisma.workingHours.findUnique({ where: { dayOfWeek } });
    if (!hours || !hours.isWorking) {
      return res.json({ slots: [] }); // Day off
    }

    // Get the duration of the selected service
    const service = await prisma.service.findUnique({ where: { id: Number(serviceId) } });
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    // Get any bookings already scheduled for that day
    const existingAppointments = await prisma.appointment.findMany({
      where: {
        appointmentDate: new Date(date),
        status: { not: 'cancelled' }
      },
      select: { startTime: true, endTime: true }
    });

    // Run the calculation engine
    const slots = getAvailableSlots(
      date,
      { startTime: hours.startTime, endTime: hours.endTime },
      service.durationMinutes,
      existingAppointments
    );

    return res.json({ slots });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to calculate available slots' });
  }
};

// 2. PUBLIC: Save a new booking request
export const createAppointment = async (req, res) => {
  try {
    const { 
      serviceId, 
      clientName, 
      clientEmail, 
      clientPhone, 
      sessionFormat, 
      appointmentDate, 
      startTime,
      notes,
      therapistId // Optional: if booking a specific therapist
    } = req.body;

    // 1. Fetch the service to get its duration in minutes
    const service = await prisma.service.findUnique({
      where: { id: Number(serviceId) }
    });

    if (!service) {
      return res.status(404).json({ error: 'Service not found.' });
    }

    // 2. Calculate endTime dynamically using date-fns
    const startDateTime = parse(`${appointmentDate} ${startTime}`, 'yyyy-MM-dd hh:mm a', new Date());
    const endDateTime = addMinutes(startDateTime, service.durationMinutes);
    const endTime = format(endDateTime, 'HH:mm');

    const newAppointment = await prisma.appointment.create({
      data: {
        serviceId: Number(serviceId),
        therapistId: therapistId ? Number(therapistId) : null,
        clientName,
        clientEmail,
        clientPhone: clientPhone || null,
        sessionFormat: sessionFormat || 'online',
        appointmentDate: new Date(appointmentDate),
        startTime,
        endTime,
        status: 'pending',
        notes: notes || null
      }
    });

    return res.status(201).json({ success: true, appointment: newAppointment });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to create appointment' });
  }
};

/**
 * GET /api/bookings
 * ADMIN / THERAPIST: Fetches appointments scoped to user role
 */
export const getAllAppointments = async (req, res) => {
  try {
    const { role, id: userId } = req.user;

    let appointments;

    if (role === 'SUPER_ADMIN') {
      // Super Admin sees all appointments across all practitioners
      appointments = await prisma.appointment.findMany({
        orderBy: [{ startTime: 'asc' }],
        include: { 
          service: true,
          user: {
            select: { id: true, name: true, email: true }
          }
        }
      });
    } else if (role === 'THERAPIST') {
      // Therapists only see bookings explicitly assigned to them
      appointments = await prisma.appointment.findMany({
        where: { therapistId: userId },
        orderBy: [{ startTime: 'asc' }],
        include: { service: true }
      });
    } else {
      return res.status(403).json({ error: 'Unauthorized access.' });
    }
    
    return res.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return res.status(500).json({ error: 'Failed to fetch appointments.' });
  }
};

/**
 * PATCH /api/bookings/:id/status
 * ADMIN / THERAPIST: Updates status, handles assignment, and logs the action
 */
export const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, therapistId } = req.body;
    const { role, id: userId } = req.user;

    const appointmentId = parseInt(id);

    const existingAppointment = await prisma.appointment.findUnique({
      where: { id: appointmentId }
    });

    if (!existingAppointment) {
      return res.status(404).json({ error: 'Appointment not found.' });
    }

    // Restrict standard therapists from modifying other therapists' bookings
    if (role === 'THERAPIST' && existingAppointment.therapistId !== userId) {
      return res.status(403).json({ error: 'You can only update your own assigned appointments.' });
    }

    if (status && !['APPROVED', 'REJECTED', 'PENDING', 'confirmed', 'cancelled', 'completed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status provided.' });
    }

    const updateData = {};
    if (status) updateData.status = status;
    
    // Only Super Admins can assign/reassign therapists
    if (role === 'SUPER_ADMIN' && therapistId !== undefined) {
      updateData.therapistId = therapistId ? parseInt(therapistId) : null;
    }

    const updatedAppointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: updateData,
      include: { service: true, user: true }
    });

    // Background Email Queue triggers
    if (status === 'APPROVED' || status === 'confirmed') {
      await emailQueue.add('send-email', {
        type: 'APPROVAL',
        appointment: updatedAppointment,
      });
    } else if (status === 'REJECTED' || status === 'cancelled') {
      await emailQueue.add('send-email', {
        type: 'REJECTED',
        appointment: updatedAppointment,
      });
    }

    // Log the audit trail
    await logActivity({
      userId,
      action: `APPOINTMENT_${status ? status.toUpperCase() : 'UPDATED'}`,
      target: `Appointment #${appointmentId} for ${updatedAppointment.clientName}`,
      ipAddress: req.ip,
    });

    return res.json({ success: true, message: 'Appointment updated successfully.', appointment: updatedAppointment });
  } catch (error) {
    console.error('Error updating appointment status:', error);
    return res.status(500).json({ error: 'Failed to update appointment status.' });
  }
};