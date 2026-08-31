import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import 'dotenv/config';
import cookieParser from 'cookie-parser';
// Import our routes
import bookingRoutes from './routes/booking.routes.js';
import authRoutes from './routes/auth.routes.js';
import { errorHandler } from './middleware/error.middleware.js';
import articleRoutes from './routes/article.routes.js';
import serviceRoutes from './routes/services.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import therapistRoutes from './routes/therapist.routes.js';
import './workers/emailWorker.js';
import userRoutes from './routes/user.routes.js'
// Load environment variables (e.g., PORT, DATABASE_URL, CLIENT_URL)

const app = express();
const PORT = process.env.PORT || 5000;

/**
 * 1. GLOBAL MIDDLEWARE & SECURITY
 */

// Helmet secures Express apps by setting 15+ HTTP response headers (Anti-XSS, etc.)
app.use(helmet());

// CORS ensures only your React app can make requests to this API
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173', 
  credentials: true, // required if using cookies/sessions later
}));
app.use(cookieParser()); // Parse cookies for future use (e.g., auth tokens)
// Parses incoming JSON payloads (e.g., from the booking form)
app.use(express.json({limit:'50mb'}));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
/**
 * 2. RATE LIMITING (Bot Protection)
 * Prevents someone from writing a script to spam the API with thousands of requests.
 */
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: 100, // Limit each IP to 100 requests per window
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
});
app.use(globalLimiter);
app.use(errorHandler); // Global error handler for uncaught errors

/**
 * 3. MOUNT ROUTES
 */

// A simple health check endpoint to verify the server is running
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});
app.use('/api/users',userRoutes);
// Mount the booking routes under the /api/bookings prefix
app.use('/api/bookings', bookingRoutes);
app.use('/api/auth', authRoutes); // Mount auth routes for admin login/logout
app.use('/api/articles', articleRoutes);
// (Future routes you will mount here)
// app.use('/api/services', serviceRoutes);
// app.use('/api/admin', adminRoutes);

app.use('/api/services', serviceRoutes);
app.use('/api/upload', uploadRoutes);

app.use('/api/therapists', therapistRoutes);

/**
 * 4. START THE SERVER
 */
app.listen(PORT, () => {
  console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`Listening on http://localhost:${PORT}`);
});