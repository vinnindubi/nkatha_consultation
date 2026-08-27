import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {apiFetch} from '../../utils/api';
import RichTextEditor from '../../components/RichTextEditor';
export default function BlogManager() {
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

  const createArticleMutation = useMutation({
    mutationFn: async (newArticle) => {
      const res = await apiFetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newArticle)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create article');
      return data;
    },
    onSuccess: () => {
      setTitle('');
      setContent('');
      setImageUrl('');
      setTopicId('');
      setPublished(false);
      alert('Article published successfully!');
    },
    onError: (err) => {
      alert(err.message);
    }
  });

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 animate-fade-in-up">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary mb-1">Blog & Content Manager</h1>
          <p className="text-gray-500 text-sm">Create topics and publish new articles for your readers.</p>
        </div>
        
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
      </div>

      {activeTab === 'articles' ? (
        <form 
          onSubmit={(e) => { 
            e.preventDefault(); 
            createArticleMutation.mutate({ title, topicId, imageUrl, content, published }); 
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
            {/* Replaced standard textarea with Tiptap Rich Text Editor */}
            <RichTextEditor content={content} onChange={setContent} />
          </div>

          <div className="flex items-center gap-3">
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
            disabled={createArticleMutation.isPending}
            className="w-full bg-primary hover:bg-[#3d4d40] text-white font-bold py-4 rounded-xl shadow-md transition-all disabled:opacity-70"
          >
            {createArticleMutation.isPending ? 'Saving...' : 'Save Article'}
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
            <label className="block text-sm font-bold text-gray-700 mb-2">Content</label>
            {/* Replaced standard textarea with Tiptap Rich Text Editor */}
            <RichTextEditor content={content} onChange={setContent} />
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