import prisma from './prisma.js';

/**
 * Records an administrative or user action to the audit trail
 * @param {Object} params
 * @param {number} params.userId - ID of the user performing the action
 * @param {string} params.action - Short code representing the action
 * @param {string} params.target - Description or ID of the affected resource
 * @param {string} params.ipAddress - Optional client IP address
 */
export const logActivity = async ({ userId, action, target, ipAddress }) => {
  try {
    await prisma.auditLog.create({
      data: {
        userId: userId ? Number(userId) : null,
        action,
        target,
        ipAddress: ipAddress || null,
      },
    });
  } catch (error) {
    // Fail silently or log to console so an audit failure doesn't crash the main request flow
    console.error('Failed to write audit log:', error);
  }
};