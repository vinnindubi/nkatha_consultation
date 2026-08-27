import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import DOMPurify from 'dompurify';
import {apiFetch} from '../../utils/api';
export default function ArticleReader() {
  const { slug } = useParams();

  const { data: article, isLoading, isError } = useQuery({
    queryKey: ['article', slug],
    queryFn: async () => {
      const res = await apiFetch(`/api/articles/${slug}`);
      if (!res.ok) throw new Error('Article not found');
      return res.json();
    }
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isError || !article) {
    return (
      <div className="max-w-xl mx-auto mt-20 text-center bg-white p-12 rounded-3xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Article Not Found</h1>
        <p className="text-gray-500 mb-6">The article you are looking for may have been removed or does not exist.</p>
        <Link to="/blog" className="inline-block bg-primary text-white font-bold px-6 py-3 rounded-xl">
          Back to Blog
        </Link>
      </div>
    );
  }

  return (
    <article className="max-w-4xl mx-auto py-12 px-4 animate-fade-in-up">
      
      <div className="mb-8">
        <Link to="/blog" className="text-sm font-bold text-accent hover:underline mb-6 inline-block">
          &larr; Back to all insights
        </Link>
        <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
          <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">{article.topic?.name}</span>
          <span>•</span>
          <span>{format(new Date(article.createdAt), 'MMMM d, yyyy')}</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-primary leading-tight tracking-tight mb-6">
          {article.title}
        </h1>
      </div>

      {article.imageUrl && (
        <div className="mb-12 rounded-[2.5rem] overflow-hidden shadow-md max-h-[500px]">
          <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover" />
        </div>
      )}

      {/* Render sanitized HTML safely using dangerouslySetInnerHTML */}
      <div 
        className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-sm border border-gray-100 text-gray-700 leading-relaxed space-y-6 text-lg prose max-w-none"
        dangerouslySetInnerHTML={{ 
          __html: DOMPurify.sanitize(article.content) 
        }}
      />

    </article>
  );
}