import nodemailer from 'nodemailer';
import { createEvent } from 'ics';
// 1. Create the Transporter (Our connection to the email server)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 465, // 587 for TLS, 465 for SSL
  secure:true, // true for 465, false for other ports
  family: 4,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Sends an appointment confirmation email to the client
 * @param {Object} appointment - The appointment and service details
 */
/**
 * Helper to generate an .ics calendar file buffer from an appointment object
 */
const generateICSFile = (appointment) => {
  return new Promise((resolve, reject) => {
    const serviceTitle = appointment.service?.name || 'Consultation Session';
    const dateStr = appointment.appointmentDate.toISOString().split('T')[0]; // "YYYY-MM-DD"
    const [year, month, day] = dateStr.split('-').map(Number); // <-- Converted to numbers    const [hours, minutes] = appointment.startTime.split(':').map(Number);
    const [hours, minutes] = appointment.startTime.split(':').map(Number);
    const durationMins = appointment.service?.durationMinutes || 60;

    const event = {
      start: [year, month, day, hours, minutes],
      duration: { minutes: durationMins },
      title: `Consultation: ${serviceTitle}`,
      description: `Your session with Nkatha Wellness has been confirmed.\nFormat: ${appointment.sessionFormat || 'Online'}\nNotes: ${appointment.notes || 'None'}`,
      location: appointment.sessionFormat === 'in-person' ? 'In-Person Studio Session' : 'Virtual Video Session',
      status: 'CONFIRMED',
      organizer: { name: 'Nkatha Wellness', email: process.env.EMAIL_USER },
      attendees: [
        { name: appointment.clientName, email: appointment.clientEmail, rsvp: true, partstat: 'ACCEPTED', role: 'REQ-PARTICIPANT' }
      ]
    };

    createEvent(event, (error, value) => {
      if (error) {
        return reject(error);
      }
      resolve(value); // Returns the .ics file string content
    });
  });
};

export const sendApprovalEmail = async (appointment) => {
  try {
    const clientEmail = appointment.clientEmail;
    const clientName = appointment.clientName;
    const serviceTitle = appointment.service?.name || 'Consultation Session';
    const date = appointment.appointmentDate.toISOString().split('T')[0];
    const startTime = appointment.startTime;
    const sessionFormat = appointment.sessionFormat || 'Online';

    // Generate the .ics calendar invite string
    const icsContent = await generateICSFile(appointment);

    const mailOptions = {
      from: `"Nkatha Wellness" <${process.env.EMAIL_USER}>`,
      to: clientEmail,
      subject: `Appointment Confirmed: ${serviceTitle}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 12px;">
          <h2 style="color: #2c3e35;">Session Confirmed!</h2>
          <p>Hello <strong>${clientName}</strong>,</p>
          <p>Great news! Nkatha has reviewed and approved your booking request.</p>
          
          <div style="background-color: #f8f9fa; padding: 16px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 6px 0;"><strong>Service:</strong> ${serviceTitle}</p>
            <p style="margin: 6px 0;"><strong>Date:</strong> ${date}</p>
            <p style="margin: 6px 0;"><strong>Time:</strong> ${startTime}</p>
            <p style="margin: 6px 0;"><strong>Format:</strong> ${sessionFormat === 'online' ? 'Virtual Video Session' : 'In-Person Session'}</p>
          </div>

          <p>We have attached a calendar invitation to this email so you can easily add this session to your calendar.</p>
          <p>We look forward to speaking with you.</p>
          <p style="color: #666; font-size: 12px; margin-top: 30px;">Nkatha Wellness Platform</p>
        </div>
      `,
      attachments: [
        {
          filename: 'appointment.ics',
          content: icsContent,
          contentType: 'text/calendar; charset=utf-8; method=REQUEST'
        }
      ]
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Approval email with calendar invite sent: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending approval email:', error);
    throw error;
  }
};

export const sendCancellationEmail = async (appointment) => {
  try {
    const clientEmail = appointment.clientEmail;
    const clientName = appointment.clientName;
    const serviceTitle = appointment.service?.name || 'Consultation Session';
    const date = appointment.appointmentDate.toISOString().split('T')[0];
    const startTime = appointment.startTime;

    const mailOptions = {
      from: `"Nkatha Wellness" <${process.env.EMAIL_USER}>`,
      to: clientEmail,
      subject: `Appointment Update: Cancellation for ${serviceTitle}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 12px;">
          <h2 style="color: #c0392b;">Appointment Cancelled</h2>
          <p>Hello <strong>${clientName}</strong>,</p>
          <p>We sincerely apologize, but Nkatha has had to cancel your upcoming appointment.</p>
          
          <div style="background-color: #fcf5f5; padding: 16px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #c0392b;">
            <p style="margin: 6px 0;"><strong>Service:</strong> ${serviceTitle}</p>
            <p style="margin: 6px 0;"><strong>Originally Scheduled:</strong> ${date} at ${startTime}</p>
          </div>

          <p>If you would like to reschedule for another time, please feel free to visit our booking page again. We apologize for any inconvenience caused.</p>
          <p style="color: #666; font-size: 12px; margin-top: 30px;">Nkatha Wellness Platform</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Cancellation email sent: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending cancellation email:', error);
    throw error;
  }
};