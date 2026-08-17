import { parse, addMinutes, isBefore, isEqual, format, isAfter } from 'date-fns';

/**
 * Calculates available time slots for a given day.
 * 
 * @param {string} dateStr - The requested date "YYYY-MM-DD"
 * @param {object} workingHours - { startTime: "09:00", endTime: "17:00" }
 * @param {number} serviceDuration - Duration in minutes (e.g., 60)
 * @param {array} existingAppointments - Array of { startTime: "10:15", endTime: "11:15" }
 * @param {number} bufferMinutes - Break time between sessions (default: 15)
 * @returns {array} Array of available start times ["09:00", "10:15", ...]
 */
export const getAvailableSlots = (
  dateStr,
  workingHours,
  serviceDuration,
  existingAppointments,
  bufferMinutes = 15
) => {
  const availableSlots = [];
  const now = new Date();

  // 1. Parse start and end times into date objects for the specific day
  // Using a reference date ensures the math works perfectly
  const dayStart = parse(`${dateStr} ${workingHours.startTime}`, 'yyyy-MM-dd HH:mm', new Date());
  const dayEnd = parse(`${dateStr} ${workingHours.endTime}`, 'yyyy-MM-dd HH:mm', new Date());

  let currentSlotStart = dayStart;

  // 2. Loop through the day until a slot would end after the working hours
  while (true) {
    const currentSlotEnd = addMinutes(currentSlotStart, serviceDuration);

    // Stop if this slot pushes past her end-of-day time
    if (isAfter(currentSlotEnd, dayEnd)) {
      break;
    }

    // 3. Skip slots that are in the past (if the client is booking for "today")
    if (isBefore(currentSlotStart, now)) {
      // Move pointer forward and continue
      currentSlotStart = addMinutes(currentSlotEnd, bufferMinutes);
      continue;
    }

    // 4. Check for overlaps against existing appointments
    let isOverlapping = false;

    for (const appt of existingAppointments) {
      const apptStart = parse(`${dateStr} ${appt.startTime}`, 'yyyy-MM-dd HH:mm', new Date());
      const apptEnd = parse(`${dateStr} ${appt.endTime}`, 'yyyy-MM-dd HH:mm', new Date());

      // Overlap logic: (Slot Start < Appt End) AND (Slot End > Appt Start)
      if (isBefore(currentSlotStart, apptEnd) && isAfter(currentSlotEnd, apptStart)) {
        isOverlapping = true;
        break; 
      }
    }

    // 5. If no overlap, format as HH:mm string and add to available slots
    if (!isOverlapping) {
      availableSlots.push(format(currentSlotStart, 'HH:mm'));
    }

    // 6. Advance the pointer for the next loop iteration (Duration + Buffer)
    currentSlotStart = addMinutes(currentSlotEnd, bufferMinutes);
  }

  return availableSlots;
};