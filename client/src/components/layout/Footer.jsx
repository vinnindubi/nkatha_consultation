import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 mt-auto py-12 text-gray-500">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
        
        {/* Brand Info */}
        <div>
          <p className="text-lg font-bold text-primary tracking-tight mb-1">
            Nkatha Consulting and Wellness
          </p>
          <p className="text-sm text-gray-400">
            Professional counseling psychology tailored to your personal growth.
          </p>
        </div>

        {/* Quick Links */}
        <div className="flex items-center gap-6 text-sm font-medium">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <Link to="/services" className="hover:text-primary transition-colors">Services</Link>
          <Link to="/book" className="hover:text-primary transition-colors">Book Session</Link>
          <Link to="/admin" className="hover:text-primary transition-colors">Admin</Link>
        </div>

        {/* Copyright */}
        <div className="text-xs text-gray-400">
          <p>&copy; {new Date().getFullYear()} Nkatha Wellness. All rights reserved.</p>
        </div>

      </div>
    </footer>
  );
}