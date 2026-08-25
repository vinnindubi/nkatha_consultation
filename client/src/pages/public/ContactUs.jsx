import { useState } from 'react';
import { useInquiryStore } from '../store/useInquiryStore';
export default function ContactForm() {
  const {
    formData,
    loading,
    success,
    error,
    setField,
    submitInquiry,
  } = useInquiryStore();
  
    const handleChange = (e) => {
    setField(e.target.name, e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    submitInquiry();
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-2xl shadow-sm border border-gray-100 my-10">
      <h2 className="text-2xl font-bold text-[#2c3e35] mb-2">Get in Touch</h2>
      <p className="text-gray-600 text-sm mb-6">
        Have questions about our wellness sessions or need assistance? Send us a message below.
      </p>

      {status.success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
          Thank you! Your message has been sent successfully. We will get back to you shortly.
        </div>
      )}

      {status.error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {status.error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
          <input
            type="text"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            placeholder="Jane Doe"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2c3e35] focus:outline-none text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
          <input
            type="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            placeholder="jane@example.com"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2c3e35] focus:outline-none text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
          <input
            type="text"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            placeholder="Session Inquiry"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2c3e35] focus:outline-none text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
          <textarea
            name="message"
            rows="4"
            required
            value={formData.message}
            onChange={handleChange}
            placeholder="How can we help you?"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2c3e35] focus:outline-none text-sm resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={status.loading}
          className="w-full py-2.5 bg-[#2c3e35] text-white font-medium rounded-lg hover:bg-[#1f2c25] transition-colors text-sm disabled:opacity-50"
        >
          {status.loading ? 'Sending Message...' : 'Send Message'}
        </button>
      </form>
    </div>
  );
}