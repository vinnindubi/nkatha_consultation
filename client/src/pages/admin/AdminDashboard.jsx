import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { apiFetch } from '../../utils/api';
import AppointmentsTab from '../../components/admin/AppointmentsTab';
import TherapistsTab from '../../components/admin/TherapistsTab';
import ServicesTab from '../../components/admin/ServicesTab';
import ArticlesTab from '../../components/admin/ArticlesTab';
import BlogManager from '../admin/BlogManager';
import {useUserStore} from '../../store/useUserStore';
import { useDashboardStore } from '../../store/useDashboardStore';

export default function AdminDashboard() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Zustand Store States
  const { 
    activeTab, setActiveTab,
    isServiceModalOpen, openCreateServiceModal, openEditServiceModal, closeServiceModal, serviceForm, setServiceForm, editingServiceId,
    newTherapistForm, setNewTherapistForm 
  } = useDashboardStore();

const user = useUserStore((state) => state.user); //global session state
  const [authLoading, setAuthLoading] = useState(true);
const setUser = useUserStore((state) => state.setUser);

// NEW: State to track if we are editing an article ('new', an article object, or null for table view)
  const [editingArticle, setEditingArticle] = useState(null);

  // 1. Verify Session & Role on Mount
  useEffect(() => {
    const verifyUser = async () => {
      try {
        const res = await apiFetch('/api/auth/verify');
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setUser(data.user);
      } catch (err) {
        navigate('/admin/login');
      } finally {
        setAuthLoading(false);
      }
    };
    verifyUser();
  }, [navigate]);

  // 2. Fetch Data Queries
  const { data: appointments = [], isLoading: loadingAppointments } = useQuery({
    queryKey: ['admin-appointments'],
    queryFn: async () => {
      const res = await apiFetch('/api/bookings/appointments'); // Automatically role-scoped by backend
      if (!res.ok) throw new Error('Failed to fetch appointments');
      return res.json();
    },
    enabled: !!user,
  });

  const { data: services = [], isLoading: loadingServices } = useQuery({
    queryKey: ['admin-services'],
    queryFn: async () => {
      const res = await apiFetch('/api/services');
      if (!res.ok) throw new Error('Failed to fetch services');
      return res.json();
    },
    enabled: !!user,
  });

  const { data: therapists = [] } = useQuery({
    queryKey: ['admin-therapists'],
    queryFn: async () => {
      const res = await apiFetch('/api/therapists');
      const data = await res.json();
      if (!res.ok) throw new Error('Failed to fetch therapists');
      return data.therapists;
    },
    enabled: !!user && user.role === 'SUPER_ADMIN',
  });

  // Mutations
  const updateAppointmentStatus = useMutation({
    mutationFn: async ({ id, status }) => {
      const res = await apiFetch(`/api/bookings/appointments/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-appointments'] }),
  });

  const createTherapistMutation = useMutation({
    mutationFn: async (formData) => {
      const res = await apiFetch('/api/therapists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create therapist');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-therapists'] });
      setNewTherapistForm({ name: '', email: '', password: '' });
      alert('Therapist onboarded successfully!');
    },
    onError: (err) => alert(err.message),
  });

  const deleteTherapistMutation = useMutation({
    mutationFn: async (id) => {
      const res = await apiFetch(`/api/therapists/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-therapists'] }),
  });

  const logoutMutation = useMutation({
    mutationFn: async () => apiFetch('/api/auth/logout', { method: 'POST' }),
    onSuccess: () => navigate('/admin/login'),
  });
  // Fetch articles query for the ArticlesTab table
  const { data: articles = [], isLoading: loadingArticles } = useQuery({
    queryKey: ['admin-articles'],
    queryFn: async () => {
      const res = await apiFetch('/api/articles');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch articles');
      return data.articles || data;
    },
    enabled: !!user && user.role === 'SUPER_ADMIN',
  });

  // Delete Article Mutation
  const deleteArticleMutation = useMutation({
    mutationFn: async (id) => {
      const res = await apiFetch(`/api/articles/delete/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete article');
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-articles'] }),
  });

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading workspace...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto py-10 px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <div>
          <span className="text-accent font-bold tracking-widest uppercase text-xs mb-1 block">Practice Portal</span>
          <h1 className="text-3xl font-black text-primary tracking-tight">Welcome back, {user?.name}.</h1>
          <p className="text-gray-500 text-sm mt-1">Role: <span className="font-bold text-primary">{user?.role?.replace('_', ' ')}</span></p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/admin/profile" className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-5 py-2.5 rounded-xl text-sm transition-all">My Profile</Link>
          <button onClick={() => logoutMutation.mutate()} className="border border-red-200 text-red-600 hover:bg-red-50 font-bold px-5 py-2.5 rounded-xl text-sm transition-all">Logout</button>
        </div>
      </div>

      {/* Dynamic Navigation Tabs */}
      <div className="flex border-b border-gray-200 mb-8 gap-8 overflow-x-auto">
        <button onClick={() => setActiveTab('appointments')} className={`pb-4 text-sm font-bold transition-all relative ${activeTab === 'appointments' ? 'text-primary' : 'text-gray-400'}`}>
          {user?.role === 'SUPER_ADMIN' ? 'All Appointments' : 'My Appointments'}
        </button>
        
        {user?.role === 'SUPER_ADMIN' && (
          <>
            <button onClick={() => setActiveTab('therapists')} className={`pb-4 text-sm font-bold transition-all relative ${activeTab === 'therapists' ? 'text-primary' : 'text-gray-400'}`}>
              Manage Therapists
            </button>
            <button onClick={() => setActiveTab('services')} className={`pb-4 text-sm font-bold transition-all relative ${activeTab === 'services' ? 'text-primary' : 'text-gray-400'}`}>
              Services
            </button>
            <button onClick={() => setActiveTab('articles')} className={`pb-4 text-sm font-bold transition-all relative ${activeTab === 'articles' ? 'text-primary' : 'text-gray-400'}`}>
              Articles
            </button>
          </>
        )}
      </div>

      {/* Tabs Content */}
      {activeTab === 'appointments' && (
        <AppointmentsTab appointments={appointments} isLoading={loadingAppointments} onUpdateStatus={(args) => updateAppointmentStatus.mutate(args)} />
      )}

      {activeTab === 'therapists' && user?.role === 'SUPER_ADMIN' && (
        <TherapistsTab 
          therapists={therapists} 
          form={newTherapistForm} 
          setForm={setNewTherapistForm} 
          onSubmit={(e) => { e.preventDefault(); createTherapistMutation.mutate(newTherapistForm); }} 
          onDelete={(id) => deleteTherapistMutation.mutate(id)} 
        />
      )}
      {activeTab === 'services' && user?.role === 'SUPER_ADMIN' && (
        <ServicesTab 
          services={services}
          isModalOpen={isServiceModalOpen}
          openCreate={openCreateServiceModal}
          openEdit={openEditServiceModal}
          closeModal={closeServiceModal}
          form={serviceForm}
          setForm={setServiceForm}
          editingId={editingServiceId}
        />
      )}

      {/* UPDATED: Articles Tab toggles between Table view and BlogManager Editor */}
      {activeTab === 'articles' && user?.role === 'SUPER_ADMIN' && (
        editingArticle !== null ? (
          <BlogManager 
            articleToEdit={editingArticle === 'new' ? null : editingArticle} 
            onBack={() => setEditingArticle(null)} 
          />
        ) : (
          <ArticlesTab 
            articles={articles}
            isLoading={loadingArticles}
            onCreate={() => setEditingArticle('new')}
            onEdit={(article) => setEditingArticle(article)}
            onDelete={(id) => {
              if (confirm("Are you sure you want to delete this article?")) {
                deleteArticleMutation.mutate(id);
              }
            }}
            onTogglePublish={(slug) => {
              if (confirm("Are you sure you want to toggle the publish status of this article?")) {
                apiFetch(`/api/articles/toggle/${slug}`, { method: 'PATCH' })
                  .then(res => {
                    if (!res.ok) throw new Error('Failed to toggle publish status');
                    queryClient.invalidateQueries({ queryKey: ['admin-articles'] });
                  })
                  .catch(err => alert(err.message));
              } }}
          />
        )
      )}
    </div>
  );
}