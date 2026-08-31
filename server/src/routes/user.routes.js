import express from 'express';
import { getProfile, updateProfile } from '../controllers/user.controller.js';
import { verifyAuth } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(verifyAuth);

router.get('/profile', verifyAuth, getProfile);
router.patch('/profile',verifyAuth, updateProfile);

export default router;