import { Link, useLocation } from 'react-router-dom';

function NavLink({ to, children }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link 
      to={to} 
      className={`font-semibold text-sm uppercase tracking-wide transition-colors ${
        isActive 
          ? 'text-accent border-b-2 border-accent pb-1' 
          : 'text-gray-500 hover:text-primary'
      }`}
    >
      {children}
    </Link>
  );
}

export default function Navbar() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link to="/" className="text-2xl font-black text-primary tracking-tighter">
          NKATHA<span className="text-accent font-light">WELLNESS</span>
        </Link>
        
        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/services">Services</NavLink>
          <NavLink to="/blog">Insights</NavLink>
          <NavLink to="/book">Book Session</NavLink>
        </nav>

        {/* Right Action / Admin Toggle */}
        <div className="flex items-center gap-4">
          {!isAdminRoute ? (
            <>
              <Link 
                to="/book" 
                className="hidden sm:inline-block bg-primary hover:bg-[#3d4d40] text-white px-6 py-2.5 rounded-full font-medium transition-all shadow-sm text-sm"
              >
                Start Consultation
              </Link>
              <Link 
                to="/admin" 
                className="text-xs font-medium text-gray-400 hover:text-primary transition-colors"
                title="Admin Portal"
              >
                Admin
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <Link 
                to="/admin" 
                className="text-xs font-bold text-gray-600 hover:text-primary uppercase tracking-wider transition-colors"
              >
                Dashboard
              </Link>
              <Link 
                to="/admin/blog" 
                className="text-xs font-bold text-gray-600 hover:text-primary uppercase tracking-wider transition-colors"
              >
                Manage Blog
              </Link>
              <Link 
                to="/" 
                className="text-xs font-bold text-accent hover:underline uppercase tracking-wider"
              >
                Exit Admin
              </Link>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}