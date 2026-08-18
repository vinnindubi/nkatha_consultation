import { useState } from 'react';
import { format, addDays, startOfToday } from 'date-fns';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useBookingStore } from '../../store/useBookingStore.js';
import { apiFetch } from '../../utils/api.js';

export default function BookingCalendar() {
  const { 
    selectedServiceId, setSelectedServiceId,
    selectedDate, setSelectedDate, 
    selectedSlot, setSelectedSlot, 
    sessionFormat, setSessionFormat,
    formData, setFormData, resetForm 
  } = useBookingStore();

  const [isSubmitted, setIsSubmitted] = useState(false);

  const today = startOfToday();
  const nextDays = Array.from({ length: 14 }).map((_, i) => addDays(today, i));
  const formattedDate = format(selectedDate, 'yyyy-MM-dd');

  // 1. Fetch available services from backend
  const { data: services = [], isLoading: loadingServices } = useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const res = await apiFetch('/api/services');
      if (!res.ok) throw new Error('Failed to fetch services');
      return res.json();
    }
  });

  // 2. Fetch available slots based on selected service and date
  const { data: availableSlots = [], isLoading: loadingSlots, isError } = useQuery({
    queryKey: ['slots', selectedServiceId, formattedDate],
    enabled: !!selectedServiceId,
    queryFn: async () => {
      const response = await apiFetch(`/api/bookings/slots?serviceId=${selectedServiceId}&date=${formattedDate}`);
      if (!response.ok) throw new Error('Failed to fetch slots');
      const data = await response.json();
      return data.slots || [];
    },
  });

  // 3. Submit booking mutation
  const bookMutation = useMutation({
    mutationFn: async (payload) => {
      const response = await apiFetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Booking submission failed');
      return data;
    },
    onSuccess: () => {
      setIsSubmitted(true);
    },
    onError: (err) => {
      alert(err.message || "There was an issue submitting your request. Please try again.");
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    bookMutation.mutate({
      serviceId: Number(selectedServiceId),
      appointmentDate: formattedDate,
      startTime: selectedSlot,
      clientName: formData.name,
      clientEmail: formData.email,
      clientPhone: formData.phone || '',
      sessionFormat: sessionFormat,
      notes: formData.notes || ''
    });
  };

  if (isSubmitted) {
    return (
      <div className="max-w-xl mx-auto bg-white p-12 rounded-3xl shadow-sm border border-gray-100 text-center animate-fade-in-up my-12">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
          ✓
        </div>
        <h2 className="text-3xl font-black text-primary mb-3">Appointment Requested</h2>
        <p className="text-gray-600 mb-8 leading-relaxed">
          Thank you, <span className="font-bold text-gray-900">{formData.name}</span>. Your request for <span className="font-bold text-gray-900">{format(selectedDate, 'MMMM do, yyyy')}</span> at <span className="font-bold text-gray-900">{selectedSlot}</span> has been received. Nkatha will review and confirm your session shortly.
        </p>
        <button
          onClick={() => {
            resetForm();
            setIsSubmitted(false);
          }}
          className="bg-primary hover:bg-[#3d4d40] text-white font-bold px-8 py-3.5 rounded-xl transition-all shadow-md"
        >
          Book Another Session
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden my-6">
      
      {/* Header Banner */}
      <div className="bg-primary p-8 md:p-10 text-white text-center">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">Schedule a Consultation</h2>
        <p className="text-primary-100 text-lg opacity-90 max-w-xl mx-auto">
          Take the first step towards clarity. Select your service, date, and time.
        </p>
      </div>

      <div className="p-6 md:p-10 space-y-12">
        
        {/* Step 1: Select Service */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white font-bold text-sm">1</span>
            <h3 className="text-lg font-bold text-gray-800">Select a Service</h3>
          </div>

          {loadingServices ? (
            <div className="flex justify-center items-center h-32 bg-gray-50 rounded-2xl">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : services.length === 0 ? (
            <div className="p-8 bg-gray-50 rounded-2xl text-center text-gray-500">
              No services available at the moment. Please check back soon.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {services.map((service) => {
                const isSelected = selectedServiceId === String(service.id);
                return (
                  <div
                    key={service.id}
                    onClick={() => setSelectedServiceId(String(service.id))}
                    className={`p-6 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected 
                        ? 'border-primary bg-primary/5 shadow-md' 
                        : 'border-gray-100 bg-gray-50/50 hover:border-primary/30 hover:bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-gray-900 text-lg">{service.name}</h4>
                        <span className="text-xs font-bold bg-white px-3 py-1 rounded-full shadow-sm text-accent">
                          {service.durationMinutes} mins
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm line-clamp-2 mb-4">{service.description}</p>
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-gray-100 text-sm font-bold">
                      <span className="text-primary">${service.price}</span>
                      <span className={isSelected ? 'text-primary' : 'text-gray-400'}>
                        {isSelected ? 'Selected ✓' : 'Select Service'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Step 2: Date Selection */}
        {selectedServiceId && (
          <div className="animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white font-bold text-sm">2</span>
              <h3 className="text-lg font-bold text-gray-800">Choose a Date</h3>
            </div>
            
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {nextDays.map((day) => {
                const isSelected = selectedDate.getTime() === day.getTime();
                return (
                  <button
                    key={day.toString()}
                    onClick={() => setSelectedDate(day)}
                    className={`flex flex-col items-center justify-center min-w-[5.5rem] h-24 rounded-2xl border-2 transition-all cursor-pointer ${
                      isSelected 
                        ? 'border-primary bg-primary text-white shadow-md transform scale-105' 
                        : 'border-gray-100 bg-gray-50 hover:border-primary/40 text-gray-700 hover:bg-white'
                    }`}
                  >
                    <span className={`text-xs font-bold uppercase tracking-wider mb-1 ${isSelected ? 'text-gray-200' : 'text-gray-400'}`}>
                      {format(day, 'MMM')}
                    </span>
                    <span className="text-2xl font-black">{format(day, 'd')}</span>
                    <span className={`text-[11px] font-medium mt-1 ${isSelected ? 'text-gray-200' : 'text-gray-400'}`}>
                      {format(day, 'EEEE')}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 3: Time Slots Grid */}
        {selectedServiceId && (
          <div className="animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white font-bold text-sm">3</span>
              <h3 className="text-lg font-bold text-gray-800">Available Times</h3>
              <span className="ml-auto text-sm font-medium text-gray-400 bg-gray-50 px-3 py-1 rounded-full">
                {format(selectedDate, 'MMMM do')}
              </span>
            </div>
            
            {loadingSlots ? (
              <div className="flex justify-center items-center h-40 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
              </div>
            ) : isError ? (
              <div className="text-center p-10 bg-red-50 text-red-600 rounded-2xl border border-red-100 font-medium">
                We couldn't load the schedule. Please try again.
              </div>
            ) : availableSlots.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {availableSlots.map((slot) => (
                  <button
                    key={slot}
                    onClick={() => setSelectedSlot(slot)}
                    className={`py-4 px-4 rounded-xl text-sm font-bold border-2 transition-all duration-200 ${
                      selectedSlot === slot 
                        ? 'border-accent bg-accent text-white shadow-md transform scale-105' 
                        : 'border-gray-100 bg-white text-gray-600 hover:border-accent/40 hover:text-accent'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center p-12 bg-gray-50 rounded-2xl border border-gray-100">
                <p className="text-gray-500 font-medium">No available slots on this date.</p>
                <p className="text-sm text-gray-400 mt-2">Please select another day from the calendar above.</p>
              </div>
            )}
          </div>
        )}

        {/* Step 4: Client Details & Session Format */}
        {selectedSlot && (
          <div className="border-t border-gray-100 pt-10 animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white font-bold text-sm">4</span>
              <h3 className="text-lg font-bold text-gray-800">Your Information</h3>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ name: e.target.value })}
                    className="w-full px-5 py-4 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    placeholder="Jane Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                  <input 
                    type="email" 
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ email: e.target.value })}
                    className="w-full px-5 py-4 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    placeholder="jane@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
                  <input 
                    type="tel" 
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ phone: e.target.value })}
                    className="w-full px-5 py-4 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    placeholder="+254 712 345 678"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Session Format</label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setSessionFormat('online')}
                    className={`flex-1 py-3 px-6 rounded-xl font-bold border-2 transition-all text-sm ${
                      sessionFormat === 'online' ? 'border-primary bg-primary text-white' : 'border-gray-200 bg-gray-50 text-gray-600'
                    }`}
                  >
                    Online (Virtual Video)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSessionFormat('in-person')}
                    className={`flex-1 py-3 px-6 rounded-xl font-bold border-2 transition-all text-sm ${
                      sessionFormat === 'in-person' ? 'border-primary bg-primary text-white' : 'border-gray-200 bg-gray-50 text-gray-600'
                    }`}
                  >
                    In-Person Session
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">What would you like to discuss? (Optional)</label>
                <textarea 
                  rows="3"
                  value={formData.notes}
                  onChange={(e) => setFormData({ notes: e.target.value })}
                  className="w-full px-5 py-4 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
                  placeholder="Provide any context you feel comfortable sharing before the session..."
                ></textarea>
              </div>

              <div className="mt-8 flex justify-end">
                <button 
                  type="submit"
                  disabled={bookMutation.isPending}
                  className="bg-primary hover:bg-[#3d4d40] disabled:opacity-70 disabled:cursor-not-allowed text-white font-bold py-4 px-10 rounded-xl shadow-md transition-all flex items-center gap-2"
                >
                  {bookMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Submitting Request...
                    </>
                  ) : (
                    'Confirm Appointment Request'
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}