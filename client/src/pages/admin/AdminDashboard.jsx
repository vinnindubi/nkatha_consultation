import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Link, useNavigate } from 'react-router-dom';
import {apiFetch} from '../../utils/api';
export default function AdminDashboard() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('appointments'); // 'appointments' or 'articles'
  const [selectedAppointment, setSelectedAppointment] = useState(null); // For the details modal
 
  // 1. Fetch Appointments
  const { data: appointments = [], isLoading: loadingAppointments } = useQuery({
    queryKey: ['admin-appointments'],
    queryFn: async () => {
      const res = await apiFetch('/api/bookings/appointments', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch appointments');
      return res.json();
    }
  });

  // 2. Fetch Articles for Management
  const { data: articles = [], isLoading: loadingArticles } = useQuery({
    queryKey: ['admin-articles'],
    queryFn: async () => {
      const res = await apiFetch('/api/articles', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch articles');
      return res.json();
    }
  });

  // Logout Mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await apiFetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
      if (!res.ok) throw new Error('Logout failed');
      return res.json();
    },
    onSuccess: () => {
      navigate('/admin/login');
    }
  });

  // Update Appointment Status Mutation (Approve / Reject / Complete)
  const updateAppointmentStatus = useMutation({
    mutationFn: async ({ id, status }) => {
      const res = await apiFetch(`/api/bookings/appointments/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error('Failed to update status');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-appointments'] });
    }
  });

  // Delete Article Mutation
  const deleteArticleMutation = useMutation({
    mutationFn: async (id) => {
      const res = await apiFetch(`/api/articles/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Failed to delete article');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-articles'] });
      alert('Article deleted successfully.');
    }
  });


  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState(null);
  const [serviceForm, setServiceForm] = useState({
    name: '',
    description: '',
    durationMinutes: 60,
    price: '',
    focusAreas: ''
  });

// Fetch Services for Admin View
const { data: services = [], isLoading: loadingServices } = useQuery({
  queryKey: ['admin-services'],
  queryFn: async () => {
    const res = await apiFetch('/api/services');
    if (!res.ok) throw new Error('Failed to fetch services');
    return res.json();
  }
});

// Create Service Mutation
const createServiceMutation = useMutation({
  mutationFn: async (formData) => {
    const res = await apiFetch('/api/services', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(formData)
    });
    if (!res.ok) throw new Error('Failed to create service');
    return res.json();
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['admin-services'] });
    setIsServiceModalOpen(false);
    setServiceForm({ name: '', description: '', durationMinutes: 60, price: '', focusAreas: '' });
    alert('Service created successfully!');
  }
});
const saveServiceMutation = useMutation({
    mutationFn: async (formData) => {
      const url = `/api/services/${editingServiceId}`;
      const method = 'PATCH';

      const res = await apiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });
      if (!res.ok) throw new Error('Failed to save service');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-services'] });
      closeServiceModal();
      alert(editingServiceId ? 'Service updated successfully!' : 'Service created successfully!');
    }
  });

const openCreateModal = () => {
    setEditingServiceId(null);
    setServiceForm({ name: '', description: '', durationMinutes: 60, price: '', focusAreas: '' });
    setIsServiceModalOpen(true);
  };

  const openEditModal = (service) => {
    setEditingServiceId(service.id);
    setServiceForm({
      name: service.name,
      description: service.description,
      durationMinutes: service.durationMinutes,
      price: service.price,
      focusAreas: Array.isArray(service.focusAreas) ? service.focusAreas.join(', ') : service.focusAreas || ''
    });
    setIsServiceModalOpen(true);
  };
  const closeServiceModal = () => {
    setIsServiceModalOpen(false);
    setEditingServiceId(null);
    setServiceForm({ name: '', description: '', durationMinutes: 60, price: '', focusAreas: '' });
  };
const handleServiceSubmit = (e) => {
    e.preventDefault();
    createServiceMutation.mutate(serviceForm);
  };

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 animate-fade-in-up relative">
      
      {/* Header & Quick Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <div>
          <span className="text-accent font-bold tracking-widest uppercase text-xs mb-1 block">
            Admin Portal
          </span>
          <h1 className="text-3xl font-black text-primary tracking-tight">
            Welcome back, Nkatha.
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage your client consultations, services, and digital publications in one place.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={openCreateModal}
            className="bg-primary hover:bg-[#3d4d40] text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all shadow-sm"
          >
            + Create Service
          </button>
          <Link 
            to="/admin/blog" 
            className="bg-primary/10 hover:bg-primary/20 text-primary font-bold px-5 py-2.5 rounded-xl text-sm transition-all"
          >
            + Create Article
          </Link>
          <button 
            onClick={() => logoutMutation.mutate()}
            className="border border-gray-200 hover:border-red-300 text-gray-600 hover:text-red-600 font-bold px-5 py-2.5 rounded-xl text-sm transition-all"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-8 gap-8">
        <button
          onClick={() => setActiveTab('appointments')}
          className={`pb-4 text-sm font-bold transition-all relative ${
            activeTab === 'appointments' ? 'text-primary' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          Appointments
          <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
            {appointments.length}
          </span>
          {activeTab === 'appointments' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>
          )}
        </button>
        
        <button
          onClick={() => setActiveTab('services')}
          className={`pb-4 text-sm font-bold transition-all relative ${
            activeTab === 'services' ? 'text-primary' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          Services
          <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
            {services.length}
          </span>
          {activeTab === 'services' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>
          )}
        </button>

        <button
          onClick={() => setActiveTab('articles')}
          className={`pb-4 text-sm font-bold transition-all relative ${
            activeTab === 'articles' ? 'text-primary' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          Published Articles
          <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
            {articles.length}
          </span>
          {activeTab === 'articles' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>
          )}
        </button>
      </div>

      {/* Tab Content: Appointments */}
      {activeTab === 'appointments' && (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          {loadingAppointments ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : appointments.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              No appointments found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    <th className="p-6">Client</th>
                    <th className="p-6">Service</th>
                    <th className="p-6">Scheduled Time</th>
                    <th className="p-6">Status</th>
                    <th className="p-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {appointments.map((app) => (
                    <tr key={app.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-6">
                        <div className="font-bold text-gray-900">{app.clientName}</div>
                        <div className="text-xs text-gray-500">{app.clientEmail}</div>
                      </td>
                      <td className="p-6 font-semibold text-primary">
                        {app.service?.name || 'General Consultation'}
                      </td>
                      <td className="p-6 text-gray-600">
                        {format(new Date(`${app.appointmentDate.split('T')[0]}T${app.startTime}`), 'MMM d, yyyy h:mm a')}
                      </td>
                      <td className="p-6">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          app.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                          app.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="p-6 text-right space-x-2">
                        <button
                          onClick={() => setSelectedAppointment(app)}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-3 py-1.5 rounded-lg text-xs transition-colors"
                        >
                          View Details
                        </button>
                        {app.status !== 'CONFIRMED' && (
                          <button
                            onClick={() => updateAppointmentStatus.mutate({ id: app.id, status: 'CONFIRMED' })}
                            className="bg-green-50 hover:bg-green-100 text-green-700 font-bold px-3 py-1.5 rounded-lg text-xs transition-colors"
                          >
                            Approve
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Services */}
      {activeTab === 'services' && (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Manage Consultation Offerings</h2>
            <button
              onClick={openCreateModal}
              className="bg-primary text-white font-bold px-4 py-2 rounded-xl text-xs"
            >
              + Add New Service
            </button>
          </div>

          {loadingServices ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : services.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No services configured yet.</div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {services.map((service) => (
                <div key={service.id} className="border border-gray-100 bg-gray-50/50 p-6 rounded-2xl flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-bold text-gray-900">{service.name}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold bg-primary/10 text-primary px-3 py-1 rounded-full">
                          ${service.price} • {service.durationMinutes} mins
                        </span>
                        <button
                          onClick={() => openEditModal(service)}
                          className="bg-white hover:bg-gray-100 text-gray-700 font-bold px-3 py-1 rounded-lg text-xs border border-gray-200 transition-colors"
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm mb-4 leading-relaxed">{service.description}</p>
                  </div>
                  {service.focusAreas && service.focusAreas.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-4 border-t border-gray-200/60">
                      {service.focusAreas.map((area, idx) => (
                        <span key={idx} className="bg-white text-gray-600 text-xs font-medium px-2.5 py-1 rounded-full border border-gray-200">
                          {area}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Articles */}
      {activeTab === 'articles' && (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          {loadingArticles ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : articles.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              No articles published yet. <Link to="/admin/blog" className="text-primary font-bold hover:underline">Create your first article</Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    <th className="p-6">Title</th>
                    <th className="p-6">Topic</th>
                    <th className="p-6">Published Status</th>
                    <th className="p-6">Date</th>
                    <th className="p-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {articles.map((article) => (
                    <tr key={article.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-6 font-bold text-gray-900 max-w-xs truncate">{article.title}</td>
                      <td className="p-6 text-gray-600">{article.topic?.name || 'Uncategorized'}</td>
                      <td className="p-6">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          article.published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {article.published ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="p-6 text-gray-600">
                        {format(new Date(article.createdAt), 'MMM d, yyyy')}
                      </td>
                      <td className="p-6 text-right space-x-3">
                        <Link 
                          to={`/blog/${article.slug}`} 
                          target="_blank" 
                          className="text-gray-500 hover:text-primary font-bold text-xs"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this article?')) {
                              deleteArticleMutation.mutate(article.id);
                            }
                          }}
                          className="text-red-500 hover:text-red-700 font-bold text-xs"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Appointment Details Modal */}
      {selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl animate-fade-in-up border border-gray-100">
            
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-accent bg-accent/10 px-3 py-1 rounded-full">
                  Consultation Details
                </span>
                <h3 className="text-2xl font-black text-primary mt-2">{selectedAppointment.clientName}</h3>
              </div>
              <button 
                onClick={() => setSelectedAppointment(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-sm text-gray-600 border-t border-b border-gray-100 py-6 my-4">
              <div className="flex justify-between">
                <span className="font-semibold text-gray-400">Service:</span>
                <span className="font-bold text-gray-900">{selectedAppointment.service?.name || 'General Consultation'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-gray-400">Email:</span>
                <span className="font-medium text-gray-900">{selectedAppointment.clientEmail}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-gray-400">Phone:</span>
                <span className="font-medium text-gray-900">{selectedAppointment.clientPhone || 'Not provided'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-gray-400">Scheduled Time:</span>
                <span className="font-medium text-gray-900">
                  {format(new Date(`${selectedAppointment.appointmentDate.split('T')[0]}T${selectedAppointment.startTime}`), 'MMM d, yyyy h:mm a')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-gray-400">Format:</span>
                <span className="font-bold uppercase text-primary">{selectedAppointment.sessionFormat || 'Online'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-gray-400">Status:</span>
                <span className={`font-bold uppercase ${selectedAppointment.status === 'CONFIRMED' ? 'text-green-600' : 'text-yellow-600'}`}>
                  {selectedAppointment.status}
                </span>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Client Notes / Context</h4>
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-gray-700 italic text-sm min-h-[80px]">
                {selectedAppointment.notes ? `"${selectedAppointment.notes}"` : 'No notes provided by the client for this session.'}
              </div>
            </div>

            <div className="flex justify-end gap-3">
              {selectedAppointment.status !== 'CONFIRMED' && (
                <button
                  onClick={() => updateAppointmentStatus.mutate({ id: selectedAppointment.id, status: 'CONFIRMED' })}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all shadow-sm"
                >
                  Approve Appointment
                </button>
              )}
              {selectedAppointment.status !== 'CANCELLED' && (
                <button
                  onClick={() => updateAppointmentStatus.mutate({ id: selectedAppointment.id, status: 'CANCELLED' })}
                  className="bg-red-50 hover:bg-red-100 text-red-600 font-bold px-5 py-2.5 rounded-xl text-sm transition-all"
                >
                  Cancel Session
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Create / Edit Service Modal */}
      {isServiceModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl animate-fade-in-up border border-gray-100">
            
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-accent bg-accent/10 px-3 py-1 rounded-full">
                  {editingServiceId ? 'Edit Offering' : 'New Offering'}
                </span>
                <h3 className="text-2xl font-black text-primary mt-2">
                  {editingServiceId ? 'Update Service' : 'Create Service'}
                </h3>
              </div>
              <button 
                onClick={closeServiceModal}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleServiceSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Service Title</label>
                <input 
                  type="text" 
                  required
                  value={serviceForm.name}
                  onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                  placeholder="e.g. Trauma Recovery Session"
                  className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Description</label>
                <textarea 
                  required
                  rows={3}
                  value={serviceForm.description}
                  onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                  placeholder="Detailed description of what this session entails..."
                  className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Duration (Minutes)</label>
                  <input 
                    type="number" 
                    required
                    value={serviceForm.durationMinutes}
                    onChange={(e) => setServiceForm({ ...serviceForm, durationMinutes: e.target.value })}
                    className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Price ($)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    required
                    value={serviceForm.price}
                    onChange={(e) => setServiceForm({ ...serviceForm, price: e.target.value })}
                    placeholder="50.00"
                    className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Focus Areas (Comma separated)</label>
                <input 
                  type="text" 
                  value={serviceForm.focusAreas}
                  onChange={(e) => setServiceForm({ ...serviceForm, focusAreas: e.target.value })}
                  placeholder="Anxiety, Stress, Burnout"
                  className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeServiceModal}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saveServiceMutation.isPending}
                  className="bg-primary hover:bg-[#3d4d40] text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-all shadow-sm"
                >
                  {saveServiceMutation.isPending ? 'Saving...' : editingServiceId ? 'Update Service' : 'Save Service'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
  
}
