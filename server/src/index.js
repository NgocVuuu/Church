import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import crypto from 'crypto';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import compression from 'compression';
import { v2 as cloudinary } from 'cloudinary';
import postsRouter from './routes/posts.js';
import sermonsRouter from './routes/sermons.js';
import homeContentRouter from './routes/homeContent.js';
import aboutContentRouter from './routes/aboutContent.js';
import priestsRouter from './routes/priests.js';
import authRouter from './routes/auth.js';
import galleryRouter from './routes/gallery.js';
import contactContentRouter from './routes/contactContent.js';

dotenv.config();

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'"]
    }
  }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Stricter rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs for auth
  message: {
    error: 'Too many login attempts, please try again later.'
  }
});

// CORS configuration - specific origins only
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Prevent parameter pollution
app.use(hpp());

// Compression middleware
app.use(compression());

// Root info (avoid 404 at domain root)
app.get('/', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'church-api',
    message: 'API server is running. Try /api/health',
    endpoints: ['/api/health', '/api/admin/ping', '/api/cloudinary/signature', '/api/posts', '/api/sermons', '/api/home-content', '/api/about-content', '/api/priests', '/api/auth', '/api/gallery', '/api/contact-content'],
  });
});

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'church-api' });
});

// Admin placeholder route
app.get('/api/admin/ping', (_req, res) => {
  res.json({ ok: true });
});

// Cloudinary config (server-side only)
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });

  // Optional: provide a signature for signed uploads if you decide to switch from unsigned
  app.post('/api/cloudinary/signature', (req, res) => {
    const { timestamp = Math.floor(Date.now() / 1000), folder = 'church', public_id, eager, source = 'church-app' } = req.body || {};
    // Build params to sign (must match what the client will send to Cloudinary)
    const paramsToSign = { timestamp, folder };
    if (public_id) paramsToSign.public_id = public_id;
    if (eager) paramsToSign.eager = eager;
    // Cloudinary sorts keys alpha internally; use their helper to generate signature
    const signature = cloudinary.utils.api_sign_request(paramsToSign, process.env.CLOUDINARY_API_SECRET);
    res.json({
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      timestamp,
      folder,
      signature,
    });
  });
}

// Data routes
app.use('/api/posts', postsRouter);
app.use('/api/sermons', sermonsRouter);
app.use('/api/home-content', homeContentRouter);
app.use('/api/about-content', aboutContentRouter);
app.use('/api/priests', priestsRouter);
app.use('/api/auth', authLimiter, authRouter);
app.use('/api/gallery', galleryRouter);
app.use('/api/contact-content', contactContentRouter);

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/church';

async function start() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected');
  } catch (e) {
    console.warn('MongoDB not connected yet. Continuing without DB. Set MONGODB_URI in .env');
  }
  app.listen(PORT, () => console.log(`API đang chạy tại http://localhost:${PORT}`));
}

start();
