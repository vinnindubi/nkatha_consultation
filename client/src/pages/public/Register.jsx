import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiFetch } from '../../utils/api';
import { useUserStore } from '../../store/useUserStore';

export default function Register() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const setUser = useUserStore((state) => state.setUser);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await apiFetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      // Save authenticated user session into Zustand store
      setUser(data.user);

      // Route based on role
      if (data.user.role === 'SUPER_ADMIN' || data.user.role === 'THERAPIST') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-gray-100 animate-fade-in-up">
      
      <div className="text-center mb-8">
        <span className="text-accent font-bold tracking-widest uppercase text-xs mb-2 block">
          Get Started
        </span>
        <h1 className="text-3xl font-bold text-primary mb-2">Create Account</h1>
        <p className="text-gray-500 text-sm">Join us to manage your wellness journey.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100 text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleRegister} className="space-y-5">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
          <input 
            type="text" 
            name="name"
            required
            value={form.name}
            onChange={handleChange}
            className="w-full px-5 py-4 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder-gray-400 text-sm"
            placeholder="Jane Doe"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
          <input 
            type="email" 
            name="email"
            required
            value={form.email}
            onChange={handleChange}
            className="w-full px-5 py-4 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder-gray-400 text-sm"
            placeholder="jane@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
          <input 
            type="password" 
            name="password"
            required
            value={form.password}
            onChange={handleChange}
            className="w-full px-5 py-4 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder-gray-400 text-sm"
            placeholder="••••••••"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Confirm Password</label>
          <input 
            type="password" 
            name="confirmPassword"
            required
            value={form.confirmPassword}
            onChange={handleChange}
            className="w-full px-5 py-4 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder-gray-400 text-sm"
            placeholder="••••••••"
          />
        </div>

        <button 
          type="submit"
          disabled={isLoading}
          className="w-full bg-primary hover:bg-[#3d4d40] text-white font-bold py-4 rounded-xl shadow-md transition-all mt-4 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Creating Account...
            </>
          ) : (
            'Sign Up'
          )}
        </button>

        <div className="text-center mt-6">
          <p className="text-xs text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-primary hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}