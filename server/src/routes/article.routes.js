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
import { verifyAuth } from '../middleware/auth.middleware.js';

const router = express.Router();

// --- PUBLIC ROUTES ---
router.get('/topics', getTopics);
router.get('/', getArticles);
router.get('/:slug', getArticleBySlug);

// --- ADMIN PROTECTED ROUTES ---
router.post('/topics', verifyAuth, createTopic);
router.patch('/topics/:id',verifyAuth, updateTopic);
router.delete('/topics/:id', verifyAuth, deleteTopic);
router.post('/', verifyAuth, createArticle);

router.patch('/toggle/:slug', verifyAuth, togglePublishArticle);
router.patch('/:slug', verifyAuth, updateArticle);
router.delete('/delete/:id',verifyAuth,deleteArticle);

export default router;