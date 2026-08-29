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
  const [editingTopicId, setEditingTopicId] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null); // For viewing full topic details
  const [isTopicDetailsOpen, setIsTopicDetailsOpen] = useState(false);

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
  // Update Topic Mutation
  const updateTopicMutation = useMutation({
    mutationFn: async ({ id, name, description }) => {
      const res = await apiFetch(`/api/articles/topics/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update topic');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-topics'] });
      setEditingTopicId(null);
      setTopicName('');
      setTopicDesc('');
      alert('Topic updated successfully!');
    },
    onError: (err) => alert(err.message)
  });

  // Delete Topic Mutation
  const deleteTopicMutation = useMutation({
    mutationFn: async (id) => {
      const res = await apiFetch(`/api/articles/topics/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete topic');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-topics'] });
      alert('Topic deleted successfully.');
    },
    onError: (err) => alert(err.message)
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
        <div className="space-y-8">
          {/* Create or Edit Form Card */}
          <form 
            onSubmit={(e) => { 
              e.preventDefault(); 
              if (editingTopicId) {
                updateTopicMutation.mutate({ id: editingTopicId, name: topicName, description: topicDesc });
              } else {
                createTopicMutation.mutate({ name: topicName, description: topicDesc }); 
              }
            }} 
            className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-gray-100 space-y-6"
          >
            <div className="flex justify-between items-center border-b pb-4">
              <h3 className="font-bold text-lg text-gray-900">
                {editingTopicId ? 'Edit Topic' : 'Create New Topic'}
              </h3>
              {editingTopicId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingTopicId(null);
                    setTopicName('');
                    setTopicDesc('');
                  }}
                  className="text-xs font-bold text-gray-500 hover:text-gray-800"
                >
                  Cancel Edit
                </button>
              )}
            </div>

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
              disabled={createTopicMutation.isPending || updateTopicMutation.isPending}
              className="w-full bg-primary hover:bg-[#3d4d40] text-white font-bold py-4 rounded-xl shadow-md transition-all disabled:opacity-70"
            >
              {createTopicMutation.isPending || updateTopicMutation.isPending 
                ? 'Processing...' 
                : editingTopicId ? 'Update Topic' : 'Create Topic'}
            </button>
          </form>

          {/* Existing Topics List Card */}
          <div className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-lg text-gray-900 mb-6">Existing Topics ({topics.length})</h3>
            
            {topics.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-6">No topics created yet.</p>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {topics.map((topic) => (
                  <div key={topic.id} className="border border-gray-100 bg-gray-50/50 p-5 rounded-2xl flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bold text-gray-900">{topic.name}</h4>
                        <span className="text-[10px] font-bold bg-primary/10 text-primary px-2.5 py-1 rounded-full uppercase tracking-wider">
                          {topic._count?.articles || 0} articles
                        </span>
                      </div>
                      <p className="text-gray-500 text-xs mb-4 line-clamp-2">
                        {topic.description || 'No description provided.'}
                      </p>
                    </div>

                    <div className="flex justify-end gap-2 pt-3 border-t border-gray-200/60">
                      <button
                        onClick={() => {
                          setSelectedTopic(topic);
                          setIsTopicDetailsOpen(true);
                        }}
                        className="bg-white hover:bg-gray-100 text-gray-700 font-bold px-3 py-1.5 rounded-lg text-xs border border-gray-200 transition-colors"
                      >
                        View
                      </button>
                      <button
                        onClick={() => {
                          setEditingTopicId(topic.id);
                          setTopicName(topic.name);
                          setTopicDesc(topic.description || '');
                        }}
                        className="bg-white hover:bg-gray-100 text-gray-700 font-bold px-3 py-1.5 rounded-lg text-xs border border-gray-200 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete topic "${topic.name}"?`)) {
                            deleteTopicMutation.mutate(topic.id);
                          }
                        }}
                        className="bg-red-50 hover:bg-red-100 text-red-600 font-bold px-3 py-1.5 rounded-lg text-xs border border-red-200 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      {/* Topic Details Modal */}
      {isTopicDetailsOpen && selectedTopic && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl border border-gray-100 space-y-4">
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold uppercase tracking-wider text-accent bg-accent/10 px-3 py-1 rounded-full">
                Topic Metadata
              </span>
              <button 
                onClick={() => setIsTopicDetailsOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <h3 className="text-2xl font-black text-primary">{selectedTopic.name}</h3>

            <div className="space-y-3 text-sm bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <div>
                <span className="block text-xs font-bold uppercase text-gray-400">Slug URL Param</span>
                <span className="text-gray-700 mt-0.5">
                  {selectedTopic.slug}
                </span>
              </div>

              <div>
                <span className="block text-xs font-bold uppercase text-gray-400">Description</span>
                <p className="text-gray-700 mt-0.5">{selectedTopic.description || 'No description provided.'}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-200/60">
                <div>
                  <span className="block text-[10px] font-bold uppercase text-gray-400">Created At</span>
                  <span className="text-xs text-gray-600">
                    {new Date(selectedTopic.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold uppercase text-gray-400">Last Updated</span>
                  <span className="text-xs text-gray-600">
                    {new Date(selectedTopic.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsTopicDetailsOpen(false)}
              className="w-full bg-primary text-white font-bold py-3 rounded-xl text-sm transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}