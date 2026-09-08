import { create } from 'zustand';

export const useDashboardStore = create((set) => ({
  activeTab: 'appointments',
  setActiveTab: (tab) => set({ activeTab: tab }),

  // Appointment Modal
  selectedAppointment: null,
  setSelectedAppointment: (appointment) => set({ selectedAppointment: appointment }),

  // Service Modal
  isServiceModalOpen: false,
  editingServiceId: null,
  serviceForm: {
    name: '',
    description: '',
    durationMinutes: 60,
    price: '',
    focusAreas:  [],
    isActive: true,
  },
  openCreateServiceModal: () => set({
    isServiceModalOpen: true,
    editingServiceId: null,
    serviceForm: { name: '', description: '', durationMinutes: 60, price: '', focusAreas: [], isActive: true }
  }),
  openEditServiceModal: (service) => set({
    isServiceModalOpen: true,
    editingServiceId: service.id,
    serviceForm: {
      name: service.name,
      description: service.description,
      durationMinutes: service.durationMinutes,
      price: service.price,
      focusAreas: Array.isArray(service.focusAreas) 
              ? service.focusAreas 
              : (typeof service.focusAreas === 'string' ? service.focusAreas.split(',').map(s => s.trim()) : []),
      isActive: service.isActive ?? true,
    }
  }),
  closeServiceModal: () => set({ isServiceModalOpen: false, editingServiceId: null }),
  setServiceForm: (formUpdater) => set((state) => ({
    serviceForm: typeof formUpdater === 'function' ? formUpdater(state.serviceForm) : formUpdater
  })),

  // New Therapist Modal / Form state (Super Admin)
  newTherapistForm: { name: '', email: '', password: '' },
  setNewTherapistForm: (formUpdater) => set((state) => ({
    newTherapistForm: typeof formUpdater === 'function' ? formUpdater(state.newTherapistForm) : formUpdater
  })),
  
  // Blog & Topic Management States
  blogActiveTab: 'articles', // 'articles' or 'topics'
  setBlogActiveTab: (tab) => set({ blogActiveTab: tab }),

  selectedTopic: null,
  isTopicDetailsOpen: false,
  openTopicDetails: (topic) => set({ selectedTopic: topic, isTopicDetailsOpen: true }),
  closeTopicDetails: () => set({ selectedTopic: null, isTopicDetailsOpen: false }),

  editingTopicId: null,
  setEditingTopicId: (id) => set({ editingTopicId: id }),

}));