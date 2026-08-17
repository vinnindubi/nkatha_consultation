import express from 'express';
import { 
  getTopics, 
  createTopic, 
  getArticles, 
  getArticleBySlug, 
  createArticle, 
  updateArticleStatus 
} from '../controllers/article.controller.js';
import { verifyAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

// --- PUBLIC ROUTES ---
router.get('/topics', getTopics);
router.get('/', getArticles);
router.get('/:slug', getArticleBySlug);

// --- ADMIN PROTECTED ROUTES ---
router.post('/topics', verifyAdmin, createTopic);
router.post('/', verifyAdmin, createArticle);
router.patch('/:id/status', verifyAdmin, updateArticleStatus);

export default router;