import express from 'express';
import { 
  getTopics, 
  createTopic, 
  getArticles, 
  getArticleBySlug, 
  createArticle, 
  updateArticle, 
  deleteArticle,
  togglePublishArticle
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

router.patch('/:slug', verifyAdmin, updateArticle);
router.patch('toggle/:slug', verifyAdmin, togglePublishArticle);
router.delete('/delete/:id',verifyAdmin,deleteArticle);

export default router;