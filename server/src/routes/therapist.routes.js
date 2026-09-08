import express from 'express';
import { 
  getAllTherapists, 
  createTherapist, 
  deleteTherapist 
} from '../controllers/therapist.controller.js';
import { verifyAuth, verifyRole } from '../middleware/auth.middleware.js';

const router = express.Router();

// All therapist management routes require Super Admin credentials
router.use(verifyAuth, verifyRole(['SUPER_ADMIN']));

router.get('/', getAllTherapists);
router.post('/', createTherapist);
router.delete('/:id', deleteTherapist);

export default router;