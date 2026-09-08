import prisma from '../utils/prisma.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-fallback-key';

// user registration controller
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Please provide all required fields.' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Use a transaction to ensure both user creation and audit logging succeed together
    const newUser = await prisma.$transaction(async (tx) => {
      // 1. Create user
      const createdUser = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: 'CLIENT',
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          avatarUrl: true,
          createdAt: true,
        }
      });

      // 2. Create audit log using Prisma relation syntax (`user: { connect: ... }`)
      await tx.auditLog.create({
        data: {
          action: 'USER_REGISTERED',
          details: `New client account registered for ${email}`,
          ipAddress: req.ip || req.headers['x-forwarded-for'] || null,
          user: {
            connect: { id: createdUser.id }
          }
        }
      });

      return createdUser;
    });

    // Generate JWT token for immediate session login
    const token = jwt.sign(
      { id: newUser.id, role: newUser.role },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );

    // Set secure HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      user: newUser,
    });
  } catch (error) {
    next(error);
  }
};
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    // 1. Find the user in the unified User model
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // 2. Ensure the user is actually staff (SUPER_ADMIN or THERAPIST)
    if (user.role === 'CLIENT') {
      return res.status(403).json({ error: 'Access denied. Staff accounts only.' });
    }

    // 3. Verify password (using bcrypt)
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // 4. Generate JWT token containing their userId and role
    const token = jwt.sign(
      { userId: user.id, role: user.role, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // 5. Set the cookie (preserving your cookie setup, using 'token' or 'admin_token')
    // Send token securely inside an HTTP-only cookie
    const isProduction = process.env.NODE_ENV === 'production'
    res.cookie('admin_token', token, {
      httpOnly: true,
      secure: isProduction, // false locally (HTTP), true in production (HTTPS)
      sameSite: isProduction ? 'none' : 'lax', // 'lax' for localhost, 'none' for cross-site production
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    return res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: true
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error during login.' });
  }
};

export const adminLogout = (req, res) => {
  // Clear the auth cookie
  res.clearCookie('token');
  res.clearCookie('admin_token'); // Clear legacy cookie just in case
  return res.json({ success: true, message: 'Logged out successfully.' });
};

export const checkAuth = (req, res) => {
  // If req.user passed through verifyAuth middleware successfully, return their details
  return res.json({
    success: true,
    user: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      avatarUrl: req.user.avatarUrl
    },
  });
};