import express from 'express';
import { getAllServices, createService,updateService, deleteService } from '../controllers/service.controller.js';
import { verifyAdmin } from '../middleware/auth.middleware.js';
const router = express.Router();

// Public route to view services
router.get('/', getAllServices);

// Protected admin routes to manage services
router.post('/', verifyAdmin, createService);
router.patch('/:id', verifyAdmin, updateService); 
router.delete('/:id', verifyAdmin, deleteService);

export default router;