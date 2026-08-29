import { useState } from 'react';
import { format, addDays, startOfMonth, startOfToday, isBefore, addMonths,getDaysInMonth,} from 'date-fns';
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
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date());

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
    enabled: !!selectedServiceId && !!formattedDate,
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
                // Only render active services
                if (service.isActive === false) return null;
                
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

        {/* Steps 2 & 3: Date & Time Side-by-Side Grid */}
        {selectedServiceId && (
          <div className="grid md:grid-cols-2 gap-8 animate-fade-in items-start border-t border-gray-100 pt-10">
            
            {/* Left Column: Choose a Date */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white font-bold text-sm">2</span>
                <h3 className="text-lg font-bold text-gray-800">Choose a date</h3>
              </div>
              <p className="text-sm text-gray-500 mb-4">Please select a date</p>
              
              <div className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm">
                {/* Month Navigation Header */}
                <div className="flex justify-between items-center mb-6">
                  <h4 className="text-lg font-bold text-gray-800">
                    {format(currentMonthDate, 'MMMM yyyy')}
                  </h4>
                  <div className="flex gap-1">
                    <button 
                      type="button"
                      onClick={() => setCurrentMonthDate(prev => addMonths(prev, -1))}
                      className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-600 font-bold"
                    >
                      &larr;
                    </button>
                    <button 
                      type="button"
                      onClick={() => setCurrentMonthDate(prev => addMonths(prev, 1))}
                      className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-600 font-bold"
                    >
                      &rarr;
                    </button>
                  </div>
                </div>

                {/* Day Headers */}
                <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-gray-400 mb-2">
                  <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
                </div>

                {/* Days Matrix Grid */}
                <div className="grid grid-cols-7 gap-2">
                  {/* Get the exact starting day index of the month (0 = Sunday, 1 = Monday, etc.) */}
                  {Array.from({ length: startOfMonth(currentMonthDate).getDay() }).map((_, index) => (
                    <div key={`empty-${index}`} />
                  ))}

                  {Array.from({ length: getDaysInMonth(currentMonthDate) }).map((_, index) => {
                    const day = new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth(), index + 1);
                    const isSelected = format(selectedDate, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd');
                    const isPast = isBefore(day, startOfToday());
                    const isFullyBooked = false;

                    return (
                      <button
                        key={day.toString()}
                        type="button"
                        disabled={isPast || isFullyBooked}
                        onClick={() => {
                          setSelectedDate(day);
                          setSelectedSlot(null);
                        }}
                        className={`h-10 w-10 mx-auto rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                          isSelected 
                            ? 'bg-[#d97762] text-white shadow-md' 
                            : isPast || isFullyBooked
                            ? 'text-gray-300 line-through cursor-not-allowed bg-gray-50' 
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {format(day, 'd')}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Column: Choose a Time Slots Grid */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white font-bold text-sm">3</span>
                <h3 className="text-lg font-bold text-gray-800">Choose a Time</h3>
              </div>
              <p className="text-sm text-gray-500 mb-4">Please choose a time</p>

              {loadingSlots ? (
                <div className="flex justify-center items-center h-48 bg-gray-50 rounded-3xl border border-gray-100">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : isError ? (
                <div className="text-center p-8 bg-red-50 text-red-600 rounded-3xl border border-red-100 text-sm font-medium">
                  We couldn't load the schedule. Please try again.
                </div>
              ) : availableSlots.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {availableSlots.map((slot) => {
                    const isSelected = selectedSlot === slot;
                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedSlot(slot)}
                        className={`py-3 px-4 rounded-2xl text-sm font-bold border transition-all duration-200 ${
                          isSelected 
                            ? 'border-primary bg-primary text-white shadow-sm' 
                            : 'border-gray-200 bg-white text-gray-700 hover:border-primary/40 hover:bg-gray-50'
                        }`}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center p-8 bg-gray-50 rounded-3xl border border-gray-100">
                  <p className="text-gray-500 text-sm font-medium">Fully booked on {format(selectedDate, 'dd/MM/yyyy')}!</p>
                  <p className="text-xs text-gray-400 mt-1">Kindly select another date.</p>
                </div>
              )}
            </div>

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
                    value={formData.name || ''}
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
                    value={formData.email || ''}
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
                    value={formData.phone || ''}
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
                  value={formData.notes || ''}
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