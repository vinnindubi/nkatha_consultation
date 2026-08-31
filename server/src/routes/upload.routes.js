import express from 'express';
import { uploadMedia } from '../controllers/upload.controller.js';
import { upload } from '../middleware/upload.middleware.js';
import { verifyAuth } from '../middleware/auth.middleware.js';

const router = express.Router();

// POST /api/upload - Admin only media upload endpoint
router.post('/', verifyAuth, upload.single('media'), uploadMedia);

export default router;