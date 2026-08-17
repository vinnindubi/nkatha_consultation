import { create } from 'zustand';
import { startOfToday } from 'date-fns';

export const useBookingStore = create((set) => ({
  // State
  selectedServiceId: '',
  selectedDate: startOfToday(),
  selectedSlot: null,
  sessionFormat: 'online', // 'online' or 'in-person'
  formData: { name: '', email: '', phone: '', notes: '' },

  // Actions
  setSelectedServiceId: (serviceId) => set({ 
    selectedServiceId: serviceId, 
    selectedSlot: null // Reset slot when service changes
  }),
  setSelectedDate: (date) => set({ 
    selectedDate: date, 
    selectedSlot: null // Reset slot when date changes
  }),
  setSelectedSlot: (slot) => set({ selectedSlot: slot }),
  setSessionFormat: (format) => set({ sessionFormat: format }),
  setFormData: (data) => set((state) => ({ 
    formData: { ...state.formData, ...data } 
  })),
  
  // Reset after successful booking
  resetForm: () => set({ 
    selectedServiceId: '',
    selectedSlot: null, 
    sessionFormat: 'online',
    formData: { name: '', email: '', phone: '', notes: '' } 
  })
}));