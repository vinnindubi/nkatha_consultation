import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from "@vercel/speed-insights/react";

// Layout Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Public Pages
import Home from './pages/public/Home';
import Services from './pages/public/Services';
import BookingCalendar from './components/booking/BookingCalendar';
import BlogHub from './pages/public/BlogHub';
import ArticleReader from './pages/public/ArticleReader';

// Admin & Portal Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import BlogManager from './pages/admin/BlogManager';
import Profile from './pages/Profile'; 
import Register from './pages/public/Register';
// Unified Route Guard Wrapper (Supports any role combination)
import ProtectedRoute from './components/ProtectedRoute'; // Renamed for clarity

const queryClient = new QueryClient();

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
              
              {/* --- Auth Route --- */}
              <Route path="/login" element={<AdminLogin />} />

              {/* --- Client Portal Route --- */}
              <Route 
                path="/client/profile" 
                element={
                  <ProtectedRoute allowedRoles={['CLIENT', 'SUPER_ADMIN', 'THERAPIST']}>
                    <Profile />
                  </ProtectedRoute>
                } 
              />
              <Route path="/register" element={<Register />} />

              {/* --- Shared Staff Routes (Super Admin & Therapists) --- */}
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'THERAPIST']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/profile" 
                element={
                  <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'THERAPIST']}>
                    <Profile />
                  </ProtectedRoute>
                } 
              />

              {/* --- Super Admin Only Routes --- */}
              <Route 
                path="/admin/blog" 
                element={
                  <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
                    <BlogManager />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/blog/edit/:slug" 
                element={
                  <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
                    <BlogManager />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </main>
          
          <Footer />
          <Analytics />
          <SpeedInsights />
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}  