import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../utils/api';
import { useState } from 'react';

export default function ServicesTab({ 
  services, 
  isModalOpen, 
  openCreate, 
  openEdit, 
  closeModal, 
  form, 
  setForm, 
  editingId 
}) {
  const queryClient = useQueryClient();
  const [newFocusArea, setNewFocusArea] = useState('');
  const [error, setError] = useState('');

  // Mutations for Create / Update / Delete
  const saveServiceMutation = useMutation({
    mutationFn: async (formData) => {
      const url = editingId ? `/api/services/${editingId}` : '/api/services';
      const method = editingId ? 'PATCH' : 'POST';

      const res = await apiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save service');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-services'] });
      closeModal();
      setError('');
    },
    onError: (err) => setError(err.message),
  });

  const deleteServiceMutation = useMutation({
    mutationFn: async (id) => {
      const res = await apiFetch(`/api/services/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete service');
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-services'] }),
  });

  const handleAddFocusArea = () => {
    if (!newFocusArea.trim()) return;
    
    // Ensure current focusAreas is an array before spreading
    const currentAreas = Array.isArray(form.focusAreas) ? form.focusAreas : [];

    setForm((prev) => ({
      ...prev,
      focusAreas: [...currentAreas, newFocusArea.trim()],
    }));
    setNewFocusArea('');
  };

  const handleRemoveFocusArea = (indexToRemove) => {
    setForm((prev) => ({
      ...prev,
      focusAreas: prev.focusAreas.filter((_, idx) => idx !== indexToRemove),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    saveServiceMutation.mutate(form);
  };

  return (
    <div>
      {/* Header & Add Button */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-black text-primary">Practice Services</h2>
          <p className="text-gray-500 text-sm">Configure therapy offerings, pricing, and session durations.</p>
        </div>
        <button 
          onClick={openCreate}
          className="bg-primary hover:bg-[#3d4d40] text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all shadow-sm"
        >
          + Add New Service
        </button>
      </div>

      {/* Services Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                <th className="p-6">Service Name</th>
                <th className="p-6">Duration</th>
                <th className="p-6">Price</th>
                <th className="p-6">Focus Areas</th>
                <th className="p-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {services.map((service) => (
                <tr key={service.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-6">
                    <div className="font-bold text-gray-900">{service.name}</div>
                    <div className="text-xs text-gray-500 line-clamp-1 max-w-xs">{service.description}</div>
                  </td>
                  <td className="p-6 text-gray-600 font-medium">{service.durationMinutes} mins</td>
                  <td className="p-6 font-bold text-primary">${Number(service.price).toFixed(2)}</td>
                  <td className="p-6">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {service.focusAreas?.map((area, idx) => (
                        <span key={idx} className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md text-[10px] font-semibold">
                          {area}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-6 text-right space-x-2">
                    <button 
                      onClick={() => openEdit(service)} 
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-3 py-1.5 rounded-lg text-xs transition-colors"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete ${service.name}?`)) {
                          deleteServiceMutation.mutate(service.id);
                        }
                      }} 
                      className="bg-red-50 hover:bg-red-100 text-red-600 font-bold px-3 py-1.5 rounded-lg text-xs transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {services.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-12 text-center text-gray-400">No services configured yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Service Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
            
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-accent bg-accent/10 px-3 py-1 rounded-full">
                  {editingId ? 'Edit Service' : 'New Offering'}
                </span>
                <h3 className="text-2xl font-black text-primary mt-2">
                  {editingId ? 'Modify Service Details' : 'Add Practice Service'}
                </h3>
              </div>
              <button 
                onClick={closeModal}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-200">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Service Name</label>
                <input 
                  type="text" 
                  value={form.name} 
                  onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                  placeholder="e.g., Individual Therapy"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                <textarea 
                  rows="3"
                  value={form.description} 
                  onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                  required
                  placeholder="Describe what this session covers..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary outline-none text-sm resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Duration (Minutes)</label>
                  <input 
                    type="number" 
                    value={form.durationMinutes} 
                    onChange={(e) => setForm(prev => ({ ...prev, durationMinutes: parseInt(e.target.value) || 0 }))}
                    required
                    min="15"
                    step="15"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Price ($)</label>
                  <input 
                    type="number" 
                    value={form.price} 
                    onChange={(e) => setForm(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary outline-none text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Focus Areas / Tags</label>
                <div className="flex gap-2 mb-2">
                  <input 
                    type="text" 
                    value={newFocusArea}
                    onChange={(e) => setNewFocusArea(e.target.value)}
                    placeholder="e.g., Anxiety & Stress"
                    className="flex-1 px-4 py-2 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary outline-none text-sm"
                  />
                  <button 
                    type="button" 
                    onClick={handleAddFocusArea}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-4 py-2 rounded-xl text-xs"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(form.focusAreas) && form.focusAreas?.map((area, idx) => (
                    <span key={idx} className="bg-primary/10 text-primary px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-2">
                      {area}
                      <button type="button" onClick={() => handleRemoveFocusArea(idx)} className="text-red-500 font-bold hover:text-red-700">×</button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-5 py-2.5 rounded-xl text-sm transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saveServiceMutation.isPending}
                  className="bg-primary hover:bg-[#3d4d40] text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-all shadow-md disabled:opacity-70"
                >
                  {saveServiceMutation.isPending ? 'Saving...' : (editingId ? 'Update Service' : 'Create Service')}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
}