import { create } from 'zustand';
import { apiFetch } from '../utils/api.js';
export const useInquiryStore = create((set) => ({
  // Form input state
  formData: {
    name: '',
    email: '',
    subject: '',
    message: '',
  },

  // UI status state
  loading: false,
  success: false,
  error: null,

  // Actions to update inputs
  setField: (field, value) =>
    set((state) => ({
      formData: { ...state.formData, [field]: value },
    })),

  resetForm: () =>
    set({
      formData: { name: '', email: '', subject: '', message: '' },
    }),

  // Async action to submit the inquiry
  submitInquiry: async () => {
    set({ loading: true, success: false, error: null });
    
    // Grab the current form data from the store state
    const { formData } = useInquiryStore.getState();

    try {
      const response = await apiFetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message.');
      }

      set({ loading: false, success: true });
      get().resetForm(); // Clear the form on success
    } catch (err) {
      set({ loading: false, error: err.message });
    }
  },
}));