import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="animate-fade-in-up">
      
      {/* 1. HERO SECTION */}
      <section className="relative flex flex-col-reverse md:flex-row items-center justify-between gap-12 py-16 md:py-24">
        {/* Text Content */}
        <div className="flex-1 text-center md:text-left">
          <span className="text-accent font-bold tracking-widest uppercase text-sm mb-4 block">
            A Safe Space to Heal
          </span>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-primary leading-tight mb-6 tracking-tight">
            Find clarity.<br />
            <span className="font-light">Embrace growth.</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-lg leading-relaxed mx-auto md:mx-0">
            Professional, empathetic counseling psychology tailored to your unique journey. We provide the tools and support you need to navigate life's challenges.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
            <Link 
              to="/book" 
              className="w-full sm:w-auto bg-primary hover:bg-[#3d4d40] text-white font-bold py-4 px-8 rounded-full shadow-lg transition-all hover:shadow-xl hover:-translate-y-1 text-center"
            >
              Book a Session
            </Link>
            <Link 
              to="/services" 
              className="w-full sm:w-auto bg-transparent border-2 border-primary/20 hover:border-primary text-primary font-bold py-4 px-8 rounded-full transition-all text-center"
            >
              Explore Services
            </Link>
          </div>
        </div>

        {/* Hero Visual (Soft abstract shape placeholder) */}
        <div className="flex-1 w-full max-w-md md:max-w-none relative flex justify-center">
          <div className="absolute inset-0 bg-accent/10 rounded-full blur-3xl transform scale-110 -z-10"></div>
          <div className="w-72 h-72 md:w-96 md:h-96 bg-primary/5 rounded-[3rem] rotate-3 overflow-hidden border border-white/50 shadow-sm flex items-center justify-center">
             {/* Replace this div with an actual image tag later, e.g.: */}
             {/* <img src="/portrait.jpg" alt="Therapist" className="w-full h-full object-cover" /> */}
             <span className="text-primary/30 font-medium text-lg rotate-[-3deg]">Portrait Placeholder</span>
          </div>
        </div>
      </section>

      {/* 2. CORE PHILOSOPHY SECTION */}
      <section className="py-20 border-t border-gray-100">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">Our Approach</h2>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg">
            Therapy is not a one-size-fits-all. We focus on three core pillars to ensure your time here is transformative and grounded.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Pillar 1 */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-50 hover:shadow-md transition-all group">
            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">Empathetic Listening</h3>
            <p className="text-gray-600 leading-relaxed">
              A judgment-free zone where your feelings are validated, heard, and deeply understood.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-50 hover:shadow-md transition-all group">
            <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <svg className="w-7 h-7 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">Evidence-Based</h3>
            <p className="text-gray-600 leading-relaxed">
              Integrating proven psychological techniques like CBT to provide actionable, real-world coping strategies.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-50 hover:shadow-md transition-all group">
            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">Meaningful Growth</h3>
            <p className="text-gray-600 leading-relaxed">
              Moving beyond just managing symptoms to discovering a deeper sense of purpose and self-awareness.
            </p>
          </div>
        </div>
      </section>

      {/* 3. FINAL CTA / BANNER */}
      <section className="my-12 bg-primary rounded-[3rem] p-10 md:p-16 text-center relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="relative z-10">
          <h2 className="text-3xl md:text-5xl font-black text-white mb-6 tracking-tight">Ready to begin?</h2>
          <p className="text-primary-100 text-lg md:text-xl max-w-2xl mx-auto mb-10 opacity-90">
            Taking the first step is often the hardest part. Schedule a session today and let's navigate it together.
          </p>
          <Link 
            to="/book" 
            className="inline-block bg-accent hover:bg-[#c48d4a] text-white font-bold py-4 px-10 rounded-full shadow-lg transition-transform hover:-translate-y-1"
          >
            Schedule Your Consultation
          </Link>
        </div>
      </section>

    </div>
  );
}