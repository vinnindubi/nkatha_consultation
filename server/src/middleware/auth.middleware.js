import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma.js';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-fallback-key';

/**
 * 1. Verifies the JWT token and attaches the user to req.user
 */
export const verifyAuth = async (req, res, next) => {
  // Check for token in cookies (supporting your old admin_token or a unified token)
  const token = req.cookies?.token || req.cookies?.admin_token;

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // Query the database to ensure the user still exists and get their latest role
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId || decoded.id },
    });

    if (!user) {
      return res.status(401).json({ error: 'User session no longer valid.' });
    }

    req.user = user; // Attach user payload (id, email, role) to request
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token.' });
  }
};

/**
 * 2. Restricts route access based on specific allowed roles
 * @param {string[]} allowedRoles - e.g., ['SUPER_ADMIN', 'THERAPIST']
 */
export const verifyRole = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Access denied. You do not have the required permissions.' 
      });
    }

    next();
  };
};