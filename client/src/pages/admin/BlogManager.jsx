import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { apiFetch } from '../../utils/api';
import { useDashboardStore } from '../../store/useDashboardStore';

export default function BlogManager({ articleToEdit, onBack }) {
  const { slug: routeSlug } = useParams();
  const effectiveSlug = articleToEdit ? articleToEdit.slug : routeSlug;
  const isEditing = Boolean(effectiveSlug || (articleToEdit && articleToEdit.id));

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Zustand Global Store States
  const { 
    blogActiveTab, setBlogActiveTab, 
    selectedTopic, isTopicDetailsOpen, openTopicDetails, closeTopicDetails,
    editingTopicId, setEditingTopicId 
  } = useDashboardStore();

  // 1. Compressed Single State Object for Article Form
  const [form, setForm] = useState({
    title: '',
    topicId: '',
    imageUrl: '',
    content: '',
    published: false,
  });

  // Compressed Single State Object for Topic Form
  const [topicForm, setTopicForm] = useState({
    name: '',
    description: '',
  });

  const [uploading, setUploading] = useState(false);

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

  // Populate article form fields when editing
  useEffect(() => {
    if (articleToEdit) {
      setForm({
        title: articleToEdit.title || '',
        topicId: articleToEdit.topicId || articleToEdit.topic?.id || '',
        imageUrl: articleToEdit.imageUrl || articleToEdit.coverImage || '',
        content: articleToEdit.content || '',
        published: articleToEdit.published ?? false,
      });
    }
  }, [articleToEdit]);

  const { data: fetchedArticle } = useQuery({
    queryKey: ['article-edit', routeSlug],
    queryFn: async () => {
      const res = await apiFetch(`/api/articles/${routeSlug}`);
      if (!res.ok) throw new Error('Failed to fetch article for editing');
      return res.json();
    },
    enabled: !!routeSlug && !articleToEdit,
  });

  useEffect(() => {
    if (fetchedArticle && !articleToEdit) {
      const art = fetchedArticle.article || fetchedArticle;
      setForm({
        title: art.title || '',
        topicId: art.topicId || art.topic?.id || '',
        imageUrl: art.imageUrl || art.coverImage || '',
        content: art.content || '',
        published: art.published ?? false,
      });
    }
  }, [fetchedArticle, articleToEdit]);

  // Fetch topics
  const { data: topics = [] } = useQuery({
    queryKey: ['blog-topics'],
    queryFn: async () => {
      const res = await apiFetch('/api/articles/topics');
      if (!res.ok) throw new Error('Failed to fetch topics');
      const data = await res.json();
      return data.topics || data;
    }
  });

  // Generic input handlers
  const handleArticleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleTopicChange = (e) => {
    const { name, value } = e.target;
    setTopicForm(prev => ({ ...prev, [name]: value }));
  };

  // Topic Mutations
  const createTopicMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await apiFetch('/api/articles/topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create topic');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-topics'] });
      setTopicForm({ name: '', description: '' });
      alert('Topic created successfully!');
    },
    onError: (err) => alert(err.message)
  });

  const updateTopicMutation = useMutation({
    mutationFn: async ({ id, payload }) => {
      const res = await apiFetch(`/api/articles/topics/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update topic');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-topics'] });
      setEditingTopicId(null);
      setTopicForm({ name: '', description: '' });
      alert('Topic updated successfully!');
    },
    onError: (err) => alert(err.message)
  });

  const deleteTopicMutation = useMutation({
    mutationFn: async (id) => {
      const res = await apiFetch(`/api/articles/topics/${id}`, { method: 'DELETE' });
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

  // Article Save Mutation
  const saveArticleMutation = useMutation({
    mutationFn: async (articleData) => {
      const targetSlug = effectiveSlug || (articleToEdit && articleToEdit.id);
      const url = targetSlug ? `/api/articles/${targetSlug}` : '/api/articles';
      const method = targetSlug ? 'PATCH' : 'POST';

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
      alert(isEditing ? 'Article updated successfully!' : 'Article published successfully!');
      if (onBack) onBack();
      else navigate('/admin');
    },
    onError: (err) => alert(err.message)
  });

  // Media Upload Handler
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('media', file);

      const response = await apiFetch('/api/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Upload failed');

      setForm(prev => ({ ...prev, imageUrl: data.url || data.secure_url }));
    } catch (err) {
      alert(err.message || 'Failed to upload file.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            {onBack ? (
              <button onClick={onBack} className="text-sm font-bold text-accent hover:underline">
                &larr; Back to Articles List
              </button>
            ) : (
              <span className="text-sm font-bold text-gray-400">Content Workspace</span>
            )}
          </div>
          <h1 className="text-3xl font-bold text-primary mb-1">
            {isEditing ? 'Edit Article' : 'Blog & Content Manager'}
          </h1>
          <p className="text-gray-500 text-sm">
            {isEditing ? 'Modify your publication details below.' : 'Create topics and manage blog publications.'}
          </p>
        </div>
        
        {!effectiveSlug && !articleToEdit && (
          <div className="flex bg-white rounded-xl shadow-sm border border-gray-200 p-1">
            <button 
              onClick={() => setBlogActiveTab('articles')}
              className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${blogActiveTab === 'articles' ? 'bg-primary text-white shadow-sm' : 'text-gray-500 hover:text-primary'}`}
            >
              New Article
            </button>
            <button 
              onClick={() => setBlogActiveTab('topics')}
              className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${blogActiveTab === 'topics' ? 'bg-primary text-white shadow-sm' : 'text-gray-500 hover:text-primary'}`}
            >
              Manage Topics
            </button>
          </div>
        )}
      </div>

      {(blogActiveTab === 'articles' || isEditing) ? (
        <form 
          onSubmit={(e) => { 
            e.preventDefault(); 
            saveArticleMutation.mutate(form); 
          }} 
          className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-gray-100 space-y-6"
        >
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Article Title</label>
            <input 
              type="text" 
              name="title"
              required 
              value={form.title} 
              onChange={handleArticleChange} 
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary outline-none transition-all text-sm" 
              placeholder="Understanding Daily Anxiety..." 
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Select Topic</label>
              <select 
                name="topicId"
                required 
                value={form.topicId} 
                onChange={handleArticleChange} 
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:border-primary outline-none transition-all text-sm"
              >
                <option value="">Select a topic...</option>
                {topics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Featured Image</label>
              <input 
                type="file" 
                accept="image/*,video/*"
                onChange={handleFileChange}
                disabled={uploading}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-primary file:text-white cursor-pointer"
              />
              {uploading && <p className="text-xs text-primary font-medium mt-2 animate-pulse">Uploading asset...</p>}
              {form.imageUrl && (
                <div className="mt-4 relative w-full h-40 rounded-2xl overflow-hidden border border-gray-200 bg-gray-100">
                  <img src={form.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, imageUrl: '' }))}
                    className="absolute top-2 right-2 bg-red-600 text-white w-7 h-7 rounded-full font-bold text-xs flex items-center justify-center shadow-md"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Content</label>
            <div className="bg-white rounded-2xl overflow-hidden border border-gray-200 focus-within:border-primary transition-all">
              <ReactQuill 
                theme="snow" 
                value={form.content} 
                onChange={(val) => setForm(prev => ({ ...prev, content: val }))} 
                modules={quillModules}
                className="min-h-[250px]"
              />
            </div>
            <div className="h-12"></div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <input 
              type="checkbox" 
              name="published"
              id="pub" 
              checked={form.published} 
              onChange={handleArticleChange} 
              className="w-5 h-5 text-primary rounded accent-primary cursor-pointer" 
            />
            <label htmlFor="pub" className="font-bold text-gray-700 text-sm cursor-pointer">
              Publish immediately (make visible on public blog)
            </label>
          </div>

          <div className="flex gap-4">
            {onBack && (
              <button 
                type="button" 
                onClick={onBack}
                className="w-1/3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-4 rounded-xl text-sm transition-all"
              >
                Cancel
              </button>
            )}
            <button 
              type="submit" 
              disabled={saveArticleMutation.isPending}
              className={`${onBack ? 'w-2/3' : 'w-full'} bg-primary hover:bg-[#3d4d40] text-white font-bold py-4 rounded-xl shadow-md transition-all disabled:opacity-70 text-sm`}
            >
              {saveArticleMutation.isPending ? 'Saving...' : isEditing ? 'Update Article' : 'Save Article'}
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-8">
          <form 
            onSubmit={(e) => { 
              e.preventDefault(); 
              if (editingTopicId) {
                updateTopicMutation.mutate({ id: editingTopicId, payload: topicForm });
              } else {
                createTopicMutation.mutate(topicForm); 
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
                    setTopicForm({ name: '', description: '' });
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
                name="name"
                required 
                value={topicForm.name} 
                onChange={handleTopicChange} 
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary outline-none text-sm" 
                placeholder="Mindfulness & Grounding" 
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Description (Optional)</label>
              <textarea 
                rows={3} 
                name="description"
                value={topicForm.description} 
                onChange={handleTopicChange} 
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary outline-none text-sm resize-none" 
                placeholder="Short description of this category..."
              ></textarea>
            </div>

            <button 
              type="submit" 
              disabled={createTopicMutation.isPending || updateTopicMutation.isPending}
              className="w-full bg-primary hover:bg-[#3d4d40] text-white font-bold py-4 rounded-xl shadow-md transition-all disabled:opacity-70 text-sm"
            >
              {createTopicMutation.isPending || updateTopicMutation.isPending 
                ? 'Processing...' 
                : editingTopicId ? 'Update Topic' : 'Create Topic'}
            </button>
          </form>

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
                        onClick={() => openTopicDetails(topic)}
                        className="bg-white hover:bg-gray-100 text-gray-700 font-bold px-3 py-1.5 rounded-lg text-xs border border-gray-200 transition-colors"
                      >
                        View
                      </button>
                      <button
                        onClick={() => {
                          setEditingTopicId(topic.id);
                          setTopicForm({ name: topic.name, description: topic.description || '' });
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

      {/* Topic Details Modal powered by Zustand */}
      {isTopicDetailsOpen && selectedTopic && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl border border-gray-100 space-y-4">
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold uppercase tracking-wider text-accent bg-accent/10 px-3 py-1 rounded-full">
                Topic Metadata
              </span>
              <button 
                onClick={closeTopicDetails}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <h3 className="text-2xl font-black text-primary">{selectedTopic.name}</h3>

            <div className="space-y-3 text-sm bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <div>
                <span className="block text-xs font-bold uppercase text-gray-400">Slug URL Param</span>
                <span className="text-gray-700 mt-0.5">{selectedTopic.slug}</span>
              </div>
              <div>
                <span className="block text-xs font-bold uppercase text-gray-400">Description</span>
                <p className="text-gray-700 mt-0.5">{selectedTopic.description || 'No description provided.'}</p>
              </div>
            </div>

            <button
              onClick={closeTopicDetails}
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