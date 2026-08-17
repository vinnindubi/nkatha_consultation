import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

export default function Services() {
  // Fetch services dynamically from backend
  const { data: services = [], isLoading, isError } = useQuery({
    queryKey: ['public-services'],
    queryFn: async () => {
      const res = await fetch('/api/services');
      if (!res.ok) throw new Error('Failed to fetch services');
      return res.json();
    }
  });

  return (
    <div className="animate-fade-in-up">
      
      {/* Page Header */}
      <section className="text-center py-16 md:py-20 max-w-3xl mx-auto">
        <span className="text-accent font-bold tracking-widest uppercase text-sm mb-4 block">
          How We Can Help
        </span>
        <h1 className="text-4xl md:text-5xl font-black text-primary mb-6 tracking-tight">
          Specialized care for your unique path.
        </h1>
        <p className="text-lg text-gray-600 leading-relaxed">
          Healing is not a linear process. We offer a range of evidence-based therapeutic approaches designed to meet you exactly where you are today.
        </p>
      </section>

      {/* Services Grid */}
      <section className="mb-24">
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          </div>
        ) : isError ? (
          <div className="text-center p-12 bg-red-50 text-red-600 rounded-3xl">
            Failed to load services. Please try again later.
          </div>
        ) : services.length === 0 ? (
          <div className="text-center p-12 bg-gray-50 rounded-3xl text-gray-500">
            No services currently available.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            {services.map((service) => (
              <div 
                key={service.id} 
                className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100 hover:shadow-md transition-all group flex flex-col h-full justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">{service.name}</h2>
                    <span className="text-xs font-bold bg-primary/10 text-primary px-3 py-1.5 rounded-full">
                      ${service.price} • {service.durationMinutes} mins
                    </span>
                  </div>
                  <p className="text-gray-600 leading-relaxed mb-8">
                    {service.description}
                  </p>
                </div>
                
                {service.focusAreas && service.focusAreas.length > 0 && (
                  <div className="pt-6 border-t border-gray-50">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                      Common Focus Areas
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {service.focusAreas.map((area, idx) => (
                        <span 
                          key={idx} 
                          className="bg-gray-50 text-gray-600 text-sm font-medium px-4 py-2 rounded-full border border-gray-100"
                        >
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Session Details / FAQ Teaser */}
      <section className="bg-primary/5 rounded-[3rem] p-10 md:p-16 mb-20 border border-primary/10 flex flex-col md:flex-row gap-12 items-center">
        <div className="flex-1">
          <h2 className="text-3xl font-bold text-primary mb-4">What to expect</h2>
          <p className="text-gray-600 leading-relaxed mb-6">
            Your first session is primarily about connection. We will discuss what brings you to therapy, explore your background, and determine if our approach is the right fit for your needs. 
          </p>
          <ul className="space-y-4 text-gray-700 font-medium">
            <li className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-accent"></span>
              Standard sessions are flexible (60+ mins)
            </li>
            <li className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-accent"></span>
              Secure, confidential environment
            </li>
            <li className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-accent"></span>
              In-person and telehealth options available
            </li>
          </ul>
        </div>
        <div className="flex-1 w-full bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center">
          <h3 className="text-xl font-bold text-gray-800 mb-2">Ready to talk?</h3>
          <p className="text-gray-500 mb-8">View availability and request your first appointment through our secure portal.</p>
          <Link 
            to="/book" 
            className="block w-full bg-primary hover:bg-[#3d4d40] text-white font-bold py-4 px-8 rounded-xl shadow-md transition-all"
          >
            Check Availability
          </Link>
        </div>
      </section>

    </div>
  );
}