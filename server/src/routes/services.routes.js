import express from 'express';
import { getAllServices, createService,updateService, deleteService } from '../controllers/service.controller.js';
import {  verifyAuth } from '../middleware/auth.middleware.js';
const router = express.Router();

// Public route to view services
router.get('/', getAllServices);

// Protected admin routes to manage services
router.post('/', verifyAuth, createService);
router.patch('/:id', verifyAuth, updateService); 
router.delete('/:id', verifyAuth, deleteService);

export default router;