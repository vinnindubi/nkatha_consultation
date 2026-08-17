import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';

// Layout Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Public Pages
import Home from './pages/public/Home';
import Services from './pages/public/Services';
import BookingCalendar from './components/booking/BookingCalendar';
import BlogHub from './pages/public/BlogHub';
import ArticleReader from './pages/public/ArticleReader';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import BlogManager from './pages/admin/BlogManager';

const queryClient = new QueryClient();

/**
 * A wrapper component that checks with the backend if the admin HTTP-only cookie is valid.
 * If valid, it renders the protected admin page. If not, it redirects to /admin/login.
 */
function ProtectedAdminRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // null = loading

  useEffect(() => {
    fetch('/api/auth/verify', { method: 'GET' })
      .then((res) => {
        if (res.ok) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      })
      .catch(() => setIsAuthenticated(false));
  }, []);

  if (isAuthenticated === null) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/admin/login" replace />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col font-sans selection:bg-primary selection:text-white bg-[#F4F1ED]">
          
          <Navbar />

          <main className="flex-1 px-4 py-10 max-w-7xl mx-auto w-full">
            <Routes>
              {/* --- Public Routes --- */}
              <Route path="/" element={<Home />} />
              <Route path="/services" element={<Services />} />
              <Route path="/book" element={<BookingCalendar />} />
              <Route path="/blog" element={<BlogHub />} />
              <Route path="/blog/:slug" element={<ArticleReader />} />
              
              {/* --- Admin Authentication Route --- */}
              <Route path="/admin/login" element={<AdminLogin />} />

              {/* --- Protected Admin Routes --- */}
              <Route 
                path="/admin" 
                element={
                  <ProtectedAdminRoute>
                    <AdminDashboard />
                  </ProtectedAdminRoute>
                } 
              />
              <Route 
                path="/admin/blog" 
                element={
                  <ProtectedAdminRoute>
                    <BlogManager />
                  </ProtectedAdminRoute>
                } 
              />
            </Routes>
          </main>
          
          <Footer />

        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}