import prisma from '../utils/prisma.js';
// --- TOPIC CONTROLLERS ---

export const getTopics = async (req, res, next) => {
  try {
    const topics = await prisma.topic.findMany({
      include: {
        _count: {
          select: { articles: { where: { published: true } } }
        }
      },
      orderBy: { name: 'asc' }
    });
    res.json(topics);
  } catch (error) {
    next(error);
  }
};

export const createTopic = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Topic name is required.' });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const newTopic = await prisma.topic.create({
      data: { name, slug, description }
    });

    res.status(201).json(newTopic);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'A topic with this name already exists.' });
    }
    next(error);
  }
};
export const updateTopic = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Topic name is required.' });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const updatedTopic = await prisma.topic.update({
      where: { id: parseInt(id) },
      data: { name, slug, description }
    });

    res.json(updatedTopic);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'A topic with this name already exists.' });
    }
    next(error);
  }
};

export const deleteTopic = async (req, res, next) => {
  try {
    const { id } = req.params;
    const topicId = parseInt(id);

    // 1. Check if any articles are linked to this topic
    const articleCount = await prisma.article.count({
      where: { topicId }
    });

    if (articleCount > 0) {
      return res.status(400).json({ 
        error: `Cannot delete this topic because it has ${articleCount} article(s) assigned to it. Please reassign or delete the articles first.` 
      });
    }

    // 2. Safe to delete since no articles are attached
    const deletedTopic = await prisma.topic.delete({
      where: { id: topicId }
    });

    res.json({ success: true, deleted: deletedTopic });
  } catch (error) {
    next(error);
  }
};

// --- ARTICLE CONTROLLERS ---

export const getArticles = async (req, res, next) => {
  try {
    const { topicSlug, publishedOnly } = req.query;
    
    const whereClause = {};
    if (publishedOnly === 'true') {
      whereClause.published = true;
    }
    if (topicSlug) {
      whereClause.topic = { slug: topicSlug };
    }

    const articles = await prisma.article.findMany({
      where: whereClause,
      include: { topic: true },
      orderBy: { createdAt: 'desc' }
    });

    res.json(articles);
  } catch (error) {
    next(error);
  }
};

export const getArticleBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const article = await prisma.article.findUnique({
      where: { slug },
      include: { topic: true }
    });

    if (!article) {
      return res.status(404).json({ error: 'Article not found.' });
    }

    res.json(article);
  } catch (error) {
    next(error);
  }
};

export const createArticle = async (req, res, next) => {
  try {
    const { title, content, topicId, imageUrl, published } = req.body;

    if (!title || !content || !topicId) {
      return res.status(400).json({ error: 'Title, content, and topic are required.' });
    }

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now();

    const article = await prisma.article.create({
      data: {
        title,
        slug,
        content,
        topicId: parseInt(topicId),
        imageUrl,
        published: Boolean(published)
      },
      include: { topic: true }
    });

    res.status(201).json(article);
  } catch (error) {
    next(error);
  }
};

export const updateArticle = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const { title, content, topicId, imageUrl, published } = req.body;

    if (!title || !content || !topicId) {
      return res.status(400).json({ error: 'Title, content, and topic are required.' });
    }

    const updated = await prisma.article.update({
      where: { slug },
      data: {
        title,
        content,
        topicId: parseInt(topicId),
        imageUrl,
        published: Boolean(published)
      },
      include: { topic: true }
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
};
export const togglePublishArticle= async (req,res,next)=>{
  try{
    const { slug } = req.params;
    // Find the article first to check its current status
    const article = await prisma.article.findUnique({
      where: { slug: slug }
    });
    if (!article) {
      return res.status(404).json({ error: 'Article not found.' });
    }

    const result = await prisma.article.update({
      where: { slug },
      data: {
        published: !article.published
      }
    });

    res.json({ success: true, article: result });

  }catch(error){
    next(error);
  }
}
export const deleteArticle = async (req,res,next)=>{
  try{
    const{id}= req.params;
    const deleted = await prisma.article.delete({
      where:{id:parseInt(id)}
    }    
    )
    console.log('article deleted successfully!!!');
    res.json({ success: true, deleted });
  }catch(error){
    next(error);
  }
}