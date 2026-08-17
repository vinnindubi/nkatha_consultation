import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import {apiFetch} from '../../utils/api';
export default function BlogHub() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedTopicSlug = searchParams.get('topic') || '';

  // 1. Fetch topics
  const { data: topics = [] } = useQuery({
    queryKey: ['blog-topics'],
    queryFn: async () => {
      const res = await apiFetch('/api/articles/topics');
      if (!res.ok) throw new Error('Failed to fetch topics');
      return res.json();
    }
  });

  // 2. Fetch articles (optionally filtered by topic slug)
  const { data: articles = [], isLoading } = useQuery({
    queryKey: ['blog-articles', selectedTopicSlug],
    queryFn: async () => {
      const url = selectedTopicSlug 
        ? `/api/articles?topicSlug=${selectedTopicSlug}&publishedOnly=true`
        : '/api/articles?publishedOnly=true';
      const res = await apiFetch(url);
      if (!res.ok) throw new Error('Failed to fetch articles');
      return res.json();
    }
  });

  const handleTopicClick = (slug) => {
    if (slug === selectedTopicSlug) {
      searchParams.delete('topic');
    } else {
      searchParams.set('topic', slug);
    }
    setSearchParams(searchParams);
  };

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 animate-fade-in-up">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-16">
        <span className="text-accent font-bold tracking-widest uppercase text-xs mb-3 block">
          Insights & Resources
        </span>
        <h1 className="text-4xl md:text-5xl font-black text-primary mb-4 tracking-tight">
          Words for your wellness journey.
        </h1>
        <p className="text-gray-600 text-lg">
          Explore thoughts on mental health, relationships, and personal growth written by Nkatha.
        </p>
      </div>

      {/* Topics Filter Bar */}
      <div className="flex flex-wrap items-center justify-center gap-3 mb-16">
        <button
          onClick={() => handleTopicClick('')}
          className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${
            !selectedTopicSlug 
              ? 'bg-primary text-white shadow-md' 
              : 'bg-white text-gray-600 border border-gray-200 hover:border-primary'
          }`}
        >
          All Topics
        </button>
        {topics.map((topic) => (
          <button
            key={topic.id}
            onClick={() => handleTopicClick(topic.slug)}
            className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${
              selectedTopicSlug === topic.slug 
                ? 'bg-primary text-white shadow-md' 
                : 'bg-white text-gray-600 border border-gray-200 hover:border-primary'
            }`}
          >
            {topic.name}
            <span className={`text-xs px-2 py-0.5 rounded-full ${selectedTopicSlug === topic.slug ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
              {topic._count?.articles || 0}
            </span>
          </button>
        ))}
      </div>

      {/* Articles Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : articles.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl text-center border border-gray-100 shadow-sm">
          <h3 className="text-xl font-bold text-gray-700 mb-2">No articles found</h3>
          <p className="text-gray-500">Check back soon for new content under this topic.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article) => (
            <Link 
              key={article.id} 
              to={`/blog/${article.slug}`}
              className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-all flex flex-col group"
            >
              {article.imageUrl && (
                <div className="h-48 overflow-hidden bg-gray-100">
                  <img 
                    src={article.imageUrl} 
                    alt={article.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              )}
              <div className="p-8 flex flex-col flex-grow">
                <div className="flex items-center justify-between text-xs font-bold text-accent uppercase tracking-wider mb-3">
                  <span>{article.topic?.name}</span>
                  <span className="text-gray-400 font-normal">{format(new Date(article.createdAt), 'MMM d, yyyy')}</span>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors line-clamp-2">
                  {article.title}
                </h2>
                <p className="text-gray-600 text-sm leading-relaxed mb-6 line-clamp-3 flex-grow">
                  {article.content.replace(/<[^>]*>?/gm, '')}
                </p>
                <span className="text-sm font-bold text-primary flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Read article &rarr;
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

    </div>
  );
}