import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiFetch } from '../utils/api';
import { useUserStore } from '../store/useUserStore';

export default function Profile() {
  const { user, setUser } = useUserStore();

  // 1. Grouped into a single local form state object
  const [form, setForm] = useState({
    name: user?.name || '',
    avatarUrl: user?.avatarUrl || '',
    currentPassword: '',
    newPassword: '',
  });


  const [feedback, setFeedback] = useState({ message: '', error: '' });

  // Sync inputs if global user changes
  useEffect(() => {
    if (user) {
      setForm(prev => ({
        ...prev,
        name: user.name,
        avatarUrl: user.avatarUrl || ''
      }));
    }
  }, [user]);

  // Generic handler for all inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // Mutation for saving profile updates
  const updateProfileMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await apiFetch('/api/users/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update profile');
      return data;
    },
    onSuccess: (data) => {
      setFeedback({ message: 'Profile updated successfully!', error: '' });
      setForm(prev => ({ ...prev, currentPassword: '', newPassword: '' }));
      setUser(data.user); // Sync back to global Zustand store
    },
    onError: (err) => setFeedback({ message: '', error: err.message }),
  });

    const [uploadingAvatar, setUploadingAvatar] = useState(false);
  // Handle Avatar Upload
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploadingAvatar(true);
      const formData = new FormData();
      formData.append('media', file);

      const res = await apiFetch('/api/upload', { 
        method: 'POST',
        credentials: 'include',
        body: formData 
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      const newUrl = data.url || data.secure_url;
      setForm(prev => ({ ...prev, avatarUrl: newUrl }));
    } catch (err) {
      setFeedback({ message: '', error: err.message });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFeedback({ message: '', error: '' });
    updateProfileMutation.mutate({
      name: form.name,
      avatarUrl: form.avatarUrl,
      currentPassword: form.currentPassword || undefined,
      newPassword: form.newPassword || undefined,
    });
  };

  if (!user) return <div className="p-10 text-center text-gray-500">Loading profile...</div>;

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-primary mb-2">Account Profile</h1>
      <p className="text-gray-500 text-sm mb-8">Manage your personal information and security settings.</p>

      {feedback.message && <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl text-sm font-medium border border-green-200">{feedback.message}</div>}
      {feedback.error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-200">{feedback.error}</div>}

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
        
        {/* Avatar Section */}
        <div className="flex items-center gap-6 pb-6 border-b border-gray-100">
          <div className="relative w-20 h-20 rounded-full overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center">
            {form.avatarUrl ? (
              <img src={form.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl font-bold text-gray-400">{form.name?.charAt(0) || 'U'}</span>
            )}
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Profile Picture</label>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleAvatarChange} 
              disabled={uploadingAvatar}
              className="text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-primary file:text-white cursor-pointer"
            />
            {uploadingAvatar && <p className="text-xs text-primary mt-1 animate-pulse">Uploading avatar...</p>}
          </div>
        </div>

        {/* Basic Info */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
            <input 
              type="text" 
              name="name"
              value={form.name} 
              onChange={handleChange} 
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
            <input 
              type="email" 
              value={user.email} 
              disabled
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed text-sm"
            />
          </div>
        </div>

        <div>
          <span className="inline-block text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary px-3 py-1 rounded-full">
            Role: {user.role?.replace('_', ' ')}
          </span>
        </div>

        {/* Security / Password Update */}
        <div className="pt-6 border-t border-gray-100 space-y-4">
          <h3 className="font-bold text-gray-900 text-base">Change Password</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Current Password</label>
              <input 
                type="password" 
                name="currentPassword"
                value={form.currentPassword} 
                onChange={handleChange} 
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">New Password</label>
              <input 
                type="password" 
                name="newPassword"
                value={form.newPassword} 
                onChange={handleChange} 
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm"
              />
            </div>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={updateProfileMutation.isPending || uploadingAvatar}
          className="w-full bg-primary hover:bg-[#3d4d40] text-white font-bold py-4 rounded-xl shadow-md transition-all disabled:opacity-70 text-sm"
        >
          {updateProfileMutation.isPending ? 'Saving Changes...' : 'Save Profile Changes'}
        </button>

      </form>
    </div>
  );
}