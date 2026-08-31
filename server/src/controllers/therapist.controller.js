import prisma from '../utils/prisma.js';
import bcrypt from 'bcryptjs';
import { logActivity } from '../utils/logger.js';

// Get all therapists (Super Admin only)
export const getAllTherapists = async (req, res) => {
  try {
    const therapists = await prisma.user.findMany({
      where: { role: 'THERAPIST' },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        createdAt: true,
        _count: {
          select: { appointments: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.json({ success: true, therapists });
  } catch (error) {
    console.error('Error fetching therapists:', error);
    return res.status(500).json({ error: 'Failed to fetch therapists.' });
  }
};

// Onboard a new therapist (Super Admin only)
export const createTherapist = async (req, res) => {
  try {
    const { name, email, password, avatarUrl } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'A user with this email already exists.' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with THERAPIST role
    const newTherapist = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'THERAPIST',
        avatarUrl: avatarUrl || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      }
    });

    // Log the action to the audit trail
    await logActivity({
      userId: req.user.id,
      action: 'THERAPIST_CREATED',
      target: `Therapist: ${newTherapist.name} (${newTherapist.email})`,
      ipAddress: req.ip,
    });

    return res.status(201).json({
      success: true,
      message: 'Therapist onboarded successfully.',
      therapist: newTherapist,
    });
  } catch (error) {
    console.error('Error creating therapist:', error);
    return res.status(500).json({ error: 'Failed to create therapist account.' });
  }
};

// Remove or demote a therapist
export const deleteTherapist = async (req, res) => {
  try {
    const { id } = req.params;

    const therapist = await prisma.user.findUnique({
      where: { id: parseInt(id) }
    });

    if (!therapist || therapist.role !== 'THERAPIST') {
      return res.status(404).json({ error: 'Therapist not found.' });
    }

    await prisma.user.delete({
      where: { id: parseInt(id) }
    });

    await logActivity({
      userId: req.user.id,
      action: 'THERAPIST_DELETED',
      target: `Therapist ID: ${id} (${therapist.email})`,
      ipAddress: req.ip,
    });

    return res.json({ success: true, message: 'Therapist removed successfully.' });
  } catch (error) {
    console.error('Error deleting therapist:', error);
    return res.status(500).json({ error: 'Failed to delete therapist.' });
  }
};