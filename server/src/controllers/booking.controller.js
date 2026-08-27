// server/src/controllers/booking.controller.js
import prisma from '../utils/prisma.js';
import { emailQueue } from '../queues/emailQueue.js';
import { getAvailableSlots } from '../utils/slotCalculator.js';
import { parse, addMinutes, format } from 'date-fns';

// 1. PUBLIC: Fetch open time slots for a specific date
export const getSlots = async (req, res) => {
  try {
    const { date, serviceId } = req.query; // e.g. date: '2026-09-01', serviceId: '1'
    const dayOfWeek = new Date(date).getDay();

    // Check if she works on this day
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
      notes 
    } = req.body;
    // 1. Fetch the service to get its duration in minutes
    const service = await prisma.service.findUnique({
      where: { id: Number(serviceId) }
    });

    if (!service) {
      return res.status(404).json({ error: 'Service not found.' });
    }

    // 2. Calculate endTime dynamically using date-fns
    // Parse the start time (e.g. "09:00" on "2026-08-16")
    const startDateTime = parse(`${appointmentDate} ${startTime}`, 'yyyy-MM-dd HH:mm', new Date());
    
    // Add the service duration minutes (e.g., +60 mins or +75 mins)
    const endDateTime = addMinutes(startDateTime, service.durationMinutes);
    
    // Format back to "HH:mm" string
    const endTime = format(endDateTime, 'HH:mm');

    const newAppointment = await prisma.appointment.create({
      data: {
        serviceId: Number(serviceId),
        clientName,
        clientEmail,
        clientPhone : clientPhone || null,
        sessionFormat:sessionFormat || 'online',
        appointmentDate: new Date(appointmentDate),
        startTime,
        endTime,
        status: 'pending',
        notes : notes || null
      }
    });

    // (Optional: trigger email notification to Nkatha here)

    return res.status(201).json({ success: true, appointment: newAppointment });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to create appointment' });
  }
};

/**
 * GET /api/bookings
 * ADMIN: Fetches all appointments from the database
 */
export const getAllAppointments = async (req, res) => {
  try {
    const appointments = await prisma.appointment.findMany({
      orderBy: [
        { startTime: 'asc' },
      ],
      include: { service: true }
    });
    
    res.json(appointments);
  } catch (error) {
    console.error('Error fetching all appointments:', error);
    res.status(500).json({ error: 'Failed to fetch appointments.' });
  }
};

/**
 * PATCH /api/bookings/:id/status
 * ADMIN: Updates the status of an appointment (APPROVED, REJECTED)
 */
export const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['APPROVED', 'REJECTED', 'PENDING'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status provided.' });
    }

    const updatedAppointment = await prisma.appointment.update({
      where: { id: parseInt(id) }, // Prisma expects an integer for the ID
      data: { status },
      include: { service: true } // Include the related service for email content
    });
    if(status === 'APPROVED'){
      // 2. Add an email job to the queue (Takes milliseconds!)
      await emailQueue.add('send-email', {
        type: 'APPROVAL',
        appointment: updatedAppointment,
      });
    }
    if(status === 'REJECTED'){
      await emailQueue.add('send-email', {
        type: 'REJECTED',
        appointment: updatedAppointment,
      });
    }
    // 3. Instantly respond to the frontend admin panel
    res.json({ success: true, message: 'Appointment approved! Email is processing in the background.' });
  } catch (error) {
    console.error('Error updating appointment status:', error);
    res.status(500).json({ error: 'Failed to update appointment status.' });
  }
};
