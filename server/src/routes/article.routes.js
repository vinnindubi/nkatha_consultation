import express from 'express';
import { 
  getTopics, 
  createTopic,
  updateTopic,
  deleteTopic,
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
router.patch('/topics/:id', verifyAdmin, updateTopic);
router.delete('/topics/:id', verifyAdmin, deleteTopic);
router.post('/', verifyAdmin, createArticle);

router.patch('/toggle/:slug', verifyAdmin, togglePublishArticle);
router.patch('/:slug', verifyAdmin, updateArticle);
router.delete('/delete/:id',verifyAdmin,deleteArticle);

export default router;