import express from 'express';
import { adminLogin, adminLogout, checkAuth } from '../controllers/auth.controller.js';
import { verifyAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/login', adminLogin);
router.post('/logout', adminLogout);
router.get('/verify', verifyAdmin, checkAuth);

export default router;