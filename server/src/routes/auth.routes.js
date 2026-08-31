import express from 'express';
import { adminLogin, adminLogout, checkAuth } from '../controllers/auth.controller.js';
import { verifyAuth,verifyRole } from '../middleware/auth.middleware.js';
import { createTherapist } from '../controllers/therapist.controller.js';
import { getAllAppointments } from '../controllers/booking.controller.js';


const router = express.Router();

router.post('/login', adminLogin);
router.post('/logout', adminLogout);
router.get('/verify', verifyAuth, checkAuth);

//new way. RBAC introduced .....
// Only Super Admins can access this
router.post('/therapists', verifyAuth, verifyRole(['SUPER_ADMIN']), createTherapist);

// Both Super Admins and Therapists can access this
router.get('/appointments', verifyAuth, verifyRole(['SUPER_ADMIN', 'THERAPIST']),getAllAppointments);

export default router;