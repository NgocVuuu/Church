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
import homeRouter from './routes/home.js';
import aboutRouter from './routes/about.js';
import priestsRouter from './routes/priests.js';
import authRouter from './routes/auth.js';
import galleryRouter from './routes/gallery.js';
import bannersRouter from './routes/banners.js';
import contactRouter from './routes/contact.js';

dotenv.config();

const app = express();
// Trust proxy headers when behind platforms like Render and Cloudflare
app.set('trust proxy', 1);

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
// Apply rate limiting only to mutating methods to avoid noisy 429s on GET in dev
app.use('/api/', (req, res, next) => {
  const method = req.method.toUpperCase()
  const isMutating = method === 'POST' || method === 'PUT' || method === 'PATCH' || method === 'DELETE'
  if (isMutating) return limiter(req, res, next)
  return next()
});

// Stricter rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs for auth
  message: {
    error: 'Too many login attempts, please try again later.'
  }
});

// CORS configuration - allow multiple origins via env and common hosting patterns (Vite dev + Cloudflare Pages)
// Normalize client URLs: allow bare hostnames like 'example.pages.dev'
const clientUrls = (process.env.CLIENT_URLS || process.env.CLIENT_URL || 'http://localhost:5173,http://localhost:5174')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean)
  .map(origin => {
    // Already a full origin
    if (/^https?:\/\//i.test(origin)) return origin
    // localhost shorthand like localhost:5173
    if (/^localhost:\d+$/i.test(origin)) return `http://${origin}`
    // Bare hostname -> assume https in production, http otherwise
    const proto = (process.env.NODE_ENV === 'production') ? 'https' : 'http'
    return `${proto}://${origin}`
  })

// Optional regex patterns from env (comma-separated). Useful for *.pages.dev, custom domains, etc.
const originRegexes = (process.env.CLIENT_ORIGIN_REGEXES || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean)
  .map(rx => {
    try { return new RegExp(rx) } catch { return null }
  })
  .filter(Boolean)

// Built-in defaults for Cloudflare Pages and Workers preview domains
const defaultOriginRegexes = [
  /https:\/\/[a-z0-9-]+\.pages\.dev$/i,
  /https:\/\/[a-z0-9-]+\.workers\.dev$/i,
]

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true) // non-browser or same-origin/proxy
    // Allow any localhost:517x for Vite dev convenience
  let ok = clientUrls.includes(origin) || /http:\/\/localhost:517\d$/.test(origin)
    if (!ok) {
      ok = [...defaultOriginRegexes, ...originRegexes].some(rx => rx.test(origin))
    }
    cb(null, ok)
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
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
    endpoints: ['/api/health', '/api/admin/ping', '/api/cloudinary/signature', '/api/posts', '/api/sermons', '/api/home', '/api/about', '/api/priests', '/api/auth', '/api/gallery'],
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

// Admin summary (counts)
app.get('/api/admin/summary', async (_req, res) => {
  try {
    const Post = (await import('./models/Post.js')).default
    const Sermon = (await import('./models/Sermon.js')).default
    const Priest = (await import('./models/Priest.js')).default
    const [posts, sermons, priests] = await Promise.all([
      Post.countDocuments({}),
      Sermon.countDocuments({}),
      Priest.countDocuments({}),
    ])
    res.json({ posts, sermons, priests })
  } catch (e) {
    res.status(500).json({ error: 'summary_failed' })
  }
})

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
app.use('/api/home', homeRouter);
app.use('/api/about', aboutRouter);
app.use('/api/priests', priestsRouter);
app.use('/api/auth', authLimiter, authRouter);
app.use('/api/gallery', galleryRouter);
app.use('/api/banners', bannersRouter);
app.use('/api/contact', contactRouter);

const BASE_PORT = Number(process.env.PORT) || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/church';

async function start() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected');
  } catch (e) {
    console.warn('MongoDB not connected yet. Continuing without DB. Set MONGODB_URI in .env');
  }
  // Try a few ports in case default is busy; useful during dev when previous process didn't exit
  const tryListen = (port, attemptsLeft = 5) => {
    const server = app.listen(port, () => console.log(`API đang chạy tại http://localhost:${port}`));
    server.on('error', (err) => {
      if (err && err.code === 'EADDRINUSE' && attemptsLeft > 0) {
        const next = port + 1
        console.warn(`Port ${port} in use; trying ${next}...`)
        tryListen(next, attemptsLeft - 1)
      } else {
        console.error('Server failed to start:', err)
        process.exit(1)
      }
    })
  }
  tryListen(BASE_PORT)
}

start();
