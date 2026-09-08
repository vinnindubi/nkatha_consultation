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

// --- ADMIN / SPECIFIC ACTION ROUTES (Place above generic parameter routes) ---
router.patch('/toggle/:slug', verifyAuth, togglePublishArticle);
router.post('/topics', verifyAuth, createTopic);
router.patch('/topics/:id', verifyAuth, updateTopic);
router.delete('/topics/:id', verifyAuth, deleteTopic);
router.post('/', verifyAuth, createArticle);
router.patch('/:slug', verifyAuth, updateArticle);
router.delete('/delete/:id', verifyAuth, deleteArticle);

// --- PUBLIC / GENERAL GET ROUTES ---
router.get('/topics', getTopics);
router.get('/', getArticles);
router.get('/:slug', getArticleBySlug);

export default router;