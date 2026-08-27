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

export const updateArticleStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { published } = req.body;

    const updated = await prisma.article.update({
      where: { id: parseInt(id) },
      data: { published: Boolean(published) }
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
};
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