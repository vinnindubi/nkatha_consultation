import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { apiFetch } from '../../utils/api';

export default function BlogManager() {
  const { slug } = useParams(); // Check if we are in edit mode
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('articles'); // 'articles' or 'topics'

  // Form states for Article
  const [title, setTitle] = useState('');
  const [topicId, setTopicId] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [content, setContent] = useState('');
  const [published, setPublished] = useState(false);

  // Form states for Topic
  const [topicName, setTopicName] = useState('');
  const [topicDesc, setTopicDesc] = useState('');

  // Quill Editor Toolbar Modules
  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ color: [] }, { background: [] }],
      [{ align: [] }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link', 'image'],
      ['clean']
    ],
  };

  // 1. Fetch existing article if an ID is present in the route (Edit Mode)
  const { data: existingArticle } = useQuery({
    queryKey: ['article-edit', slug],
    queryFn: async () => {
      const res = await apiFetch(`/api/articles/${slug}`); // Adjust endpoint if your backend uses a different route for fetching by ID
      if (!res.ok) throw new Error('Failed to fetch article for editing');
      return res.json();
    },
    enabled: !!slug, // Only run query if ID exists
  });

  // Populate form fields once article data is fetched
  useEffect(() => {
    if (existingArticle) {
      setTitle(existingArticle.title || '');
      setTopicId(existingArticle.topicId || existingArticle.topic?.id || '');
      setImageUrl(existingArticle.imageUrl || '');
      setContent(existingArticle.content || '');
      setPublished(existingArticle.published ?? false);
    }
  }, [existingArticle]);

  // Fetch topics for the article dropdown
  const { data: topics = [] } = useQuery({
    queryKey: ['blog-topics'],
    queryFn: async () => {
      const res = await apiFetch('/api/articles/topics');
      if (!res.ok) throw new Error('Failed to fetch topics');
      return res.json();
    }
  });

  // Mutations
  const createTopicMutation = useMutation({
    mutationFn: async (newTopic) => {
      const res = await apiFetch('/api/articles/topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTopic)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create topic');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-topics'] });
      setTopicName('');
      setTopicDesc('');
      alert('Topic created successfully!');
    },
    onError: (err) => {
      alert(err.message);
    }
  });

  // Unified Save / Update Article Mutation
  const saveArticleMutation = useMutation({
    mutationFn: async (articleData) => {
      const url = slug ? `/api/articles/${slug}` : '/api/articles';
      const method = slug ? 'PATCH' : 'POST';

      const res = await apiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(articleData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save article');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-articles'] });
      alert(slug ? 'Article updated successfully!' : 'Article published successfully!');
      navigate('/admin'); // Redirect back to dashboard admin panel
    },
    onError: (err) => {
      alert(err.message);
    }
  });

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 animate-fade-in-up">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Link to="/admin" className="text-sm font-bold text-accent hover:underline">
              &larr; Back to Dashboard
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-primary mb-1">
            {slug ? 'Edit Article' : 'Blog & Content Manager'}
          </h1>
          <p className="text-gray-500 text-sm">
            {slug ? `Editing article ID: ${slug}` : 'Create topics and publish new articles for your readers.'}
          </p>
        </div>
        
        {!slug && (
          <div className="flex bg-white rounded-xl shadow-sm border border-gray-200 p-1">
            <button 
              onClick={() => setActiveTab('articles')}
              className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${activeTab === 'articles' ? 'bg-primary text-white shadow-sm' : 'text-gray-500 hover:text-primary'}`}
            >
              New Article
            </button>
            <button 
              onClick={() => setActiveTab('topics')}
              className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${activeTab === 'topics' ? 'bg-primary text-white shadow-sm' : 'text-gray-500 hover:text-primary'}`}
            >
              Manage Topics
            </button>
          </div>
        )}
      </div>

      {(activeTab === 'articles' || slug) ? (
        <form 
          onSubmit={(e) => { 
            e.preventDefault(); 
            saveArticleMutation.mutate({ title, topicId, imageUrl, content, published }); 
          }} 
          className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-gray-100 space-y-6"
        >
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Article Title</label>
            <input 
              type="text" 
              required 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary outline-none transition-all" 
              placeholder="Understanding Daily Anxiety..." 
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Select Topic</label>
              <select 
                required 
                value={topicId} 
                onChange={e => setTopicId(e.target.value)} 
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:border-primary outline-none transition-all"
              >
                <option value="">Select a topic...</option>
                {topics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Featured Image URL (Optional)</label>
              <input 
                type="url" 
                value={imageUrl} 
                onChange={e => setImageUrl(e.target.value)} 
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary outline-none transition-all" 
                placeholder="https://images.unsplash.com/..." 
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Content</label>
            <div className="bg-white rounded-2xl overflow-hidden border border-gray-200 focus-within:border-primary transition-all">
              <ReactQuill 
                theme="snow" 
                value={content} 
                onChange={setContent} 
                modules={quillModules}
                className="min-h-[250px]"
              />
            </div>
            <div className="h-12"></div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <input 
              type="checkbox" 
              id="pub" 
              checked={published} 
              onChange={e => setPublished(e.target.checked)} 
              className="w-5 h-5 text-primary rounded accent-primary cursor-pointer" 
            />
            <label htmlFor="pub" className="font-bold text-gray-700 text-sm cursor-pointer">
              Publish immediately (make visible on public blog)
            </label>
          </div>

          <button 
            type="submit" 
            disabled={saveArticleMutation.isPending}
            className="w-full bg-primary hover:bg-[#3d4d40] text-white font-bold py-4 rounded-xl shadow-md transition-all disabled:opacity-70"
          >
            {saveArticleMutation.isPending ? 'Saving...' : slug ? 'Update Article' : 'Save Article'}
          </button>
        </form>
      ) : (
        <form 
          onSubmit={(e) => { 
            e.preventDefault(); 
            createTopicMutation.mutate({ name: topicName, description: topicDesc }); 
          }} 
          className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-gray-100 space-y-6"
        >
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Topic Name</label>
            <input 
              type="text" 
              required 
              value={topicName} 
              onChange={e => setTopicName(e.target.value)} 
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary outline-none transition-all" 
              placeholder="Mindfulness & Grounding" 
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Description (Optional)</label>
            <textarea 
              rows={3} 
              value={topicDesc} 
              onChange={e => setTopicDesc(e.target.value)} 
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary outline-none transition-all" 
              placeholder="Short description of this category..."
            ></textarea>
          </div>

          <button 
            type="submit" 
            disabled={createTopicMutation.isPending}
            className="w-full bg-primary hover:bg-[#3d4d40] text-white font-bold py-4 rounded-xl shadow-md transition-all disabled:opacity-70"
          >
            {createTopicMutation.isPending ? 'Creating...' : 'Create Topic'}
          </button>
        </form>
      )}

    </div>
  );
}