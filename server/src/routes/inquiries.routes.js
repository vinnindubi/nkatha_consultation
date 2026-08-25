import express from 'express';
import prisma from '../utils/prisma.js';
import { Resend } from 'resend';

const router = express.Router();

const resend = new Resend(process.env.RESEND_API_KEY);

// POST: Handle new contact form submission
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required.' });
    }

    // 1. Save the inquiry to the database
    const newInquiry = await prisma.clientInquiry.create({
      data: {
        name,
        email,
        subject: subject || 'General Inquiry',
        message,
        status: 'UNREAD',
      },
    });

    // 2. Send an instant email notification to the Admin via Resend
    const adminEmail = process.env.DOMAIN_EMAIL_USER; // Admin email address from environment variables    
    if (adminEmail) {
      await resend.emails.send({
        from: 'Nkatha Wellness <onboarding@resend.dev>', // Or your custom verified domain
        to: [adminEmail],
        replyTo: email, // Allows the admin to hit "Reply" directly to the client
        subject: `New Inquiry: ${subject || 'Website Message'} from ${name}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 12px;">
            <h2 style="color: #2c3e35;">New Client Inquiry Received</h2>
            <p>You have received a new message from your website contact form.</p>
            
            <div style="background-color: #f8f9fa; padding: 16px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 6px 0;"><strong>Name:</strong> ${name}</p>
              <p style="margin: 6px 0;"><strong>Email:</strong> ${email}</p>
              <p style="margin: 6px 0;"><strong>Subject:</strong> ${subject || 'General Inquiry'}</p>
              <p style="margin: 12px 0 0 0;"><strong>Message:</strong></p>
              <p style="background: #ffffff; padding: 10px; border-radius: 4px; border: 1px solid #ddd; margin-top: 4px; white-space: pre-wrap;">${message}</p>
            </div>

            <p style="color: #666; font-size: 12px; margin-top: 30px;">You can reply directly to this email to respond to ${name}.</p>
          </div>
        `,
      });
    }

    res.status(201).json({ success: true, message: 'Inquiry submitted successfully!', inquiry: newInquiry });
  } catch (error) {
    console.error('Error handling client inquiry:', error);
    res.status(500).json({ error: 'Internal server error while submitting inquiry.' });
  }
});

// GET: Fetch all inquiries for the Admin Dashboard
router.get('/', async (req, res) => {
  try {
    const inquiries = await prisma.clientInquiry.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(inquiries);
  } catch (error) {
    console.error('Error fetching inquiries:', error);
    res.status(500).json({ error: 'Failed to fetch inquiries' });
  }
});

export default router;